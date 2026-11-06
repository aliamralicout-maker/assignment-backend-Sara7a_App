import { userModel } from "../../database/model/user.model.js"
import { generateCompare, generateHash } from "../../common/middleware/services/encreptio.js"
import { badRequestException, conflicException, notFoundException, unauthorizedException } from "../../common/exciptions/error.exciptions.js"
import { genaretAccessTokenFun, generatetoken } from "../../common/middleware/services/token.service.js"
import { sendEmail } from "../../common/middleware/sendEmail.js"
import { randomInt } from 'node:crypto'
import { set, get, del } from "../../database/Redis/redis.service.js"

// signUp
export const signUp = async (body, file) => {
    // get email and password from body
    const { userName, email, password, confirmPassword, age, gender, role, uniqueName } = body
    //  find user by email
    const findUser = await userModel.findOne({ email })
    // if email exists
    if (findUser) return conflicException({ message: 'email already  exists' })
    // find user by uniqueName
    const findUniqueName = await userModel.findOne({ uniqueName })
    if (findUniqueName) return conflicException({ message: "uniqueName already exists" })
    // check password
    if (confirmPassword !== password) return badRequestException({ message: "passwords do not match" })
    //  else                                              convert string to number 
    // const hashedPassword = await bcrypt.hash(password, Number(env.salt))
    const hashedPassword = await generateHash(password)
    // file image
    const imagePath = file ? file.path : null
    // OTP
    const otp = randomInt(100000, 1000000).toString()
    // create user
    const createUser = await userModel.create({ userName, email, password: hashedPassword, age, gender, role, profileImage: imagePath, uniqueName })
    // set otp in redis with 5 min ttl
    await set({ key: `otp::${createUser._id}`, value: otp, ttl: 60 * 5 })
    // sen otp to mail
    sendEmail({ to: email, subject: 'sara7aApp', html: `<h1>your otp is ${otp}</h1>` })
    // return user data 
    return { message: 'create successfully', user: createUser }
}



// Sign in
export const signIn = async (body) => {
    // Get email and password from the request body
    const { email, password } = body;
    // Find the user by email
    const findEmail = await userModel.findOne({ email });
    // Check if the email exists
    if (!findEmail) { return unauthorizedException({ message: "not found email" }) }
    // Check if the account is temporarily locked
    if (findEmail.lockUntil && findEmail.lockUntil > new Date()) {
        return unauthorizedException({ message: "account is temporarily locked" })
    }
    // Reset login attempts if the lock period has expired
    if (findEmail.lockUntil && findEmail.lockUntil <= new Date()) {
        findEmail.loginAttempts = 0;
        findEmail.lockUntil = null;
        await findEmail.save();
    }
    // Check if the user is verified
    if (!findEmail.isVerified) { return unauthorizedException({ message: "user not verified" }) }
    // Compare the entered password with the hashed password
    const comparePassword = await generateCompare(password, findEmail.password);
    // Handle incorrect password attempts
    if (!comparePassword) {
        findEmail.loginAttempts = (findEmail.loginAttempts || 0) + 1;
        // Lock the account for 5 minutes after 5 failed attempts
        if (findEmail.loginAttempts === 5) {
            findEmail.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
        }
        await findEmail.save();
        return unauthorizedException({
            message: findEmail.loginAttempts >= 5
                ? "account is temporarily locked for 5 minutes"
                : "passwords do not match"
        });
    }
    // Generate a 6-digit OTP
    const otp = randomInt(100000, 1000000).toString();
    // Store the OTP in Redis for 5 minutes
    await set({ key: `otp::${findEmail._id}`, value: otp, ttl: 60 * 5 });
    // Send the OTP to the user's email
    await sendEmail({
        to: email,
        subject: "sara7aApp",
        html: `<h1>your otp is ${otp}</h1>`
    });
    // Reset login attempts after successful password verification
    findEmail.loginAttempts = 0;
    findEmail.lockUntil = null;
    await findEmail.save();
    // Ask the user to verify the OTP before completing login
    return {
        message: "OTP sent successfully",
        nextStep: "verify-login-otp"
    };
};


// get-user-by-id
export const getUserById = async (id) => {
    // find user by id
    const userData = await userModel.findById(id)
    // if user not found
    if (!userData) return notFoundException({ message: "not found users" })
    // return user data
    return { message: `found ${userData.role == 1 ? 'admin' : 'user'}`, [userData.role == 1 ? 'admin' : 'user']: userData }
}

// genaret-Access-Token
export const genaretAccessToken = (body) => {
    const { refreshToken } = body
    // generate accessToken from refreshToken
    const { accessToken } = genaretAccessTokenFun(refreshToken)
    // if accessToken is invalid
    if (!accessToken) return badRequestException('invalid token')
    // return accessToken
    return { accessToken: accessToken }
}


// verify account
export const verfyAcount = async (body) => {
    // get otp and email from body
    const { otp, email } = body
    // find user by email
    const userData = await userModel.findOne({ email })
    // if user not found
    if (!userData) return unauthorizedException({ message: "user not found" })
    // check if user is already verified
    if (userData.isVerified) return badRequestException({ message: 'user alredy verified' })
    // get otp from redis
    const redisOtp = await get({ key: `otp::${userData._id}` })
    // compare otp with redisOtp
    if (redisOtp != String(otp)) return badRequestException({ message: "otp does not match" })
    // verify user account
    userData.isVerified = true
    // save updated user data
    await userData.save()
    // del otp
    await del({ key: `otp::${userData._id}` })
    // return user data
    return userData
}


// git all users
export const getAllUsers = async () => {
    const data = await userModel.find()
    return { message: "found all users", users: data }
}


// Verify login OTP
export const verifyLoginOtp = async (body) => {
    // Get OTP and email from the request body
    const { otp, email } = body;

    // Check if OTP and email are provided
    if (!otp || !email) {
        return badRequestException({
            message: "OTP and email are required"
        });
    }

    // Find the user by email
    const user = await userModel.findOne({ email });
    // Check if the user exists
    if (!user) {return badRequestException({message: "User not found"})}
    // Get the OTP stored in Redis
    const otpRedis = await get({key: `otp::${user._id}`})
    // Check if the OTP is valid and has not expired
    if (!otpRedis || String(otp) !== String(otpRedis)) {
        return badRequestException({message: "OTP not matched or expired"});
    }
    // Delete the OTP after successful verification
    await del({keys: `otp::${user._id}`})
    // Generate an authentication token
    const token = generatetoken(user);
    // Return the token after successful login
    return {message: "Login successfully",token}
};
