import mongoose, { model, Schema } from "mongoose";
import { status } from "../../common/enums/enum.js";



const identityRequestSchema = new Schema({
        messageId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "messages"
        },
        requestId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'user'
        },
        status: {
                type: String,
                enum: Object.values(status),
                default: status.pending
        }
}, { timestamps: true })


export const identityRequestModel = model('identity', identityRequestSchema)