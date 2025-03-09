import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const signup = async (req, res) => {
    console.log("Received body",req.body)
    const { username, email, password } = req.body;
    try {
        if(!username || !email || !password)
            return res.status(400).json({ message: "All fields are required" }); 
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const profile = async (req, res) => {
    res.json(req.user);
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        console.log("Received email:", email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found for email:", email);
            return res.status(400).json({ message: "User not found" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 900000;
        await user.save();

        console.log("Generated reset token:", token);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            text: `Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.resetToken !== token || user.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;

        await user.save();
        res.json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
