import mongoose from "mongoose";



const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    }
}, { timestamps: true })

export const messageModel = mongoose.model('messages', messageSchema)