import mongoose from "mongoose";
import { genderEnum, roleEnum } from "../../common/enums/user.enum.js";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: [18, "Age must be at least 18 years old"],
        index: true
    },
    gender: {
        type: String,
        enum: Object.values(genderEnum)
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true
    },
    otps: {
        confirmation: String,
        resetPassword: String
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(roleEnum),
        default: roleEnum.USER
    },
    profilePicture: {
        secure_url: String,
        public_id: String
    },
    devices: [{
        deviceId: { type: String },
        tokenId: { type: String },
        createdAt: { type: Date, default: Date.now }
    }]


}, {
    timestamps: true,
});
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`
});
userSchema.virtual("messages", {
    ref: "messages",
    localField: "_id",
    foreignField: "receiverId"
});
const users = mongoose.model('users', userSchema);
export default users;