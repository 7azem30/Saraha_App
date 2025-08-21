import { Router } from "express";
import * as services from "./services/message.service.js";
const messageRouter = Router();

messageRouter.post('/send/:receiverId', services.sendMessagesService);
messageRouter.get('/get', services.getMessagesService);

export default messageRouter;