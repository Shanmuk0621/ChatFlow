import dotenv from "dotenv"
import app from "./app.js"
import dbConnect from "./DB/index.js"
import server from "./app.js"

dotenv.config(
    {
        path:"./.env"
    }
)

dbConnect()
.then(
    ()=> "DB connected successfully"
)
.then(
    ()=> server.listen(process.env.PORT,()=> console.log("server is running on port",process.env.PORT))
)
.catch(()=> "DB connection failed")