const mongoose = require('mongoose');

const userScheme = mongoose.Schema({
    name: {
        type : String,
        required: [true, "provide name"]
    },
    email: {
        type : String,
        unique: true,
        required: [true, "provide email"]
    },
    password: {
        type : String,
        required: [true, "provide password"]
    },
    profile_pic: {
        type : String,
        default: ""
    }
},{
    timestamps : true
})

const UserModel = mongoose.model("User", userScheme);

module.exports = UserModel
