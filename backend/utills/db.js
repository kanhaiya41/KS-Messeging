import mongoose from "mongoose"

export const connect=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL).then(()=>{
            console.log('connected');
        })
    } catch (error) {
        console.log("while connect with db",error)
    }
}