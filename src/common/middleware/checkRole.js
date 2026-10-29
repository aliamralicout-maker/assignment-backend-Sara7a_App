import { unauthorizedException } from "../exciptions/error.exciptions.js";


export const checkRole = (roles) => {
    return (req, res, next) => {
console.log(roles,' ', req.user?.aud)
        if (roles.includes(req.user.aud)) {
            next()
        } else {
            return unauthorizedException({ message: "you are not authorized to access this route" })
        }
    }
}