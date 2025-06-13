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


// //Stripe Payment Gateway
// const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

// export const stripeWebhooks = async (request, response) => {
//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//         event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
//     } catch (error) {
//         console.error("Webhook signature verification failed:", error.message);
//         return response.status(400).send(`Webhook Error: ${error.message}`);
//     }

//     // Handle the event
//     switch (event.type) {
//         case 'payment_intent.succeeded': {
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id

//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId,
//             })

//             const { purchaseId } = session.data[0].metadata;

//             const purchaseData = await Purchase.findById(purchaseId)
//             const userData = await User.findById(purchaseData.userId)
//             const courseData = await Course.findById(purchaseData.courseId.toString())

//             courseData.enrolledStudents.push(userData)
//             await courseData.save()

//             userData.enrolledCourses.push(courseData._id)
//             await userData.save()

//             purchaseData.status = 'completed'
//             await purchaseData.save()

//             break;

//         }
//         case 'payment_intent.payment_failed': {
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id

//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId,
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
//     response.json({ received: true });
// };



const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
// Replace your current webhook with this temporarily to debug
export const stripeWebhooks = async (req, res) => {


    console.log('\n=== WEBHOOK CALLED ===');

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('Event type:', event.type);
        console.log('Event ID:', event.id);
    } catch (error) {
        console.error("Webhook signature verification failed:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Log ALL events to see what's coming through
    console.log('Received event:', event.type);

    switch (event.type) {
        case 'payment_intent.succeeded': {
            console.log('\n--- PAYMENT SUCCESS EVENT ---');
            const paymentIntent = event.data.object;
            console.log('Payment Intent ID:', paymentIntent.id);

            try {
                // Check if we can find the session
                const sessions = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                    limit: 1
                });

                console.log('Sessions found:', sessions.data.length);

                if (sessions.data.length > 0) {
                    const session = sessions.data[0];
                    console.log('Session ID:', session.id);
                    console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));

                    if (session.metadata && session.metadata.purchaseId) {
                        const purchaseId = session.metadata.purchaseId;
                        console.log('Purchase ID from metadata:', purchaseId);

                        // Test database connection first
                        console.log('\n--- TESTING DATABASE ---');
                        const totalPurchases = await Purchase.countDocuments();
                        console.log('Total purchases in database:', totalPurchases);

                        // Try to find the specific purchase
                        console.log('Looking for purchase with ID:', purchaseId);
                        const purchaseData = await Purchase.findById(purchaseId);
                        console.log('Purchase found:', purchaseData ? 'YES' : 'NO');

                        if (!purchaseData) {
                            // Show some recent purchases to compare IDs
                            const recentPurchases = await Purchase.find().sort({ createdAt: -1 }).limit(5);
                            console.log('Recent purchases:');
                            recentPurchases.forEach((purchase, index) => {
                                console.log(`${index + 1}. ID: ${purchase._id}, Status: ${purchase.status}, Created: ${purchase.createdAt}`);
                            });
                        } else {
                            console.log('Purchase details:');
                            console.log('- ID:', purchaseData._id);
                            console.log('- Status:', purchaseData.status);
                            console.log('- User ID:', purchaseData.userId);
                            console.log('- Course ID:', purchaseData.courseId);

                            // Test if we can update the purchase
                            purchaseData.status = 'completed';
                            await purchaseData.save();
                            console.log('✅ Purchase status updated to completed');
                            const userData = await User.findById(purchaseData.userId)
                            const courseData = await Course.findById(purchaseData.courseId.toString())
                            courseData.enrolledStudents.push(userData)
                            await courseData.save()

                            userData.enrolledCourses.push(courseData._id)
                            await userData.save()
                        }
                    } else {
                        console.log('❌ No purchaseId in session metadata');
                        console.log('Available metadata keys:', Object.keys(session.metadata || {}));
                    }
                } else {
                    console.log('❌ No sessions found for payment intent');
                }

            } catch (error) {
                console.error('Error processing webhook:', error.message);
                console.error('Error stack:', error.stack);
            }

            break;
        }

        case 'checkout.session.completed': {
            console.log('\n--- CHECKOUT SESSION COMPLETED ---');
            const session = event.data.object;
            console.log('Session ID:', session.id);
            console.log('Payment status:', session.payment_status);
            console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));

            if (session.payment_status === 'paid' && session.metadata && session.metadata.purchaseId) {
                const purchaseId = session.metadata.purchaseId;
                console.log('Processing purchase ID:', purchaseId);

                try {
                    const purchaseData = await Purchase.findById(purchaseId);
                    if (purchaseData) {
                        purchaseData.status = 'completed';
                        await purchaseData.save();
                        console.log('✅ Purchase completed via checkout.session.completed');
                    } else {
                        console.log('❌ Purchase not found in checkout.session.completed');
                    }
                } catch (error) {
                    console.error('Error in checkout.session.completed:', error.message);
                }
            }

            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    console.log('=== WEBHOOK END ===\n');
    res.json({ received: true });
};