"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const connectionRoutes_1 = __importDefault(require("./routes/connectionRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const storyRoutes_1 = __importDefault(require("./routes/storyRoutes"));
const cors_1 = __importDefault(require("cors"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const socket_io_1 = require("socket.io");
const socket_1 = __importDefault(require("./utils/socket/socket"));
const http_1 = __importDefault(require("http"));
const scheduledTask_1 = __importDefault(require("./utils/scheduledTask"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "https://www.shufle.online",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/chat", express_1.default.static(path_1.default.join(__dirname, "public", "chat")));
// app.use(express.static('public/'))
app.use('/api/img/', express_1.default.static('public/chat/'));
const sessionSecret = process.env.SESSION_SECRET || "default_secret_key";
app.use((0, express_session_1.default)({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
(0, db_1.default)();
const port = process.env.PORT || 3000;
// Create HTTP server
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "https://www.shufle.online" },
});
// Configure Socket.IO
(0, socket_1.default)(io);
app.use("/api/", userRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/post", postRoutes_1.default);
app.use("/api/connection", connectionRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
app.use("/api/story", storyRoutes_1.default);
(0, scheduledTask_1.default)();
app.use(errorMiddleware_1.default);
server.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
});
