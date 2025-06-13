import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoute.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoute.js'

const app = express()

//Connect to the Database
await connectDb()
await connectCloudinary()


//Routes
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)
app.get('/', (req, res) => { res.send("API Working") })
app.post('/clerk', express.json(), clerkWebhooks)

//Middlewares
app.use(cors())
app.use(clerkMiddleware())
// ------------------- Application Routes -------------------
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);



//Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})