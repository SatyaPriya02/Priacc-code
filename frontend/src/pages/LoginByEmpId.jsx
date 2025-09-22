import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginByEmpId() {
  const [empId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginWithEmpId } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!empId.trim()) return setError('Please enter your Employee ID');

    try {
      setLoading(true);
      const { employee } = await loginWithEmpId(empId.trim());
      navigate('/mobile-otp', { state: { empId: employee.empId, name: employee.name } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Login with Employee ID</h2>
        <label htmlFor="empId">Employee ID</label>
        <input id="empId" value={empId} onChange={(e) => setEmpId(e.target.value)} style={{marginBottom:10}} placeholder="e.g. EMP001" />
        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={loading}>{loading ? 'Checking…' : 'Next' }</button>
      </form>
    </div>
  );
}