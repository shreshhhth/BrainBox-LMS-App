import { Webhook } from "svix";
import User from "../models/userModel.js";

//API controller function to manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
    try {
        {/*-------------------------------Instantiating the webhook for Authenticity------------------------------------------------- */ }
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        {/*------------------------------ To check if webhook is valid and not tampered with----------------------------------*/ }
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })
        {/*-------------------------------Destructuring the data and type from the webhook payload----------------------------*/ }
        const { data, type } = req.body;
        {/*-------------------------------Handling different webhook Types----------------------------------------------------*/ }
        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_address[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.create(userData)
                res.json({})
                break;
            }
            case 'user.updated': {
                const userData = {
                    email: data.email_address[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData)
                res.json({})
                break;
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
            }

            default:
                break;
        }
    } catch (error) {
        res.json({ succes: false, message: error.message })
    }
}