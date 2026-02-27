import multer from "multer";

const errorMiddleware = (err, req, res, next) => {
  // Handle Multer-specific errors (e.g. too many files, file size exceeded)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle invalid file type errors thrown by fileFilter
  if (err.message?.startsWith("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorMiddleware;
