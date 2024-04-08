import {Schema, model } from "mongoose";
import TransactionInterface from "./transactionTypes";

const TransactionSchema = new Schema<TransactionInterface>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    transactionId:{
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

const Transactions = model<TransactionInterface>('Transactions', TransactionSchema);

export default Transactions;