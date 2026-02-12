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
    message: "Peace & Justice API is running",
  });
});

// API Routes


// Global Error Handler
app.use(errorMiddleware);

module.exports = app;