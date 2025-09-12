import mongoose from "mongoose";
import { decrypt, encrypt } from "../../../utils/encryption.utils.js";
import { compareSync, hashSync } from "bcrypt";
import users from "../../../db/models/users.model.js";
import { emitter } from "../../../utils/send-email.utils.js";
import { v4 as uuIdv4 } from "uuid";
import { customAlphabet } from "nanoid"
import { generateToken, verifyToken } from "../../../utils/token.utils.js";
import blackListedTokens from "../../../db/models/black-listed-token.model.js";
import messages from "../../../db/models/messages.model.js";
import { deleteFileFromCloudinary, uploadFileOneCloudinary } from "../../../common/services/cloudinary.service.js";
const uniqueString = customAlphabet('123456789abcdef', 5)


export const signUpRegister = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { firstName, lastName, email, password, age, gender, phoneNumber } = req.body;
    const isEmailExist = await users.findOne({ email }).session(session);
    if (isEmailExist) {
        return res.status(409).json({ message: "Email already exist" })
    }
    const encryptedPhone = encrypt(phoneNumber);
    const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS)
    const otp = uniqueString();
    const user = await users.create([{
        firstName,
        lastName,
        age,
        gender,
        email,
        password: hashedPassword,
        phoneNumber: encryptedPhone,
        otps: { confirmation: hashSync(otp, +process.env.SALT_ROUNDS) }
    }], { session })
    emitter.emit('sendEmail', {
        to: email,
        subject: 'Confirmation Email',
        content: `Your Confirmation OTP is :${otp} `,

    })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({ message: "User created successfully", user })
}

export const confirmEmailService = async (req, res) => {
    const { email, otp } = req.body;
    const user = await users.findOne({ email })
    if (!user) {
        return res.status(400).json({ message: "User not found or already confirmed" })

    };
    const isOtpMatch = compareSync(otp, user.otps.confirmation)
    if (!isOtpMatch) {
        return res.status(404).json({ message: "Invalid OTP" })
    };
    user.isConfirmed = true;
    user.otps.confirmation = null;

    await user.save()

    return res.status(200).json({ message: "User signed in successfully", user })
}

export const signInService = async (req, res) => {
    const { email, password, deviceId } = req.body
    const user = await users.findOne({ email })
    if (!user) {
        return res.status(404).json({ message: "Invalid email or password" })
    }
    if (!password || !user.password) {
        return res.status(400).json({ message: "Password is required" });
    }
    const isPasswordMatch = compareSync(password, user.password)
    if (!isPasswordMatch) {
        return res.status(404).json({ message: "Invalid email or password" })
    }
    const existingDevice = user.devices.find(d => d.deviceId === deviceId)
    if (!existingDevice && user.devices.length >= 2) {
        return res.status(403).json({ message: "You can only be logged in on 2 devices" });
    }
    const accessToken = generateToken(
        { _id: user._id, email: user.email, deviceId },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRE_IN,
            jwtid: uuIdv4()
        }
    )
    const refreshToken = generateToken(
        { _id: user._id, email: user.email, deviceId },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRE_IN,
            jwtid: uuIdv4()
        }
    )
    if (!existingDevice) {
        user.devices.push({ deviceId, tokenId: accessToken })
    } else {
        existingDevice.tokenId = accessToken;
        existingDevice.createdAt = new Date()
    }
    await user.save()
    return res.status(200).json({ message: "User signed in successfully", accessToken, refreshToken })
}


export const updateAccountService = async (req, res) => {
    const { _id } = req.loggedInUser;
    const { firstName, lastName, age, gender, email, password, phoneNumber } = req.body

    const user = await users.findById(_id)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (password) {
        user.password = hashSync(password, +process.env.SALT_ROUNDS)
    }
    if (phoneNumber) {
        user.phoneNumber = encrypt(phoneNumber)
    }
    if (email) {
        const isEmailExist = await users.findOne({ email });
        if (isEmailExist) {
            return res.status(409).json({ message: "User already exists" });
        }
        const otp = uniqueString();
        user.email = email;
        user.isConfirmed = false;
        user.otps.confirmation = hashSync(otp, +process.env.SALT_ROUNDS)
        emitter.emit('sendEmail', {
            to: email,
            subject: 'Confirmation Email',
            content: `Your Confirmation OTP is :${otp} `,
        })
    }
    await user.save();
    return res.status(201).json({ message: "User updated successfully", user })
}

