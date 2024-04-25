"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TransactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        default: Date.now
    },
});
const Transactions = (0, mongoose_1.model)('Transactions', TransactionSchema);
exports.default = Transactions;
