const ADMIN_EMAIL = "sagarkulkarni884@gmail.com";

function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) ? e.parameter.page : "otp";
  return HtmlService.createHtmlOutputFromFile(page);
}

function sendOTP(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const cache = CacheService.getUserCache();
  const emailKey = email.trim().toLowerCase(); // Ensure email is consistent (lowercase and trimmed)
  cache.put(`otp_${emailKey}`, otp, 300); // Store OTP tied to the email for 5 minutes

  MailApp.sendEmail({
    to: email,
    subject: "Your OTP Code",
    body: `Your OTP code is: ${otp}\n\nThis code will expire in 5 minutes.`
  });

  return "OTP sent";  // Inform the user that the OTP has been sent
}


function verifyOTP(code, email) {
  if (!code || !email) return "invalid";

  const cache = CacheService.getUserCache();
  const key = `otp_${email.trim().toLowerCase()}`;
  const storedOTP = cache.get(key);

  if (storedOTP && code === storedOTP) {
    cache.remove(key); // Remove OTP after successful use
    return "success";
  }

  return "invalid";
}

