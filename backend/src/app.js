import express from "express";
import cors from "cors";
import morgan from "morgan";
import errorMiddleware from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import consultationRequestRoutes from "./routes/consultationRequestRoutes.js";
import civilIssueRoutes from "./routes/civilIssues/civilIssueRoutes.js";
import lawyerProfileRoutes from "./routes/lawyerProfileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import socialRoutes from "./routes/social/socialRoutes.js";

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
app.use("/api/auth", authRoutes);
// API user Routes
app.use("/api/users", userRoutes);
// API articles Routes
app.use("/api/articles", articleRoutes);
// API consultation request Routes (users describe their legal matters)
app.use("/api/consultation-requests", consultationRequestRoutes);

// API civil issues Routes (citizens report civil issues, auto-routed to authority)
app.use("/api/civil-issues", civilIssueRoutes);

// API lawyer profile Routes
app.use("/api/lawyer-profile", lawyerProfileRoutes);

// API legal social feed Routes
app.use("/api/social", socialRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
