const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../model/User");


// REGISTER ROUTE
router.post("/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Create user
        const newUser = new User({
            username,
            email,
            password
        });

        // Save user
        await newUser.save();

        // Response without password
        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
});


// LOGIN ROUTE
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password"
            });
        }

        // Check password
        const correctPassword = await user.isCorrectPassword(password);

        if (!correctPassword) {
            return res.status(400).json({
                message: "Incorrect email or password"
            });
        }

        // Create token
        const token = jwt.sign(
            {
                _id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send response
        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;