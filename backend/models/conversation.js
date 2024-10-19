import mongoose, { mongo } from 'mongoose';

const conversationSchema=mongoose.Schema({
    members:Array,
    message:String
},{
    timestamps:true
});

const Conversation=mongoose.model('conversation',conversationSchema);

export default Conversation;