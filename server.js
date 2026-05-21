const express = require("express");
const app = express();

app.use(express.json());

// Routes
const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);