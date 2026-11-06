import express from 'express'
import { databaseConnection } from './database/connections.js'
import { env } from './config/env.service.js'
import authRouter from '../src/module/auth/auth.controller.js'
import messasgeRouter from './module/messages/message.controller.js'
import identityRequestRouter from './module/identityRequest/identityRequest.controller.js'
import { redisConnection } from './database/Redis/redis.connection.js'

import { fileURLToPath } from 'node:url';
import path from 'path'

// Read file upload configuration
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadPath = path.resolve(__dirname, '../uploads')

const app = express()
app.use(express.json())
app.use('/auth', authRouter)
app.use('/messages', messasgeRouter)
app.use('/identity-requests', identityRequestRouter)
app.use('/uploads',express.static(uploadPath))

databaseConnection()
await redisConnection()


// handel Error
app.use((err,req,res,next)=>{
    const stack = env.mode === 'dev' ? err.stack : null
    res.status(err.cause?.status || 500).json({message: err.message , stack , extra: err.cause?.extra})
})

app.listen(env.port , ()=>{
    console.log({message: `server is runing in port ${env.port}`});
}) 