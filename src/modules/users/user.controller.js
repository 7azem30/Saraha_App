import { Router } from "express";
import * as services from "./services/user.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { signUpSchema, updateUserSchema } from "../../validators/schema/user.schema.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { privillages } from "../../common/enums/user.enum.js";
import { hostUpload } from "../../middlewares/multer.middleware.js";
const userRouter = Router();



userRouter.post('/register', validationMiddleware(signUpSchema), services.signUpRegister);
userRouter.put('/confirm', services.confirmEmailService);
userRouter.post('/login', services.signInService);
userRouter.put('/update', validationMiddleware(updateUserSchema), authenticationMiddleware, services.updateAccountService);
userRouter.get('/list', authenticationMiddleware, authorizationMiddleware(privillages.ALL), services.listUserService);
userRouter.post('/refresh', services.refreshTokenService);
userRouter.post('/logged-out', authenticationMiddleware, services.logOutService);
userRouter.delete('/delete', authenticationMiddleware, services.deleteAccountService);
userRouter.post('/upload-profile', authenticationMiddleware, hostUpload({}).single('profile'), services.uploadProfileService)
userRouter.delete('/delete-profile', authenticationMiddleware, services.deleteFromCloudinaryService)
userRouter.post('/resend-email', authenticationMiddleware, services.resendEmailService)
userRouter.post('/forget-password', authenticationMiddleware, services.forgetPasswordService);
userRouter.post('/reset-password', authenticationMiddleware, services.resetPasswordService)

export default userRouter;