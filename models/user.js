import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/miniProject").then(()=>
{
    console.log("Mongodb Connected...");
});

const  userSchema = mongoose.Schema({
    username:String,
    name:String,
    age:Number,
    email:String,
    password:String,
    posts: [{type: mongoose.Schema.Types.ObjectId,
                ref:"post"
    }]
})
let userModel = mongoose.model("user",userSchema);

export default userModel;