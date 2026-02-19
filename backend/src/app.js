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
// API articles Routes
app.use("/api/articles", require("./routes/articleRoutes"));
// API lawyer request Routes (users describe their legal matters)
app.use("/api/lawyer-requests", require("./routes/lawyerRequestRoutes"));
// API lawyer profile Routes
app.use("/api/lawyer-profile", require("./routes/lawyerProfileRoutes"));

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
