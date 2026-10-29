import z, { object } from 'zod'
import { genderEnum, roleEnum } from '../../common/enums/enum.js'


export const userLoginSchema = z.strictObject({
    email: z.string().email(),
    password: z.string().min(4)
})


export const userRegisterSchema = z.strictObject({
    userName: z.string(),
    email: z.string().email(),
    password: z.string().min(4),
    confirmPassword: z.string().min(4),
    age: z.coerce.number().int().min(1).max(90),
    gender: z.coerce.number().pipe(z.union([z.literal(genderEnum.male) , z.literal(genderEnum.female)])),
    role: z.coerce.number().pipe(z.union([z.literal(roleEnum.user),z.literal(roleEnum.admin)])),
    uniqueName: z.string().min(3).max(20)
}).refine((data)=> data.confirmPassword === data.password ,{message: "Passwords do not match" , path:["confirmPassword"]})

