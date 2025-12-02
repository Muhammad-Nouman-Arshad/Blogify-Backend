// Global Error Handler
const errorMiddleware = (err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorMiddleware;
