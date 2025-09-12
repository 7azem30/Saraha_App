import messages from "../../../db/models/messages.model.js";
import users from "../../../db/models/users.model.js";


export const sendMessagesService = async (req, res) => {
    const { content, isPublic } = req.body;
    const { receiverId } = req.params;
    const user = await users.findById(receiverId)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    const message = new messages({
        content,
        receiverId,
        isPublic
    })
    await message.save();
    const statusMessage = message.isPublic
        ? "This message is public" : "This message is private"
    return res.status(201).json({ message: "Message sent successfully", statusMessage, message })
}
export const getMessagesService = async (req, res) => {
    const { _id } = req.loggedInUser;
    const message = await messages.find({ receiverId: _id })
        .populate([
            {
                path: "receiverId"
            }
        ])
    if (!message.length) {
        return res.status(404).json({ message: "No messages found for this user" });

    }
    return res.status(201).json({ message })
}
export const getAllPublicMessageService = async (req, res) => {
    const publicMessage = await messages.find({ isPublic: true })
        .populate("receiverId", "firstName lastName");
    if (!publicMessage) {
        return res.status(404).json({ message: "Public message not found" })
    }
    return res.status(201).json({ message: "All public messages fetched successfully ", publicMessage })
}