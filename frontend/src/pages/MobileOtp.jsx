import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MobileOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuth();
  const empId = state?.empId;

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('enter-mobile');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  if (!empId) {
    navigate('/login');
  }

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(mobile)) return setError('Enter 10-digit mobile');
    try {
      await sendOtp({ empId, mobileNumber: mobile });
      setMsg('OTP sent to your mobile');
      setStep('enter-otp');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{4,6}$/.test(otp)) return setError('Enter valid OTP');
    try {
      await verifyOtp({ empId, mobileNumber: mobile, otpCode: otp });
      navigate('/home');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="auth-container">
      <form className="card" onSubmit={step === 'enter-mobile' ? handleSend : handleVerify}>
        <h2>{step === 'enter-mobile' ? 'Enter Mobile Number' : 'Enter OTP'}</h2>
        {step === 'enter-mobile' ? (
          <>
            <label htmlFor="mobile">Mobile Number</label>
            <input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="9999999999" />
            <button className="btn" type="submit">Send OTP</button>
          </>
        ) : (
          <>
            <label htmlFor="otp">OTP</label>
            <input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
            <button className="btn" type="submit">Verify</button>
          </>
        )}
        {msg && <div className="success">{msg}</div>}
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
