import cron from "node-cron";
import blackListedTokens from "../db/models/black-listed-token.model.js";





export const deleteExpiredTokenService = cron.schedule("0 0 * * *", async () => {
    const now = new Date();
    const result = await blackListedTokens.deleteMany({
        expirationDate: { $lt: now }
    })
})