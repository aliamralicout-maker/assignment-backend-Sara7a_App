import mongoose from "mongoose";


const conversationMessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'conversation'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"user"
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"user"
    },
    content:{
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
},{timestamps: true})


export const conversationMessageModel = mongoose.model('conversationMessage', conversationMessageSchema)