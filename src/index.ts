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
import connectionRoutes from "./routes/connectionRoutes";
import ChatRoutes from "./routes/chatRoutes";
import StoryRoutes from "./routes/storyRoutes";
import cors from "cors";
import errorHandler from "./middlewares/errorMiddleware";
import { Server, Socket } from "socket.io";
import socketIo_Config from "./utils/socket/socket";
import http from "http";
import runScheduledTask from "./utils/scheduledTask";
import path from "path";

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
// app.use("/chat", express.static(path.join(__dirname, "public", "chat")));
app.use(express.static('public/'))
app.use('/api/chatMedia/',express.static('public/chat/'))

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

// Create HTTP server
const server = http.createServer(app);

const io: Server = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// Configure Socket.IO
socketIo_Config(io);

app.use("/api/", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/post", postRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/story", StoryRoutes);

runScheduledTask();

app.use(errorHandler);

server.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
