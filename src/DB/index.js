import {connect} from "mongoose";
import dotenv from "dotenv"
import dbName from "../constants.js"

const dbConnect = async()=>
{
    try
    {
       const connectionInstance =  await connect(`${process.env.MONGO_URL}`)
        console.log("DB connected")
        console.log(connectionInstance.connection.host);
    }
    catch(error)
    {
        console.log("DB connection failed")
        console.log(error)
    }
}

export default dbConnect