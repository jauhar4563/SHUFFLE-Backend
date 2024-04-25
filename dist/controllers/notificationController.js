"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = void 0;
const notificastionModel_1 = __importDefault(require("../models/notifications/notificastionModel"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        const connections = yield connectionModel_1.default.findOne({ userId });
        const userConnections = (connections === null || connections === void 0 ? void 0 : connections.followers) || [];
        const notifications = yield notificastionModel_1.default.find({ receiverId: userId }).populate({
            path: 'senderId',
            select: 'userName profileImg'
        }).sort({ createdAt: -1 });
        res.status(200).json({ notifications: notifications });
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});
exports.getNotifications = getNotifications;
