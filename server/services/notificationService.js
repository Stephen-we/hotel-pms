export const sendOTPToUser = async (email, otp, userName) => {
  console.log(`📧 OTP for ${email} (${userName}): ${otp}`);
  console.log(`📍 In production, this OTP would be sent via email`);
  return true;
};

export const sendDeviceAlertToOwner = async (user, deviceInfo, alertType) => {
  console.log(`🚨 SECURITY ALERT [${alertType}]:`);
  console.log(`   User: ${user.firstName} ${user.lastName} (${user.email})`);
  console.log(`   Device: ${deviceInfo.deviceName}`);
  console.log(`   IP: ${deviceInfo.ipAddress}`);
  console.log(`   OS: ${deviceInfo.os}`);
  console.log(`   Browser: ${deviceInfo.browser}`);
  console.log(`   Device ID: ${deviceInfo.deviceId}`);
  return true;
};
