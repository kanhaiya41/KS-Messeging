import mongoose from "mongoose";


const UserSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    mobile: String,
    image: String,
    bio: String,
    lastMessage: String
});

const User = new mongoose.model('User', UserSchema);
export default User;