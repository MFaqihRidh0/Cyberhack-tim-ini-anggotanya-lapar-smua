'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';

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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F3EE 100%)',
      }}
    >
      {/* Botanical background pattern — very subtle */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.04 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="leaf-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 10 C25 10 10 25 10 40 C10 55 25 70 40 70 C40 70 40 40 40 10Z" fill="#3D3B36" />
            <path d="M40 10 C55 10 70 25 70 40 C70 55 55 70 40 70 C40 70 40 40 40 10Z" fill="#3D3B36" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
      </svg>

      {/* Card */}
      <div
        className="relative w-full"
        style={{
          maxWidth: '400px',
          margin: '0 16px',
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(22, 20, 14, 0.12)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center mb-3"
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#FFF8ED',
              borderRadius: '16px',
            }}
          >
            <Leaf style={{ width: '28px', height: '28px', color: '#F97316' }} />
          </div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '28px',
              color: '#C2580A',
              lineHeight: 1.1,
              marginBottom: '6px',
            }}
          >
            SimaTrack
          </h1>
          <p style={{ fontSize: '13px', color: '#7D7A72' }}>
            Sima Arome Manufacturing System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#57544E',
                marginBottom: '6px',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@sima.com"
              style={{
                width: '100%',
                padding: '9px 13px',
                border: '1px solid #ECEAE3',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#28261F',
                background: 'white',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FFA012';
                e.target.style.boxShadow = '0 0 0 3px #FFEECF';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ECEAE3';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#57544E',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '9px 13px',
                border: '1px solid #ECEAE3',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#28261F',
                background: 'white',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FFA012';
                e.target.style.boxShadow = '0 0 0 3px #FFEECF';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ECEAE3';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              background: loading ? '#A8A49A' : '#F97316',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#C2580A'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#F97316'; }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Test accounts */}
        <div
          style={{
            marginTop: '24px',
            padding: '14px 16px',
            background: '#FAFAF8',
            border: '1px dashed #D6D3C8',
            borderRadius: '10px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#7D7A72', marginBottom: '8px' }}>
            Test Accounts:
          </p>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: '#57544E',
              lineHeight: 1.8,
            }}
          >
            <p>operator@sima.com / password123</p>
            <p>qc@sima.com / password123</p>
            <p>ppic@sima.com / password123</p>
            <p>manager@sima.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
