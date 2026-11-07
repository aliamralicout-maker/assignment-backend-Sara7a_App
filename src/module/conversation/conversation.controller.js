import { Router } from "express";
import { auth } from "../../common/middleware/auth.middleware.js";
import { createConversation } from "./conversation.service.js";
import { successResponse } from "../../common/exciptions/success.exciptions.js";

const router = Router()



router.post('/create-conversation', auth , async(req,res)=>{
    const data = await createConversation(req.body , req.user.id)
    successResponse({res,message: data.message , data: data.data})
})





export default router