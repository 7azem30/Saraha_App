import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadFileOneCloudinary = async (file, options) => {
    const result = await cloudinary.uploader.upload(file, options)
    return result
}
export const deleteFileFromCloudinary = async (public_id) => {
    const result = await cloudinary.uploader.destroy(public_id)
    return result
}