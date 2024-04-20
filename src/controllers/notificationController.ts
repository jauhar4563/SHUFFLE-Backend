import { Request, Response } from 'express';
import Notification from '../models/notifications/notificastionModel';
import Connections from '../models/connections/connectionModel'; 




export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    
  try {
    const userId = req.body.userId; 

    const connections = await Connections.findOne({ userId });
    const userConnections: any[] = connections?.followers || [];

    const notifications = await Notification.find({ receiverId: userId }).populate({
        path: 'senderId',
        select: 'userName profileImg'
      }).sort({createdAt:-1})

    res.status(200).json({ notifications: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};