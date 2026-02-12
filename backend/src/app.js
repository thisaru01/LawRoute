const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Base Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LawRoute API is running",
  });
});

// API auth Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
