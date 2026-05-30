'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Leaf, Package, FlaskConical, Settings } from 'lucide-react';

const FEATURES = [
  { Icon: Package, title: 'Lot Tracking End-to-End', desc: 'Dari supplier masuk hingga customer terima' },
  { Icon: FlaskConical, title: 'QC Digital Terintegrasi', desc: 'Tidak ada lagi form kertas atau WhatsApp' },
  { Icon: Settings, title: 'PPIC Queue Otomatis', desc: 'Jadwal produksi real-time dengan prioritas' },
];

const ACCOUNTS = [
  { role: 'operator', pill: 'OPR', cred: 'operator@sima.com / password123' },
  { role: 'qc', pill: 'QC', cred: 'qc@sima.com / password123' },
  { role: 'ppic', pill: 'PPIC', cred: 'ppic@sima.com / password123' },
  { role: 'manager', pill: 'MGR', cred: 'manager@sima.com / password123' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login berhasil');
      router.push('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        {/* === LEFT — Dark Brand Panel === */}
        <div className="login-left">
          <div className="lp-particles" aria-hidden>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`lp-particle p${i}`} />
            ))}
          </div>

          <div className="logo-section">
            <div className="logo-mark">
              <Leaf size={26} color="#FFFFFF" strokeWidth={2.2} />
            </div>
            <span className="logo-text">SimaTrack</span>
          </div>

          <div className="left-body">
            <h1 className="left-headline">
              Satu sistem,<br />
              <em>tanpa batas</em><br />
              input ulang.
            </h1>

            <p className="left-sub">
              Platform manajemen manufaktur untuk Sima Arome — dari bahan baku
              masuk hingga sampel dikirim ke customer.
            </p>

            <div className="features">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div className="feat" key={title}>
                  <div className="feat-icon">
                    <Icon size={18} color="#FB923C" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="feat-title">{title}</div>
                    <div className="feat-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="left-footer">
            <p>CyberHack 2026 · Sima Arome</p>
          </div>
        </div>

        {/* === RIGHT — Light Form Panel === */}
        <div className="login-right">
          <div className="right-inner">
            {/* Brand kecil — hanya tampil di mobile saat panel kiri disembunyikan */}
            <div className="mobile-brand">
              <div className="logo-mark">
                <Leaf size={18} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <span>SimaTrack</span>
            </div>

            <div className="right-header">
              <h2>Selamat datang kembali</h2>
              <p>Masuk ke akun SimaTrack Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@sima.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Memproses...' : 'Masuk ke SimaTrack'}
              </button>
            </form>

            <div className="divider">
              <span>akun uji coba</span>
            </div>

            <div className="test-accounts">
              <p>Test Accounts</p>
              <ul>
                {ACCOUNTS.map(({ role, pill, cred }) => (
                  <li key={role}>
                    <span className={`role-pill ${role}`}>{pill}</span>
                    {cred}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: #1c1a14;
        }

        .login-shell {
          flex: 1;
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        /* ── Left panel ── */
        .login-left {
          width: 50%;
          flex-shrink: 0;
          background: #1c1a14;
          padding: 56px 56px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .login-left::after {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.22) 0%, transparent 65%);
          pointer-events: none;
          will-change: transform;
          animation: lp-orb-a 11s ease-in-out infinite;
        }
        .login-left::before {
          content: '';
          position: absolute;
          bottom: -120px;
          left: -60px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 160, 18, 0.1) 0%, transparent 70%);
          pointer-events: none;
          will-change: transform;
          animation: lp-orb-b 14s ease-in-out infinite;
        }

        /* Partikel cahaya naik lembut */
        .lp-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .lp-particle {
          position: absolute;
          bottom: -12px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 188, 69, 0.55) 0%, rgba(249, 115, 22, 0) 70%);
          animation: lp-rise linear infinite;
        }
        .lp-particle.p0 { left: 14%; width: 10px; height: 10px; animation-duration: 15s; animation-delay: 0s; }
        .lp-particle.p1 { left: 32%; width: 6px; height: 6px; animation-duration: 19s; animation-delay: 3s; }
        .lp-particle.p2 { left: 50%; width: 12px; height: 12px; animation-duration: 13s; animation-delay: 6s; }
        .lp-particle.p3 { left: 66%; width: 7px; height: 7px; animation-duration: 21s; animation-delay: 2s; }
        .lp-particle.p4 { left: 80%; width: 9px; height: 9px; animation-duration: 17s; animation-delay: 8s; }
        .lp-particle.p5 { left: 92%; width: 5px; height: 5px; animation-duration: 23s; animation-delay: 5s; }

        .left-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
          animation: lp-fade-up 0.7s ease both;
        }
        .logo-mark {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #f97316, #ffbc45);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.45);
        }
        .logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #ffa012;
          letter-spacing: 0.01em;
        }

        .left-headline {
          font-family: 'DM Serif Display', serif;
          font-size: 44px;
          color: #f5f1e8;
          line-height: 1.18;
          margin: 0 0 18px;
          animation: lp-fade-up 0.7s ease 0.12s both;
        }
        .left-headline em {
          font-style: italic;
          color: #ffa012;
          background: linear-gradient(100deg, #ffa012 0%, #ffe3a8 45%, #ffa012 90%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: lp-shimmer 4.5s linear infinite;
        }

        .left-sub {
          font-size: 16px;
          color: #8a8479;
          line-height: 1.7;
          margin-bottom: 40px;
          animation: lp-fade-up 0.7s ease 0.22s both;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .feat {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: lp-fade-up 0.6s ease both;
        }
        .feat:nth-child(1) { animation-delay: 0.34s; }
        .feat:nth-child(2) { animation-delay: 0.44s; }
        .feat:nth-child(3) { animation-delay: 0.54s; }
        .feat-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          flex-shrink: 0;
          background: rgba(249, 115, 22, 0.12);
          border: 1px solid rgba(249, 115, 22, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }
        .feat-title {
          font-size: 15px;
          font-weight: 600;
          color: #e8e4d9;
          margin-bottom: 4px;
        }
        .feat-desc {
          font-size: 12.5px;
          color: #8a8479;
          line-height: 1.5;
        }

        .left-footer {
          margin-top: auto;
          padding-top: 22px;
          border-top: 1px solid #2a2820;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
          animation: lp-fade-up 0.7s ease 0.66s both;
        }
        .left-footer p {
          font-size: 11px;
          color: #6b6860;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ── Right panel ── */
        .login-right {
          flex: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 88% 12%, rgba(249, 115, 22, 0.08), transparent 38%),
            radial-gradient(circle at 8% 92%, rgba(255, 188, 69, 0.1), transparent 42%),
            linear-gradient(135deg, #fffdf9 0%, #f6f1e7 100%);
        }
        /* tekstur titik sangat halus */
        .login-right::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(60, 48, 24, 0.05) 1px, transparent 1px);
          background-size: 26px 26px;
          pointer-events: none;
        }
        /* ring dekoratif pojok kanan atas */
        .login-right::before {
          content: '';
          position: absolute;
          top: -70px;
          right: -70px;
          width: 230px;
          height: 230px;
          border-radius: 50%;
          border: 40px solid rgba(249, 115, 22, 0.06);
          pointer-events: none;
        }

        .right-inner {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
        }

        /* Brand mini untuk mobile (disembunyikan di desktop) */
        .mobile-brand {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .mobile-brand span {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: #c2580a;
        }

        .right-header {
          margin-bottom: 32px;
        }
        .right-header h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #16140e;
          margin-bottom: 8px;
        }
        .right-header p {
          font-size: 15px;
          color: #7d7a72;
        }

        .form-group {
          margin-bottom: 18px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #57544e;
          margin-bottom: 7px;
          letter-spacing: 0.01em;
        }
        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #eceae3;
          border-radius: 11px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          color: #16140e;
          background: #fafaf8;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .form-group input:focus {
          border-color: #f97316;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
        .form-group input::placeholder {
          color: #b0ada6;
        }

        .btn-login {
          width: 100%;
          padding: 13px;
          margin-top: 6px;
          background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
          color: white;
          border: none;
          border-radius: 11px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.02em;
          cursor: pointer;
          box-shadow:
            0 2px 0 #c2580a,
            0 4px 14px rgba(249, 115, 22, 0.32);
          transition: transform 0.12s, box-shadow 0.12s;
        }
        .btn-login:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 4px 0 #c2580a,
            0 8px 20px rgba(249, 115, 22, 0.38);
        }
        .btn-login:active:not(:disabled) {
          transform: translateY(1px);
          box-shadow: 0 1px 0 #c2580a;
        }
        .btn-login:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #eceae3;
        }
        .divider span {
          font-size: 12px;
          color: #b0ada6;
          white-space: nowrap;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .test-accounts {
          background: #fafaf8;
          border: 1px dashed #d6d3c8;
          border-radius: 10px;
          padding: 12px 14px;
        }
        .test-accounts > p {
          font-size: 11px;
          font-weight: 600;
          color: #a8a49a;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }
        .test-accounts ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .test-accounts li {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          color: #7d7a72;
          padding: 4px 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .role-pill {
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 5px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .role-pill.operator {
          background: #fff8ed;
          color: #9a3f07;
        }
        .role-pill.qc {
          background: #ecfdf5;
          color: #065f46;
        }
        .role-pill.ppic {
          background: #eff6ff;
          color: #1e40af;
        }
        .role-pill.manager {
          background: #f5f3ff;
          color: #4c1d95;
        }

        /* ── Keyframes motion ── */
        @keyframes lp-fade-up {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes lp-orb-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-22px, 16px) scale(1.1); }
        }
        @keyframes lp-orb-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(18px, -14px) scale(1.12); }
        }
        @keyframes lp-rise {
          0% { transform: translateY(0) scale(0.9); opacity: 0; }
          12% { opacity: 0.7; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-340px) scale(1.2); opacity: 0; }
        }
        @keyframes lp-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-section,
          .left-headline,
          .left-sub,
          .feat,
          .left-footer {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .login-left::after,
          .login-left::before,
          .left-headline em,
          .lp-particle {
            animation: none !important;
          }
          .left-headline em {
            -webkit-text-fill-color: #ffa012;
          }
        }

        /* ── Tablet: persempit panel kiri ── */
        @media (max-width: 1024px) {
          .login-left {
            width: 40%;
            padding: 40px 36px;
          }
          .left-headline {
            font-size: 28px;
          }
        }

        /* ── Mobile: sembunyikan panel kiri, form full-screen ── */
        @media (max-width: 768px) {
          .login-page {
            background: #fdfcf9;
          }
          .login-left {
            display: none;
          }
          .login-right {
            padding: 32px 24px;
          }
          .mobile-brand {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
