import { Document } from "mongoose";

interface adminInterface extends Document{
    name:String,
    email:String,
    password:String,
    profileImg:String
}

export default adminInterface