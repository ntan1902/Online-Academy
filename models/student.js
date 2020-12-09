const mongoose = require("mongoose");
const validator = require('validator');

const StudentSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique: true, //email is primary key
        trim: true, //delete space
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email');
            }
        }
    },

    name: {
        type: String,
        required:true,
    },

    password: {
        type: String,
        required: true,
        trim: true,
        //minlength: 6
    }

    
})

const Student = mongoose.model('Students', StudentSchema)

module.exports = Student
