// utils/otpGenerator.js
export function generateOtp(length = 6) {
  let s = "";
  for (let i = 0; i < length; i++) s += Math.floor(Math.random() * 10);
  return s;
}
