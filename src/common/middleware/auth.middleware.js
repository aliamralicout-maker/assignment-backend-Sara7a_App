import jwt from 'jsonwebtoken'
import { env } from '../../config/env.service.js'
import { badRequestException } from '../exciptions/error.exciptions.js'

export const auth = (req, res, next) => {
    if (!req.headers.authorization) throw badRequestException({ message: "token is required" })

    const [flag, token] = req.headers.authorization.split(" ")

    switch (flag) {
        // basic token
        case "Basic":
            const basicData = Buffer.from(token, 'base64').toString()
            let [email, password] = basicData.split(":")
            break;
        // bearer token
        case "Bearer":
            const decoded = jwt.decode(token)
            let signature;
            // if admin or user
            switch (decoded.aud) {
                case 'admin':
                    signature = env.AdminSignature
                    break;
                case 'user':
                    signature = env.UserSignature
                    break;
            }
            const decodedData = jwt.verify(token, signature)
            if (decodedData) {
                req.user = decodedData
                next()
            } else {
                throw badRequestException({ message: 'invalid token' })
            }
        default:
            break;
    }
}