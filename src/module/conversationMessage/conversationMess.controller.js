import { Router } from "express";
import { getConversationMessages, sendConversationMessage } from "./conversation.mess.service.js";
import { successResponse } from "../../common/exciptions/success.exciptions.js";
import { auth } from "../../common/middleware/auth.middleware.js";

const router = Router()


router.post('/send-conversation-message' , auth , async (req,res)=>{
    const data = await sendConversationMessage(req.body , req.user.id)
    successResponse({res , message:data.message , data:data.data})
})

router.post('/get-all-messages', auth ,async (req,res)=>{
    const data = await getConversationMessages(req.body, req.user.id)
    successResponse({res , message:data.message , data:data.data})
})



export default router