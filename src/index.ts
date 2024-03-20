import express, { Express } from "express";
import session from 'express-session';
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import cors from 'cors';

dotenv.config();

const app: Express = express();

app.use(cors({
  origin:'http://localhost:5173'
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET || 'default_secret_key';

app.use(session({
  secret:sessionSecret, 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

connectDB();
const port = process.env.PORT || 3000;

app.use("/api/", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
