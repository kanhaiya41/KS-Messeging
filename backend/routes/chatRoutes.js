import express from 'express';
import { getConversation, getMessages, newConversation, newMessage } from '../controller/messageController.js';
import { upload, uploadToGridFs } from '../middleware/upload.js';

const app=express();

app.post('/addconversation',newConversation);
app.get('/getconversation',getConversation);
app.post('/addmessage',upload.single('image'),uploadToGridFs,newMessage);
app.get('/getmessages/:id',getMessages);

export default app;