import express from 'express'
import { editProfile, findUsers, forgetPassword, Login, logOut, sendMail, SignUp } from '../controller/authController.js';
import { upload, uploadToGridFs } from '../middleware/upload.js';
import { isAthenticatedi } from '../middleware/isAthenticated.js';

const app=express();

app.post('/signup',upload.single('image'),uploadToGridFs,SignUp);
app.post('/login',Login);
app.get('/findusers',isAthenticatedi,findUsers);
app.post('/editprofile',isAthenticatedi,upload.single('image'),uploadToGridFs,editProfile);
app.get('/logout',logOut);
app.post('/gmail/:email',sendMail);
app.post('/forgetpass',forgetPassword);

export default app;