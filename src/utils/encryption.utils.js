import crypto from 'node:crypto'

const IV_LENGTH = +process.env.IV_LENGTH
const ENCRYPTION_SECRET_KEY = Buffer.from(process.env.ENCRYPTION_SECRET_KEY);

export const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv)
    let encryptedData = cipher.update(text, 'utf-8', 'hex')
    encryptedData += cipher.final('hex');

    return `${iv.toString('hex')}:${encryptedData}`
}
export const decrypt = (encryptedData) => {
    const [ivHex, encryptedText] = encryptedData.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv);
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf-8')
    decryptedData += decipher.final('utf-8')

    return decryptedData;

}