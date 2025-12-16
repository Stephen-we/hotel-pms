import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const trackLogin = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const deviceId = req.headers['device-id'] || generateDeviceId(req);
    
    req.securityContext = { ip, userAgent, deviceId };
    next();
  } catch (error) {
    next(error);
  }
};

export const checkConcurrentLogins = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "hotel_pms_secret_key");
    const usersCollection = mongoose.connection.db.collection('users');
    
    const user = await usersCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(decoded.userId) 
    });
    
    if (user && user.sessions) {
      const activeSessions = user.sessions.filter(s => s.isActive).length;
      if (activeSessions >= (user.security?.maxSessions || 3)) {
        return res.status(401).json({ 
          message: "Maximum concurrent logins reached",
          code: "MAX_SESSIONS_EXCEEDED" 
        });
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

const generateDeviceId = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  return require('crypto').createHash('md5').update(ip + userAgent).digest('hex');
};
