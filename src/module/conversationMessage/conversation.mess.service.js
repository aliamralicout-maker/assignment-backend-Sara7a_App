import { badRequestException, forbiddenException, notFoundException, unauthorizedException } from "../../common/exciptions/error.exciptions.js"
import { conversationMessageModel } from "../../database/model/conversation.message.js"
import { conversationModel } from "../../database/model/conversation.model.js"



export const sendConversationMessage = async (body, id) => {
    const { conversationId, content } = body

    console.log(body);


    if (!conversationId || !content) return badRequestException({ message: "conversationId and content is required" })
    if (!id) return unauthorizedException()

    const conversation = await conversationModel.findById(conversationId)

    if (!conversation) return notFoundException()

    const authorization = conversation.participants.some(participant => participant.toString() === id.toString())

    if (!authorization) return forbiddenException()

    const receiverId = conversation.participants.find(participant => id.toString() !== participant.toString())

    const message = await conversationMessageModel.create({ conversationId, receiverId, senderId: id, content })

    return { message: 'Send Successfully', data: message }
}


export const getConversationMessages = async (body, id) => {
    const { conversationId } = body
    if(!conversationId) return badRequestException({message: "conversationId is required"})
    if (!id) return unauthorizedException()
    const getUser = await conversationModel.findOne({ _id: conversationId })
    if (!getUser) return notFoundException()
    const authorization = getUser.participants.some(participant => participant.toString() === id.toString())
    if (!authorization) return forbiddenException()

    await conversationMessageModel.updateMany({ conversationId, receiverId: id, isRead: false }, { $set: { isRead: true } })

    const messagedata = await conversationMessageModel.find({ conversationId }).sort({ createdAt: 1 })
    if (!messagedata.length) return { message: "successfully", data: [] }

    return { message: "successfully", data: messagedata }
}
