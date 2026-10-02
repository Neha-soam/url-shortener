import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useToast } from '../components/Toast.jsx';

const RESEND_COOLDOWN_SECONDS = 45; // mirrors backend/.env OTP_RESEND_COOLDOWN_SECONDS

// Two-step flow: 'details' (email+password) -> 'otp' (6-digit code).
// No account exists until step 2 succeeds -- see AuthContext.startRegistration/verifyRegistration.
export default function Register({ onDone }) {
  const { startRegistration, verifyRegistration } = useAuth();
  const showToast = useToast();

  const [step, setStep] = useState('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting
  const [cooldown, setCooldown] = useState(0);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'otp') otpInputRef.current?.focus();
  }, [step]);

  const submitDetails = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setStatus('submitting');
    try {
      await startRegistration(email, password);
      showToast('Verification code sent to your email');
      setStep('otp');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.status === 409 ? 'That email is already registered.' : err.message || 'Something went wrong. Please try again.');
    } finally {
      setStatus('idle');
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('submitting');
    try {
      await verifyRegistration(email, otp);
      onDone();
    } catch (err) {
      setError(err.message || 'Incorrect or expired code.');
      setStatus('idle');
    }
  };

  const resend = async () => {
    setError('');
    try {
      await startRegistration(email, password);
      showToast('New code sent');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp('');
    } catch (err) {
      setError(err.message || 'Could not resend the code.');
    }
  };

  if (step === 'otp') {
    return (
      <div className="card" style={{ maxWidth: 380 }}>
        <h1 style={{ fontSize: 18, margin: '0 0 6px' }}>Check your email</h1>
        <p className="meta" style={{ marginBottom: 16 }}>We sent a 6-digit code to {email}.</p>
        <form onSubmit={submitOtp}>
          <div className="row">
            <div style={{ flex: 1 }}>
              <label className="field-label" htmlFor="otp">Verification code</label>
              <input
                id="otp" ref={otpInputRef} inputMode="numeric" autoComplete="one-time-code"
                maxLength={6} placeholder="123456" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
          </div>
          <button type="submit" disabled={status === 'submitting' || otp.length !== 6}>
            {status === 'submitting' ? 'Verifying…' : 'Verify and create account'}
          </button>
          {error && <ErrorMessage message={error} />}
        </form>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="secondary" onClick={resend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
          </button>
          <button className="secondary" onClick={() => { setStep('details'); setOtp(''); setError(''); }}>
            Change email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 380 }}>
      <h1 style={{ fontSize: 18, margin: '0 0 16px' }}>Create an account</h1>
      <form onSubmit={submitDetails}>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email"
                   value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label className="field-label" htmlFor="password">Password (min 8 characters)</label>
            <input id="password" type="password" required minLength={8} autoComplete="new-password"
                   value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label className="field-label" htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" required autoComplete="new-password"
                   value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending code…' : 'Send verification code'}
        </button>
        {error && <ErrorMessage message={error} />}
      </form>
      <p className="meta" style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
      </p>
    </div>
  );
}
