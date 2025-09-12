import 'dotenv/config'
import express from "express"
import dbConnection from './db/db.connection.js'
import userRouter from './modules/users/user.controller.js'
import messageRouter from './modules/messages/message.controller.js'
import { limiter } from './middlewares/rate-limiter.middlewares.js'
import cors from 'cors'
import helmet from 'helmet'
import { deleteExpiredTokenService } from './utils/cron-group.utils.js'

const app = express()
app.use(express.json())
app.use('/users', userRouter)
app.use('/messages', messageRouter)
app.use(limiter)
app.use(helmet())
app.use(cors())
deleteExpiredTokenService.start()
dbConnection();

app.use(async (err, req, res, next) => {
    console.log(err.stack);
    if (req.session && req.session.inTransaction()) {
        await req.session.abortTransaction()
        session.endSession()
    }
    res.status(500).json({ message: "Something broke!", err: err.message, stack: err.stack });
});
app.use((req, res) => {
    res.status(404).json({ message: "Router not found" })
});
app.listen(process.env.PORT, () => {
    console.log("Server Started on port", process.env.PORT);

});
