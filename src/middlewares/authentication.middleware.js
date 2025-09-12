import blackListedTokens from "../db/models/black-listed-token.model.js";
import users from "../db/models/users.model.js";
import { verifyToken } from "../utils/token.utils.js";


export const authenticationMiddleware = async (req, res, next) => {
    const { authorization: accesstoken } = req.headers;
    if (!accesstoken) return res.status(400).json({ message: "token failed" });

    const [prefix, token] = accesstoken.split(' ')
    const decodedData = verifyToken(token, process.env.JWT_ACCESS_SECRET)
    if (!decodedData.jti) {
        return res.status(400).json({ message: "Invalid token" })
    }
    const blackListedToken = await blackListedTokens.findOne({ tokenId: decodedData.jti })
    if (blackListedToken) {
        return res.status(401).json({ message: "Token is blackListed" })
    }
    const user = await users.findById(decodedData?._id).lean();
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    req.loggedInUser = { ...user, tokenId: decodedData.jti, expirationDate: decodedData.exp }

    next()
}
