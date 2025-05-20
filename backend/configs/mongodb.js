import mongoose from 'mongoose'

//Connect to the mongoDB Database
const connectDb = async () => {
    mongoose.connection.on('connected', ()=>console.log('DataBase Connected'))
    await mongoose.connect(`${process.env.MONGODB_URI}/BrainBox`)
}

export default connectDb;