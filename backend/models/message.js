import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    conversationId: String,
    senderId: String,
    recieverId: String,
    text: String,
    type: String
},{
    timestamps:true
});

const Message=mongoose.model('message',messageSchema);

export  default Message;