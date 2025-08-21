import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, {
    timestamps: true
});
const messages = mongoose.model('messages', messageSchema);
export default messages;