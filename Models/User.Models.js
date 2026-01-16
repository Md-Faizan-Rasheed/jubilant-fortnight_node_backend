const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    company_name: {
        type: String,
        required: true,
        trim: true, // Removes leading and trailing spaces
    },
    years_old: {
        type: Number, // Changed to Number for better validation
        required: true,
        min: 0, // Ensures the number is non-negative
    },
    field_of_work: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate email entries
        trim: true,
        match: [/.+@.+\..+/, "Please enter a valid email address"], // Basic email validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Ensures the password has a minimum length
    },
    emp_size:{
        type:Number,
        required:true,
        min:0 // Ensures the number is non-negative

    },
    interviewIntroVideo:{
        type:String,
    },
    companyLocation:{
        type:String,
    },
    city:{
        type:String,
    },
    state:{
        type:String,
    },

}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically

module.exports = mongoose.model('users', UserSchema);
