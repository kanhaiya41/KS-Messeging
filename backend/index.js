import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import { connect } from './utills/db.js';
import authApp from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { getProfilePic } from './middleware/upload.js';
import chatApp from './routes/chatRoutes.js';
import {app,server} from './socket/index.js';
import path, { dirname } from 'path';

dotenv.config();

connect();

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
const corsOptions = {
    origin:process.env.URL,
    methods:['GET','POST','PUT','DELETE'],
    credentials:true
}
app.use(cors(corsOptions));

app.get('/file/:filename',getProfilePic);

app.use('/auth',authApp);
app.use('/chat',chatApp);

const __dirname=path.resolve();
console.log(__dirname);
app.use(express.static(path.join(__dirname,'/frontend/build')));
app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,"frontend","build","index.html"));
});

server.listen(8000,()=>{
    console.log("server is running on port 8000");
});