export const listUserService = async (req, res) => {
    let allUsers = await users.find()
    allUsers = allUsers.map((user) => {
        return {
            ...user._doc,
            phoneNumber: decrypt(user.phoneNumber)
        }
    })
    res.status(200).json({ allUsers });
}

export const refreshTokenService = async (req, res) => {
    const { refreshtoken } = req.headers;
    if (!refreshtoken) {
        return res.status(404).json({ message: "Refresh token is required" })
    }
    const decodedData = verifyToken(refreshtoken, process.env.JWT_Refresh_SECRET)
    const accessToken = generateToken(
        { _id: decodedData._id, email: decodedData.email },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRE_IN,
            jwtid: uuIdv4()
        }
    )
    return res.status(201).json({ message: "User token is refreshed successfully", accessToken })
}

export const logOutService = async (req, res) => {
    const { _id, tokenId, expirationDate } = req.loggedInUser;

    await blackListedTokens.create({
        tokenId,
        expirationDate: new Date(expirationDate * 1000),
        userId: _id
    })
    return res.status(201).json({ message: "User logged out successfully" })
}

export const deleteAccountService = async (req, res) => {
    const { _id } = req.loggedInUser
    const user = await users.findById(_id)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    await messages.deleteMany({ receiverId: _id })
    await users.findByIdAndDelete(_id)
    if (user.profilePicture?.public_id) {
        await deleteFileFromCloudinary(user.profilePicture.public_id);
    }
    return res.status(201).json({ message: "User deleted successfully" })
}  


export const uploadProfileService = async (req, res) => {
    const { _id } = req.loggedInUser
    const { path } = req.file

    const uploadResult = await uploadFileOneCloudinary(path, {
        folder: 'saraha_app/Users/profiles',
        use_filename: true
    })
    const user = await users.findByIdAndUpdate(_id, {
        profilePicture: {
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        }
    }, { new: true })

    return res.status(200).json({ message: "Profile uploaded successfully", user })
}

//Cloudinary
export const deleteFromCloudinaryService = async (req, res) => {
    const { public_id } = req.body;
    const result = await deleteFileFromCloudinary(public_id)
    return res.status(200).json({ message: "File deleted successfully", result })
}


export const forgetPasswordService = async (req, res) => {
    const { email } = req.body;
    const user = await users.findOne({ email })
    if (!user) {
        return res.status(400).json({ message: "User not found " })
    };
    const otp = uniqueString();
    user.otps.resetPassword = hashSync(otp, +process.env.SALT_ROUNDS)
    await user.save()
    emitter.emit('sendEmail', {
        to: email,
        subject: 'Reset password',
        content: `Your password reset OTP is :${otp} `,
    })
    return res.status(200).json({ message: "Reset password otp sent to email" })
}


export const resetPasswordService = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await users.findOne({ email })
    if (!user) {
        return res.status(400).json({ message: "User not found " })
    };
    if (!user.otps.resetPassword) {
        return res.status(400).json({ message: "No reset OTP found for this user" });
    }
    const isOtpMatch = compareSync(otp, user.otps.resetPassword)
    if (!isOtpMatch) {
        return res.status(404).json({ message: "Invalid OTP" })
    };
    user.password = hashSync(newPassword, +process.env.SALT_ROUNDS)
    user.otps.resetPassword = null;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" })
}


export const resendEmailService = async (req, res) => {
    const { email } = req.body;
    const user = await users.findOne({ email })
    if (!user) {
        return res.status(404).json({ message: "User not found " })
    };
    if (user.isConfirmed) {
        return res.status(400).json({ message: "User already confirmed " })
    };
    const otp = uniqueString();
    user.otps.confirmation = hashSync(otp, +process.env.SALT_ROUNDS)
    await user.save()
    emitter.emit('sendEmail', {
        to: email,
        subject: 'Resend email',
        content: `Your new confirmation OTP is :${otp} `,
    })
    return res.status(200).json({ message: "Confirmation email resent successfully" })
}



