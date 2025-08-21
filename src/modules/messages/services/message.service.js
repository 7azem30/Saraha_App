import messages from "../../../db/models/messages.model.js";
import users from "../../../db/models/users.model.js";


export const sendMessagesService = async (req, res) => {
    const { content } = req.body;
    const { receiverId } = req.params;
    const user = await users.findById(receiverId)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    const message = new messages({
        content,
        receiverId
    })
    await message.save();
    return res.status(201).json({ message: "Message sent successfully", message })
}



export const getMessagesService = async (req, res) => {
    const message = await messages.find()
        .populate([
            {
                path: "receiverId"
            }
        ])
    return res.status(201).json({ message })
}