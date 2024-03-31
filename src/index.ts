import express, { Express } from "express";
import session, {
  SessionOptions,
  MemoryStore,
  SessionData,
} from "express-session";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import postRoutes from "./routes/postRoutes";
import connectionRoutes from './routes/connectionRoutes'
import cors from "cors";
import errorHandler from "./middlewares/errorMiddleware";

dotenv.config();

const app: Express = express();

declare module "express-session" {
  interface Session {
    userDetails?: { userName: string; email: string; password: string };
    otp?: string;
    otpGeneratedTime?: number;
    email: string;
  }
}

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET || "default_secret_key";

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

connectDB();
const port = process.env.PORT || 3000;

app.use("/api/", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/post", postRoutes);
app.use("/api/connection", connectionRoutes);


app.use(errorHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
