
import { Document, Types } from "mongoose";

interface TransactionInterface extends Document {
    userId: Types.ObjectId;
    transactionId: string;
    startDate: Date;
    expiryDate: Date;
    amount:string;  
}

export default TransactionInterface;
