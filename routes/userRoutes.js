const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/users/register
router.post("/register", async (req, res) => {
    try {
        // Get data from request body
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password
        });

        // Save user to database
        // Pre-save hook will hash password automatically
        await newUser.save();

        // Remove password from response
        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email
        };

        // Send success response
        res.status(201).json({
            message: "User registered successfully",
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
});

module.exports = router;