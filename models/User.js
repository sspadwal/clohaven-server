import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    mobile: { type: Number, required: true },
    role: { type: String, default: 'user' },
});

const User = mongoose.model('User', userSchema);
export default User;