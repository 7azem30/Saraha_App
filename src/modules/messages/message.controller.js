import { Router } from "express";
import * as services from "./services/message.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
const messageRouter = Router();

messageRouter.post('/send/:receiverId', services.sendMessagesService);
messageRouter.get('/get-message', authenticationMiddleware,services.getMessagesService);
messageRouter.get('/public-message', services.getAllPublicMessageService);

export default messageRouter;