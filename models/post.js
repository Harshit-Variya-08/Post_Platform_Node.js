import mongoose from "mongoose";


const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "user"
  },
    date : 
    {
        type : Date,
        default: Date.now
    },
    content : String,

    likes : [
        {type : mongoose.Schema.Types.ObjectId , ref : "user"}
    ]
});

let postModel = mongoose.model("post",postSchema);
export default postModel;