import { badRequestException, forbiddenException, notFoundException } from "../../common/exciptions/error.exciptions.js"
import { identityRequestModel } from "../../database/model/identityRequest.model.js"
import { messageModel } from "../../database/model/message.model.js"
import { userModel } from "../../database/model/user.model.js"


export const requestSenderIdentity = async (body, requestId) => {
    const { messageId } = body

    if (!messageId || !requestId) return notFoundException({ message: "messageId and requestId are required" })

    const message = await messageModel.findById(messageId)
    if (!message) return notFoundException({ message: "message not found" })

    if (message.receiverId != requestId) return badRequestException({ message: "you not requester" })

    const existingRequest = await identityRequestModel.findOne({ messageId, requestId })
    if (existingRequest) return badRequestException({ message: "You have already requested the identity of this message sender" })

    const request = await identityRequestModel.create({ messageId, requestId })

    return {
        message: "Identity request created successfully",
        data: request
    }
}


export const respondToIdentityRequest = async (params, body, id) => {
    const { action } = body
    const { requestId } = params

    if (!requestId || !action) { return badRequestException({ message: "Request ID and action are required" }) }

    if (action !== 'rejected' && action !== 'accepted') {
        return badRequestException({ message: "Invalid action. Action must be either 'accepted' or 'rejected'" })
    }

    const request = await identityRequestModel.findOne({ requestId })
    if (!request) { return notFoundException({ message: "Identity request not found" }) }

    const message = await messageModel.findById(request.messageId).select('userName uniqueName profileImage')
    if (!message) { return notFoundException({ message: "Original message not found" }) }

    if (message.senderId.toString() !== id.toString()) {
        return notFoundException({ message: "You are not authorized to respond to this identity request" })
    }

    if (request.status !== 'pending') {
        return badRequestException({ message: "This identity request has already been processed" })
    }

    if (action === 'rejected') {
        request.status = 'rejected'
        await request.save()
        return { message: "Identity request rejected successfully" }
    }

    const user = await userModel.findById(message.senderId)
    if (!user) { return notFoundException({ message: "Sender not found" }) }

    request.status = 'accepted'
    await request.save()

    return { message: "Identity request accepted successfully", data: user }
}