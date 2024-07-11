"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const bucketName = process.env.BUCKET_NAME;
const region = process.env.REGION;
const socketIo_Config = (io) => {
    let users = [];
    io.on("connect", (socket) => {
        console.log("A client connected");
        io.emit("welcome", "this is server hi socket");
        socket.on("disconnect", () => {
            console.log("A client disconnected");
        });
        const removeUser = (socketId) => {
            users = users.filter((user) => user.socketId !== socketId);
        };
        const addUser = (userId, socketId) => {
            !users.some((user) => user.userId === userId) &&
                users.push({ userId, socketId });
        };
        const getUser = (userId) => {
            return users.find((user) => user.userId === userId);
        };
        //when connect
        socket.on("addUser", (userId) => {
            console.log("Received addUser event:", userId);
            addUser(userId, socket.id);
            console.log("Current users:", users); // Check if the user is added
            io.emit("getUsers", users);
        });
        // send and get message
        socket.on("sendMessage", ({ senderId, receiverId, text, messageType, file }) => {
            console.log(file);
            const user = getUser(receiverId);
            io.to(user === null || user === void 0 ? void 0 : user.socketId).emit("getMessage", {
                senderId,
                text,
                messageType,
                file: `https://${bucketName}.s3.${region}.amazonaws.com/${file}`
            });
        });
        socket.on("sendNotification", ({ postImage, receiverId, senderName, message, }) => {
            console.log(message);
            const user = getUser(receiverId);
            io.to(user === null || user === void 0 ? void 0 : user.socketId).emit("getNotifications", {
                postImage,
                senderName,
                message,
            });
        });
        // Listen for "typing" event from client
        socket.on("typing", ({ senderId, recieverId }) => {
            const user = getUser(recieverId);
            if (user) {
                io.to(user.socketId).emit("userTyping", { senderId });
            }
        });
        // Listen for "stopTyping" event from client
        socket.on("stopTyping", ({ senderId, recieverId }) => {
            const user = getUser(recieverId);
            if (user) {
                io.to(user.socketId).emit("userStopTyping", { senderId });
            }
        });
        socket.on("joinGroup", (data) => {
            try {
                const { group_id, userId } = data;
                socket.join(group_id);
                console.log("Connected to the group", group_id, "by user", userId);
                socket
                    .to(group_id)
                    .emit("joinGroupResponse", {
                    message: "Successfully joined the group",
                });
            }
            catch (error) {
                console.error("Error occurred while joining group:", error);
            }
        });
        socket.on("GroupMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { group_id, sender_id, content, messageType, file, lastUpdate } = data;
            const datas = {
                group_id,
                sender_id,
                content,
                messageType,
                file,
                lastUpdate,
            };
            if (group_id) {
                const emitData = {
                    group_id,
                    sender_id,
                    content,
                    messageType,
                    file
                };
                io.to(group_id).emit("responseGroupMessage", emitData);
            }
        }));
        socket.on("videoCallRequest", (data) => {
            const emitdata = {
                roomId: data.roomId,
                senderName: data.senderName,
                senderProfile: data.senderProfile
            };
            console.log(emitdata);
            const user = getUser(data.recieverId);
            if (user) {
                io.to(user.socketId).emit("videoCallResponse", emitdata);
            }
        });
        //Group Video Call 
        socket.on("GroupVideoCallRequest", (data) => {
            const emitdata = {
                roomId: data.roomId,
                groupName: data.groupName,
                groupProfile: data.groupProfile
            };
            io.to(data.groupId).emit("GroupVideoCallResponse", emitdata);
        });
        // When disconnectec
        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.emit("getUsers", users);
        });
    });
};
exports.default = socketIo_Config;
