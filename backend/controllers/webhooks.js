import { Webhook } from "svix";
import User from "../models/userModel.js";
import Stripe from "stripe";
import { Purchase } from "../models/purchase.js";
import Course from "../models/courseModel.js";

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
                    email: data.email_addresses[0].email_address,
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


//Stripe Payment Gateway
// const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

// export const stripeWebhooks = async (request, response) => {
//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//         event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//     }
//     catch (err) {
//         return response.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     //Handle Error
//     switch (event.type) {
//         case 'payment_intent.succeeded': {
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;


//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId,
//             })

//             if (!session.data.length) {
//                 console.error("No checkout session found for paymentIntent:", paymentIntentId);
//                 return response.status(404).json({ error: "Session not found" });
//             }

//             const { purchaseId } = session.data[0].metadata;

//             const purchaseData = await Purchase.findById(purchaseId);
//             const userData = await User.findById(purchaseData.userId);
//             const courseData = await Course.findById(purchaseData.courseId.toString());

//             //Update
//             courseData.enrolledStudents.push(userData)
//             await courseData.save()

//             userData.enrolledCourses.push(courseData._id)
//             await userData.save()

//             purchaseData.status = 'completed'
//             await purchaseData.save();

//             break;
//         }
//         case 'payment_intent.payment_failed': {
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;


//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId
//             })

//             const { purchaseId } = session.data[0].metadata;

//             const purchaseData = await Purchase.findById(purchaseId)
//             purchaseData.status = 'failed'
//             await purchaseData.save()

//             break;
//         }
//         // ... handle other event types
//         default:
//             console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a response to acknowledge receipt of the event
//     return response.json({ received: true });
// }










// Stripe webhook handler
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
    console.log("🔔 Stripe webhook triggered");

    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("✅ Verified Stripe event:", event.type);
    } catch (err) {
        console.error("❌ Stripe webhook verification failed:", err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            console.log("💰 PaymentIntent succeeded:", paymentIntentId);

            const sessionList = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            if (!sessionList.data.length) {
                console.error("❌ No Checkout Session found for PaymentIntent:", paymentIntentId);
                return response.status(404).json({ error: "Checkout session not found" });
            }

            const session = sessionList.data[0];
            const { purchaseId } = session.metadata || {};

            console.log("📦 purchaseId from metadata:", purchaseId);

            const purchaseData = await Purchase.findById(purchaseId);
            if (!purchaseData) {
                console.error("❌ Purchase not found for ID:", purchaseId);
                return response.status(404).json({ error: "Purchase not found" });
            }

            const userData = await User.findById(purchaseData.userId);
            const courseData = await Course.findById(purchaseData.courseId.toString());

            if (!userData || !courseData) {
                console.error("❌ User or Course not found");
                return response.status(404).json({ error: "User or Course not found" });
            }

            if (!courseData.enrolledStudents.includes(userData._id)) {
                courseData.enrolledStudents.push(userData._id);
                await courseData.save();
            }

            if (!userData.enrolledCourses.includes(courseData._id)) {
                userData.enrolledCourses.push(courseData._id);
                await userData.save();
            }

            purchaseData.status = 'completed';
            await purchaseData.save();

            console.log("✅ Purchase marked as completed:", purchaseId);
            break;
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const sessionList = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const session = sessionList.data[0];
            const { purchaseId } = session.metadata || {};

            const purchaseData = await Purchase.findById(purchaseId);
            if (purchaseData) {
                purchaseData.status = 'failed';
                await purchaseData.save();
                console.log("❌ Payment failed. Purchase updated:", purchaseId);
            }

            break;
        }

        default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    response.json({ received: true });
};