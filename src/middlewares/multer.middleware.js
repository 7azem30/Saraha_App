import multer from "multer";
import { allowedFileExtensions, fileTypes } from "../common/constants/file.constant.js";


export const hostUpload = () => {
    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, `${uniqueSuffix}__${file.originalname}`)
        }
    })
    const fileFilter = (req, file, cb) => {
        const fileKey = file.mimetype.split('/')[0].toUpperCase();
        const fileType = fileTypes[fileKey]
        if (!fileType) return cb(new Error('Invalid file type'), false);

        const fileExtension = file.mimetype.split('/')[1];
        if (!allowedFileExtensions[fileType].includes(fileExtension)) {
            return cb(new Error('Invalid file extension'), false)
        }
        return cb(null, true)
    }
    return multer({ fileFilter, storage })
}