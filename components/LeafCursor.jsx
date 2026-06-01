'use client';

import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, input, textarea, select, label, [role="button"], [data-clickable]';

export default function LeafCursor() {
  const leafRef = useRef(null);
  const haloRef = useRef(null);

  useEffect(() => {
    // Lewati device touch — tidak ada pointer fisik
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const leaf = { x: target.x, y: target.y };
    const halo = { x: target.x, y: target.y };
    const state = { hover: false, down: false, visible: false };
    let raf;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!state.visible) {
        state.visible = true;
        if (leafRef.current) leafRef.current.style.opacity = '1';
        if (haloRef.current) haloRef.current.style.opacity = '1';
      }
      const el = e.target;
      state.hover = !!(el && el.closest && el.closest(INTERACTIVE));
    };
    const onDown = () => { state.down = true; };
    const onUp = () => { state.down = false; };
    const onLeave = () => {
      state.visible = false;
      if (leafRef.current) leafRef.current.style.opacity = '0';
      if (haloRef.current) haloRef.current.style.opacity = '0';
    };

    const loop = () => {
      // leaf mengejar cepat, halo lebih lambat (efek trail)
      leaf.x += (target.x - leaf.x) * 0.22;
      leaf.y += (target.y - leaf.y) * 0.22;
      halo.x += (target.x - halo.x) * 0.12;
      halo.y += (target.y - halo.y) * 0.12;

      // tilt berdasarkan kecepatan gerak
      const tilt = Math.max(-22, Math.min(22, (target.x - leaf.x) * 1.1));
      const leafScale = (state.down ? 0.8 : 1) * (state.hover ? 1.45 : 1);
      const haloScale = state.hover ? 1.7 : 1;

      if (leafRef.current) {
        leafRef.current.style.transform =
          `translate3d(${leaf.x}px, ${leaf.y}px, 0) translate(-50%, -50%) rotate(${-18 + tilt}deg) scale(${leafScale})`;
      }
      if (haloRef.current) {
        haloRef.current.style.transform =
          `translate3d(${halo.x}px, ${halo.y}px, 0) translate(-50%, -50%) scale(${haloScale})`;
        haloRef.current.style.opacity = state.visible ? (state.hover ? '0.9' : '0.55') : '0';
      }
      raf = requestAnimationFrame(loop);
    };

    document.documentElement.classList.add('leaf-cursor-active');
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove('leaf-cursor-active');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Halo glow lembut */}
      <div
        ref={haloRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0,
          transition: 'opacity 0.25s ease',
          willChange: 'transform, opacity',
        }}
      />
      {/* Daun */}
      <div
        ref={leafRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0,
          transition: 'opacity 0.25s ease',
          willChange: 'transform',
          filter: 'drop-shadow(0 2px 4px rgba(154,63,7,0.35))',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="leaf-cursor-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFBC45" />
              <stop offset="1" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <path
            d="M4 20 C4 9.5 11 4 21 4 C21 14 14.5 20 4 20 Z"
            fill="url(#leaf-cursor-grad)"
          />
          <path
            d="M5 19 C9.5 14 14 9.5 19 6.5"
            stroke="#FFFFFF"
            strokeOpacity="0.85"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}
