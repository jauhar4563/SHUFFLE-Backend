import { SessionData } from 'express-session';


interface CustomSessionData extends SessionData {
    userDetails?: { userName: string, email: string, password: string };
    otp?: string;
    otpGeneratedTime?:number;
  }

  export default CustomSessionData