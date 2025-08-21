import 'dotenv/config'
import express from "express"
import dbConnection from './db/db.connection.js'
import userRouter from './modules/users/user.controller.js'
import messageRouter from './modules/messages/message.controller.js'


const app = express()


app.use(express.json())
app.use('/users', userRouter)
app.use('/messages', messageRouter)

dbConnection();

app.use(async (err, req, res, next) => {
    console.log(err.stack);
    if (req.session && req.session.inTransaction()) {
        await req.session.abortTransaction()
        session.endSession()
    }
    res.status(500).json({ message: "Something broke!" });
});




app.use((req, res) => {
    res.status(404).json({ message: "Router not found" })
});





app.listen(process.env.PORT, () => {
    console.log("Server Started on port", process.env.PORT);

});
