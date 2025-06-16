import { clerkClient } from '@clerk/express'
import Course from '../models/courseModel.js'
import { v2 as cloudinary } from 'cloudinary'
import { Purchase } from '../models/purchase.js'
import User from '../models/userModel.js'


//For updating user role to Educator
export const updateRoleToEducator = async (req, res) => {
    console.log("Updating role to educator...") // Debugging line;

    try {
        const userId = req.auth.userId
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            }
        })
        res.json({ success: true, message: 'You can publish a course now!' })
    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}

//Controller function for adding course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail not attached' });
        }

        const parsedCourseData = JSON.parse(courseData);

        // Upload image first to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        parsedCourseData.courseThumbnail = imageUpload.secure_url;

        // Add educator ID
        parsedCourseData.educator = educatorId;

        // Now save the course with thumbnail and educator
        const newCourse = await Course.create(parsedCourseData);

        res.json({ success: true, message: 'Course Added', course: newCourse });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


//Get educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        //Getting the educator Id from req
        const educator = req.auth.userId;
        //Finding Courses
        const courses = await Course.find({ educator });
        res.json({ success: true, courses })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });

    }
}

//Get Educator Dashboard Data (Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;
        //To calculate total earning we need the id of each courses
        const courseIds = courses.map((course) => course._id);
        //Calculating total earning
        const purchases = await Purchase.find({
            courseId: { $in: courseIds }, status: 'completed'
        })
        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
        //After getting the total earnings, collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = []
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl')
            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                })
            })
        }
        res.json({
            success: true, dashboardData: {
                totalEarnings, enrolledStudentsData, totalCourses
            }
        })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })

    }
}

//Get enrolled students data with purchase Data
export const getenrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        //Fetching all the courses created by educator
        const courses = await Course.find({ educator })
        //getting those course Ids
        const courseIds = courses.map((course) => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }))
        res.json({ success: true, enrolledStudents })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
