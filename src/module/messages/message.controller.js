import { Router } from "express";
import { getAllMessages, sendMessage, getUserUrl, getUserByUrl, getUserMessages } from "./message.service.js";
import { successResponse } from "../../common/exciptions/success.exciptions.js";
import { checkRole } from "../../common/middleware/checkRole.js";
import { auth } from "../../common/middleware/auth.middleware.js";
import { upload } from "../../common/middleware/multer.js";


const router = Router()


router.get('/get-all-messages', async (req, res) => {
    const data = await getAllMessages()
    successResponse({ res, messaege: data.messages, data:data.messages })
})

router.post('/send-message', auth ,upload().single('image'), async (req, res) => {
    const data = await sendMessage(req.body, req.file, req.user?.id)
    successResponse({ res, message: data.message })
})

router.get('/user-url', auth, async (req, res) => {
    const data = await getUserUrl(req.user)
    successResponse({ res, message: data.message, data: data.url })
})

router.get('/get-user-by-url', async (req, res) => {
    const data = await getUserByUrl(req.body)
    successResponse({ res, message: data.message, data: data.user })
})

router.get('/user-messages', auth, async (req, res) => {
    const data = await getUserMessages(req.user)
    successResponse({ res, message: data.message, data: data.messages })
})



export default router