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


// POST /api/users/login
router.post("/login", async (req, res) => {
    try {

        // Get email and password from request body
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // If user does not exist
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password"
            });
        }

        // Compare passwords
        // Using instance method from model
        const correctPassword = await user.isCorrectPassword(password);

        // If password is incorrect
        if (!correctPassword) {
            return res.status(400).json({
                message: "Incorrect email or password"
            });
        }

        // Create JWT payload
        const payload = {
            _id: user._id,
            username: user.username
        };

        // Sign token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
});

module.exports = router;
