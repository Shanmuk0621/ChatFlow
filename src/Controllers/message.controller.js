import Message from "../Models/message.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import User from '../Models/user.model.js'
import {socketList} from '../app.js'
import {uploadOnCloudinary} from "../Utils/Cloudinary.js"
import { response } from "express";
import { isValidObjectId } from "mongoose";
import { log } from "console";


const getAllusers = asyncHandler(async (req,res)=>
{
    console.log("get all users called");
    
    const allUsers = await User.find({ _id: { $ne: req.user._id } }).select("-password -refreshToken");

    const unSeenMessages = {}

    const messages = await Message.find({sender:{$ne:req.user._id}})  

    messages.forEach((mes)=>
    {
        if (mes.receiver.toString() === req.user._id.toString())
        {
            if (mes.unseen)
            {
                if (unSeenMessages[mes.sender.toString()])
                {
                    unSeenMessages[mes.sender.toString()]+=1
                }
                else
                {
                    unSeenMessages[mes.sender.toString()] = 1
                }
            }
        }
    })


    res
    .status(200)
    .json(new ApiResponse(200,{allUsers,unSeenMessages},"Users fetched successfully and unseen count sent"))

}
)

const getAllMessagesOfUser = asyncHandler(async (req,res)=>
{   
    const receiverId = req.params.id
    const currentUserId = req.user._id

    const messages = await Message.find(
        {
            $or:[
                {sender:currentUserId,receiver:receiverId},
                {sender:receiverId,receiver:currentUserId  }

            ]
        }
    )
    .sort({createdAt:1})
    .lean()
    .populate("sender","userName")
    .populate("receiver","userName")   

    return res.status(200)
    .json(new ApiResponse(200,messages))
    
    // console.log(isValidObjectId(req?.params?.id));
    // res.send("hai")
    
})

const sendMessage = asyncHandler(async (req,res)=>
{
    const content = req.body.Content;
    console.log("send msgs content ",req.body);
    console.log("content tttttttttttttttttt",content);
    
    const {id:receiverId} = req.params
    console.log(req.params);
    

    const senderId = req.user._id   

    let sendingPhotoLocalPath

    if (req.files && Array.isArray(req.files.sendingPhoto) && req.files.sendingPhoto.length > 0 )
    {
        sendingPhotoLocalPath = req.files.sendingPhoto[0].path
    }

    const sendingPhoto = await uploadOnCloudinary(sendingPhotoLocalPath)

    const sendingmessage = await Message.create(
        {
            content:content? content : "",
            sender:senderId,
            receiver:receiverId,
            photo:sendingPhoto?.url || ""
        }
    )

    if (!sendingmessage) throw new ApiError(500,"Failed to send message")

    // if (socketList[receiverId])
    // {
    //     io.to(socketList[receiverId]).emit("message",sendingmessage)
    // }

    return res
    .status(200)
    .json(
        new ApiResponse(200,sendingmessage,"Message sent successfully")
    )

})

const editMessage = asyncHandler(async (req, res) => {
    const { id:messageId } = req.params;
    const { content } = req.body;

    console.log("meaage id is",messageId);
    

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required and cannot be empty");
    }

    const existingMessage = await Message.findById(messageId);
    if (!existingMessage) {
        throw new ApiError(404, "Message not found");
    }


    
    const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { content: content },
        { new: true }
    );

    if (!updatedMessage) {
        throw new ApiError(500, "Failed to edit message");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedMessage, "Message edited successfully"));
});


const deleteMessage = asyncHandler(async (req,res)=>
{
    const {id:messageId} = req.params

    console.log("trying to delete ",messageId);
    


    const deletingMessage = await Message.findByIdAndDelete(messageId)

    if (!deletingMessage) throw new ApiError(500,"Failed to delete message")

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Message deleted successfully"))
})

export 
{
    getAllusers,
    getAllMessagesOfUser,
    sendMessage,
    editMessage,
    deleteMessage
}