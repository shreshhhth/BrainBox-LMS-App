import { clerkClient } from "@clerk/express";

//Middleware (to protect educator route)

export const protectEducator = async (req, res, next) => {
    try {
        //getting the user Id from the request
        const userId = req.auth.userId
        //Finding the user in the clerk using this userId
        const response = await clerkClient.users.getUser(userId)
        //checking if the user we get is educator or not?
        if (response.publicMetadata.role !== 'educator') {
            return res.json({ success: false, message: 'Unauthorized Access' })
        }
        next()

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}