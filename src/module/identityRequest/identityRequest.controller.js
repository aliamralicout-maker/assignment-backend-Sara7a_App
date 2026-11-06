import { Router } from "express";
import { successResponse } from "../../common/exciptions/success.exciptions.js";
import { auth } from "../../common/middleware/auth.middleware.js";
import { requestSenderIdentity, respondToIdentityRequest } from "./identityRequest.service.js";

const router = Router()


router.post("/", auth, async (req, res) => {
    const data = await requestSenderIdentity(req.body, req.user?.id)
    successResponse({ res, message: data.message, data: data.user })
})

router.patch('/respond-to-identity-request/:requestId', auth, async (req, res) => {
    const data = await respondToIdentityRequest(req.params, req.body, req.user.id)
    successResponse({ res, message: data.message, data: data.data })
})




export default router