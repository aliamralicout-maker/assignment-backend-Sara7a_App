import mongoose, { model, Schema } from "mongoose";


const conversationSchema = new Schema({
    participants: {
        type: [
            {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "user"
            }
        ],
        validate: {
            validator: function (val) {
                return val.length === 2 && val[0].toString() !== val[1].toString()
            },
            message: "Conversation must have exactly 2 different participants"
        }
    },
    identityRequestId: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'identity'
    },
    messageId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'messages'
    }
}, { timestamps: true })



export const conversationModel = model('conversation', conversationSchema)