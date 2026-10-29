import { notFoundException } from "../../common/exciptions/error.exciptions.js"
import { messageModel } from "../../database/model/message.model.js"
import { userModel } from "../../database/model/user.model.js"


// Function responsible for retrieving all messages from the database
export const getAllMessages = async () => {
    // Fetch all message documents from the database
    const messages = await messageModel.find()
    // Check if no messages were found
    if (messages.length == 0)return notFoundException({ message: "not found messages" })
    // Return a success message along with all retrieved messages
    return { message: "found messages", messages }
}

// Function responsible for sending a new message
export const sendMessage = async (body, file) => {
    // Extract the message content and receiver's ID from the request body
    const { content, receiverId } = body
    // Get the uploaded image path, or undefined if no file was uploaded
    const image = file?.path
    // Check that both the message content and receiver ID are provided
    if (!content || !receiverId) return notFoundException({ message: "content and receiverId are required" })
    // Find the receiver in the database using their ID
    const existedUser = await userModel.findById(receiverId)
    // Stop the operation if the receiver does not exist
    if (!existedUser) return notFoundException({ message: "user not found" })
    // Create a new message in the database with its content, receiver, and optional image
    const message = await messageModel.create({ content, receiverId, image })
    // Check whether the message was created successfully
    if (!message) return notFoundException({ message: "message not sent" })
    // Return a success message along with the created message data
    return { message: "message sent successfully", message }
}


// Function responsible for generating a unique URL for a user
export const getUserUrl = async (userId) => {
    // Find the user in the database using their ID
    const user = await userModel.findById(userId.id)
    // Stop the operation and return an error if the user does not exist
    if (!user) return notFoundException({ message: "user not found" })
    // Generate the user's URL using their unique username
    const url = `https://sara7s/${user.uniqueName}`
    // Return a success message along with the generated URL
    return { message: "user url found successfully", url }
}

// Function responsible for finding a user using their URL
export const getUserByUrl = async (body) => {
    // Extract the URL from the request body
    const { url } = body
    // Check whether the URL was provided
    if (!url) return notFoundException({ message: "url is required" })
    // Extract the unique username from the last part of the URL
    const uniqueName = url.split('/').pop()
    // Find the user in the database using their unique username
    const user = await userModel.findOne({ uniqueName })
    // Stop the operation and return an error if the user does not exist
    if (!user) return notFoundException({ message: "user not found" })
    // Return a success message along with the user's data
    return { message: "user messages found successfully", user }
}

// Function responsible for retrieving all messages received by a specific user
export const getUserMessages = async (userId) => {
    // Find all messages where the receiver ID matches the user's ID
    const messages = await messageModel.find({ receiverId: userId.id })
    // Check if the query returned an empty array
    if (messages.length == 0) return notFoundException({ message: "user not found" })
    // Return a success message along with the retrieved messages
    return { message: 'found messages', messages }
}