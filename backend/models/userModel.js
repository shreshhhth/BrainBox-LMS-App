import express from 'express'
import mongoose from 'mongoose'

//Creating user Scheme for the User Model
const userSchema =  new mongoose.Schema({
    _id:{type:String, required:true},
    name:{type:String, required:true},
    email:{type:String, required:true},
    imageUrl:{type:String, required:true}, 
    enrolledCourses:[
        {type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ]  
}, {timestamps:true})

//Creating Model using this Schema  
const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User;