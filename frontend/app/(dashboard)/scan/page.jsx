'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { Camera, CameraOff } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  function handleScanResult(decodedText) {
    try {
      const data = JSON.parse(decodedText);
      if (data.type === 'RAW_LOT' && data.id) {
        stopScanner();
        router.push(`/raw-lots/${data.id}`);
      } else if (data.type === 'FINISHED_LOT' && data.id) {
        stopScanner();
        router.push(`/finished-goods/${data.id}`);
      } else {
        toast.error('QR code tidak valid');
      }
    } catch {
      toast.error('QR code tidak dapat dibaca');
    }
  }

  async function startScanner() {
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanResult,
        () => {}
      );
      setScanning(true);
    } catch (err) {
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
      setScanning(false);
    }
  }

  function stopScanner() {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Scan QR Code</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center">
        <div id="qr-reader" ref={containerRef} className="w-full max-w-md mb-4" style={{ minHeight: scanning ? 300 : 0 }}></div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <CameraOff className="h-4 w-4" /> {error}
          </div>
        )}

        {!scanning ? (
          <button onClick={startScanner} className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition">
            <Camera className="h-5 w-5" /> Mulai Scan
          </button>
        ) : (
          <button onClick={stopScanner} className="flex items-center gap-2 px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition">
            <CameraOff className="h-5 w-5" /> Stop
          </button>
        )}

        <p className="mt-4 text-sm text-slate-500 text-center">
          Arahkan kamera ke QR code pada label lot untuk melihat detail
        </p>
      </div>
    </div>
  );
}
