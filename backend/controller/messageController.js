import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import User from "../models/User.js";
import { io, getReceiverSocketId } from '../socket/index.js';

export const newConversation = async (req, res) => {
    try {
        const senderId = req.body.senderId;
        const recieverId = req.body.recieverId;
        const exist = await Conversation.findOne({ members: { $all: [senderId, recieverId] } });
        if (exist) {
            return res.status(200).json({
                message: 'conversation already exists',
                success: true,
                conversation: exist
            });
        }

        const newconversation = new Conversation({
            members: [senderId, recieverId]
        });

        const con = await newconversation.save();
        return res.status(200).json({
            message: 'conversation is saved successfully',
            success: true,
            conversation: con
        });
    } catch (error) {
        console.log('while new conversation', error);
        return res.status(500).json(error.message);
    }
}

export const getConversation = async (req, res) => {
    try {

        const conversation = await Conversation.find();
        if (conversation) {
            return res.status(200).json({
                success: true,
                conversation
            });
        }
    } catch (error) {
        console.log("While get conversation", error);
    }
}

export const newMessage = async (req, res) => {
    try {

        let imageUrl;
        if (req.file) {
            imageUrl = `${process.env.BACKEND_URL}/file/${req.file.originalname}`;
        }
        else {
            imageUrl = req.body.text;
        }
        const newMessage = await Message({
            conversationId: req.body.conversationId,
            senderId: req.body.senderId,
            recieverId: req.body.recieverId,
            text: imageUrl,
            type: req.body.type
        });
        const mm = await newMessage.save();
        const updatedConversation = await Conversation.findByIdAndUpdate(req.body.conversationId, { message: newMessage.text });
        let updatedSender = await User.findByIdAndUpdate(req.body.senderId, { lastMessage: mm?.text });
        let updatedReceiver = await User.findByIdAndUpdate(req.body.recieverId, { lastMessage: mm?.text });
        let recieverId = getReceiverSocketId(req.body.recieverId);

        return res.status(200).json({
            success: true,
            message: 'message send successfully',
            mm
        });

    } catch (error) {
        console.log("while new message", error);
        return res.status(500).json(error.message);
    }
}

export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id });
        res.status(200).json({
            success: true,
            message: 'message geted',
            messages
        })
    } catch (error) {
        console.log("while get message", error);
        return res.status(500).json(error.message);
    }
}