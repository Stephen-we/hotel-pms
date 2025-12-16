import crypto from "crypto";
import requestIp from "request-ip";
import mongoose from "mongoose";

// Generate unique device ID
export const generateDeviceId = (req) => {
  const ip = requestIp.getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';
  return crypto.createHash('sha256').update(ip + userAgent).digest('hex');
};

// Extract device information (without UAParser for now)
export const extractDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Simple user agent parsing
  const getOS = (ua) => {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
    return 'Unknown OS';
  };

  const getBrowser = (ua) => {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getDeviceType = (ua) => {
    if (ua.includes('Mobile')) return 'mobile';
    if (ua.includes('Tablet')) return 'tablet';
    return 'desktop';
  };

  return {
    deviceId: generateDeviceId(req),
    ipAddress: requestIp.getClientIp(req),
    userAgent: userAgent,
    os: getOS(userAgent),
    browser: getBrowser(userAgent),
    device: getDeviceType(userAgent),
    deviceName: getOS(userAgent) + ' Device'
  };
};

// Check if device is verified
export const checkDeviceVerification = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const deviceInfo = extractDeviceInfo(req);
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(req.user.userId) 
    });
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // If user has no devices or device approval is not required, allow access
    if (!user.devices || user.devices.length === 0 || !user.securitySettings?.requireDeviceApproval) {
      req.deviceInfo = deviceInfo;
      return next();
    }
    
    const isDeviceAllowed = user.devices.some(device => 
      device.deviceId === deviceInfo.deviceId && 
      device.isVerified && 
      !device.isBlocked
    );
    
    if (!isDeviceAllowed) {
      return res.status(403).json({ 
        message: "Device not authorized. Please contact administrator.",
        code: "DEVICE_NOT_AUTHORIZED",
        requiresVerification: true
      });
    }
    
    req.deviceInfo = deviceInfo;
    next();
  } catch (error) {
    console.error("Device verification error:", error);
    res.status(500).json({ message: "Device verification failed" });
  }
};
