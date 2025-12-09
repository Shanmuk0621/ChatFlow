import mongoose from "mongoose";


const messageSchema = new mongoose.Schema(
    {
        content:
        {
            type:String,
            // required:true
        },
        sender:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        receiver:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        photo:
        {
            type:String // cloudinary url
        },
        unseen:
        {
            type:Boolean,
            default:true
        }
    },
    {
        timestamps:true
    }
)


const Message = mongoose.model("Message",messageSchema)

export default Message