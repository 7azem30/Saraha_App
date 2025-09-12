import mongoose from "mongoose";


const blackListedTokenSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
        unique: true
    },
    expirationDate: {
        type: Date,
        required: true,
    }
})

const blackListedTokens = mongoose.model('blackListedTokens', blackListedTokenSchema)
export default blackListedTokens;