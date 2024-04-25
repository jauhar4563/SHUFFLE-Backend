"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connectionController_1 = require("../controllers/connectionController");
const router = express_1.default.Router();
router.post('/follow', connectionController_1.followUserController);
router.post('/unfollow', connectionController_1.unFollowUserController);
router.post('/accept-request', connectionController_1.acceptRequestController);
router.post('/reject-request', connectionController_1.rejectRequestController);
router.post('/get-requested-users', connectionController_1.getFollowRequestsController);
router.post('/get-connection', connectionController_1.getConnectionController);
exports.default = router;
