import User from "../models/userModel.js"
import Stripe from "stripe";
import Course from "../models/courseModel.js";
import { Purchase } from "../models/purchase.js";
import { CourseProgress } from "../models/courseProgress.js";


//Get User Data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId)
        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }
        res.json({ success: true, user })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// User enrolled courses with lecture links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}



//Purchase Course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        const userId = req.auth.userId;

        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (!userData || !courseData) {
            return res.json({ success: false, message: "Data Not Found" });
        }

        // Calculate discounted price
        const discountedAmount = courseData.coursePrice * (1 - courseData.discount / 100);
        const roundedAmount = Math.round(discountedAmount * 100) / 100;

        // Create Purchase entry
        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: roundedAmount,
        };
        const newPurchase = await Purchase.create(purchaseData);

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = process.env.CURRENCY.toLowerCase();

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle,
                },
                unit_amount: Math.floor(newPurchase.amount) * 100, // in cents
            },
            quantity: 1,
        }];

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString(),
            },
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })
        if (progressData) {
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture is already completed' })
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        } else {
            await CourseProgress.create({
                userId, courseId, lectureCompleted: [lectureId]
            })
        }
        res.json({ success: true, message: 'Progress Updated' })
    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}

//Get User Course Progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId } = req.body
        const progressData = await CourseProgress.findOne({ userId, courseId })
        res.json({ success: true, progressData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


//Add User Ratings to Course
export const addUserRating = async (req, res) => {
    const userId = req.auth.userId
    const { courseId, rating } = req.body

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'Invalid Details' })
    }

    try {
        const course = await Course.findById(courseId)
        if (!course) {
            return res.json({ success: false, message: 'Course Not Found' })
        }

        const user = await User.findById(userId)
        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' })
        }

        const existingRatinIndex = course.courseRatings.findIndex(r => r.userId === userId)
        if (existingRatinIndex > -1) {
            course.courseRatings[existingRatinIndex].rating = rating;
        } else {
            course.courseRatings.push({ userId, rating })
        }
        await course.save();
        res.json({ success: true, message: "Rating Added" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


