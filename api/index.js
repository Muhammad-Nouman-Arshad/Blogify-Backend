app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://blogify-frontend-five.vercel.app",
    ],
    credentials: true,
  })
);
