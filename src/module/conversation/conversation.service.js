import { badRequestException, forbiddenException, notFoundException, unauthorizedException } from "../../common/exciptions/error.exciptions.js"
import { conversationModel } from "../../database/model/conversation.model.js"
import { identityRequestModel } from "../../database/model/identityRequest.model.js"
import { messageModel } from "../../database/model/message.model.js"





export const createConversation = async (body, id) => {
    // Get the identity request ID from the request body
    const { identityRequestId } = body
    // Find the identity request by its ID
    const check = await identityRequestModel.findById(identityRequestId)
    if (!check) return notFoundException()
    // Check if the current user is the one who requested the identity
    if (check.requestId.toString() !== id.toString()) return forbiddenException()
    // Allow conversation creation only if the request is accepted
    if (check.status !== 'accepted') return badRequestException()
    // Check if a conversation already exists for this identity request
    const findConversation = await conversationModel.findOne({ identityRequestId })
    if (findConversation) return badRequestException()
    // Find the original anonymous message
    const message = await messageModel.findById(check.messageId)
    if (!message) return notFoundException()
    // Ensure the requester is the original message receiver
    if (check.requestId.toString() !== message.receiverId.toString()) return forbiddenException()
    // Create a conversation between the message sender and receiver
    const conversation = await conversationModel.create({participants: [message.receiverId, message.senderId],identityRequestId,messageId: check.messageId})
    // Return an error if the conversation was not created
    if (!conversation) return badRequestException()
    // Return the created conversation
    return { message: "successfully", data: conversation }
}
