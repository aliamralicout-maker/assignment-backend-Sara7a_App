
import nodemailer from 'nodemailer'
import { env } from '../../config/env.service.js'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.userMail,
        pass: env.passwordMail
    }
})

export const sendEmail = async ({ to, subject, html }) => {
    return await transporter.sendMail({
        from: 'sara7sApp',
        to,
        subject,
        html
    })
}
