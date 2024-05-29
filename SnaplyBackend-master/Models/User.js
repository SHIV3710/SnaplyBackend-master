const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required:[true,"Please enter a name"],
    },

    avatar:{
        public_id: String,
        url: String,
    },

    email: {
        type: String,
        required:[true,"Please enter a name"],
        unique:[true,"Email already in use"],
    },

    password: {
        type: String,
        required:[true,"Please enter a password"],
        minlength:[2,"Password must be at least 6 characters"],
        select: false,
    },

    posts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],

    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    following:[
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],

    resetPasswordToken:String,
    
    resetPasswordExpire:Date,
});

userSchema.pre("save", async function (next){

    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
});
//whenerver password is modified userschema get automatiocally saved
//by hashign the new password

userSchema.methods.matchPassword = async function(password){
    const res =  await bcrypt.compare(password,this.password);
    return res;
    //match the password 
    // user send a password we bcrypt it, it is same as in mongodb then password is correct
};

userSchema.methods.generateToken = async function(){
    const token = jwt.sign({_id:this._id},process.env.JWT_SECRET);
    return token;
    //generate a token using the userid
}; 

userSchema.methods.getpasswordtoken = function (){

    const resettoken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resettoken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10*60*1000;

    return resettoken;
}

module.exports = mongoose.model("User",userSchema);