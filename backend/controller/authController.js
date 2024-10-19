import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import nodemailer from 'nodemailer';

export const SignUp = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json('Profile pic not found');
        }
        const { username, password, email, mobile } = req.body;
        const user = await User.findOne({ username });
        const usere = await User.findOne({ email });
        const userm = await User.findOne({ mobile });
        if (!username || !email || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: 'Something is missing,Please cheack!'
            });
        }

        const imageUrl = `${process.env.BACKEND_URL}/file/${req.file.originalname}`;

        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Username is already exists!'
            })
        }
        if (usere) {
            return res.status(400).json({
                success: false,
                message: 'Try with a different email!'
            })
        }
        if (userm) {
            return res.status(400).json({
                success: false,
                message: 'mobile already registered!'
            });
        }


        const hashedPassword = await bcrypt.hash(password, 10);
        const saveUser = await User({ username, email, password: hashedPassword, mobile, image: imageUrl });
        const usersaved = await saveUser.save();
        return res.status(200).json({
            success: true,
            message: 'Sign Up Successfully!',

        });

    } catch (error) {
        console.log("while sign up", error);

    }
}

export const Login = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                success: false,
                message: 'Something is missing'
            });
        }
        const exist = await User.findOne({ email });
        if (!exist) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, exist.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }
        const token = await jwt.sign({
            userId: exist._id,
        },
            process.env.SECRET_KEY,
            {
                expiresIn: '1d'
            }
        );
        const user = await User.findOne({ email }).select('-password');

        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).status(200).json({
            success: true,
            message: 'Sign In Successfully',
            user
        })

    } catch (error) {
        console.log("while login", error);
    }
}

export const findUsers = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(400).json({
                success: false,
                message: 'No authentication'
            });
        }
        const allUser = await User.find({ _id: { $ne: req.id } }).select('-password');
        if (!allUser) {
            return res.status(400).json({
                success: false,
                message: 'No User available'
            });
        }
        return res.json({
            success: true,
            allUser
        });
    } catch (error) {
        console.log("while geting usrs", error);
    }
}

export const logOut = async (req, res) => {
    try {
        return res.cookie('token', '', { maxAge: 0 }).status(200).json({
            success: true,
            message: 'Logout Successfully'
        });
    } catch (error) {
        console.log("while log out", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const editProfile = async (req, res) => {
    let success = false;
    let message = 'User not Updated';
    try {
        const { name, bio, phone, email } = req.body;
        const image = req.file;
        const user = await User.findById(req.id);

        if (!user) {
            return res.status(401).json({
                message: 'User not found \n Please relogin'
            });
        }
        if (name) {
            const uuser = await User.findByIdAndUpdate(req.id, { username: name });
            success = true;
            message = 'Account Updated';
        }
        if (email) {
            const uemail = await User.findByIdAndUpdate(req.id, { email: email });
            success = true;
            message = 'Account Updated';
        }
        if (phone) {
            const umobile = await User.findByIdAndUpdate(req.id, { mobile: phone });
            success = true;
            message = 'Account Updated';
        }
        if (bio) {
            const ubio = await User.findByIdAndUpdate(req.id, { bio: bio });
            success = true;
            message = 'Account Updated';
        }

        if (image) {
            const imageUrl = `${process.env.BACKEND_URL}/file/${req.file.originalname}`;
            const uimage = await User.findByIdAndUpdate(req.id, { image: imageUrl });
            success = true;
            message = 'Account Updated';
        }

        const updateduser = await User.findById(req.id);
        return res.status(200).json({
            success: success,
            message: message,
            updateduser
        })

    } catch (error) {
        console.log("error while edit Profile", error);
    }
}

export const sendMail = async (req, res) => {
    const { email } = req.params;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const characterlenth = characters.length;
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characterlenth));
    }
    //set nodemailer transport
    const transtporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kingkanhaiya57@gmail.com',
            pass: 'trvvqgskjviocabw'
        }
    });
    //body of mail
    const mailBody = {
        from: 'kingkanhaiya57@gmail.com',
        to: email,
        subject: 'Code For Update Account information',
        html: `<h1>${result}</h1>`,
    };
    try {
        let info = await transtporter.sendMail(mailBody);
        res.status(200).json({
            success: true,
            message: 'we send a code on your mail! please confirm',
            result
        });
    } catch (error) {
        console.error('error sending mail:' + error);
        res.status(500).send("error sending mail:" + error.message);
    }
};

export const forgetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'email does not match!'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateduser = await User.findOneAndUpdate({ email }, { password: hashedPassword });
        return res.status(200).json({
            success: true,
            message: 'Password updated',
            
        });
    } catch (error) {
        console.log("while forget password", error);
    }
}