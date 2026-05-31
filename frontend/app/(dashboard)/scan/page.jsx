'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { Camera, CameraOff, ImageUp } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const handledRef = useRef(false); // cegah hasil ganda

  function routeFromQr(decodedText) {
    if (handledRef.current) return;
    try {
      const data = JSON.parse(decodedText);
      if (data.type === 'RAW_LOT' && data.id) {
        handledRef.current = true;
        stopScanner();
        router.push(`/raw-lots/${data.id}`);
      } else if (data.type === 'FINISHED_LOT' && data.id) {
        handledRef.current = true;
        stopScanner();
        router.push(`/finished-goods/${data.id}`);
      } else {
        toast.error('QR code tidak dikenali');
      }
    } catch {
      toast.error('QR code tidak bisa dibaca');
    }
  }

  async function startScanner() {
    setError(null);
    handledRef.current = false;

    const config = {
      fps: 10,
      qrbox: (viewWidth, viewHeight) => {
        const min = Math.min(viewWidth, viewHeight);
        const size = Math.floor(min * 0.7);
        return { width: size, height: size };
      },
      aspectRatio: 1.0,
      // Pakai BarcodeDetector bawaan browser bila tersedia → decode jauh lebih cepat & andal
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
    };

    const html5QrCode = new Html5Qrcode('qr-reader', { verbose: false });
    scannerRef.current = html5QrCode;
    setScanning(true);

    try {
      // Coba kamera belakang dulu
      await html5QrCode.start({ facingMode: 'environment' }, config, routeFromQr, () => {});
    } catch {
      try {
        // Fallback: kamera apa pun yang tersedia (mis. laptop tanpa kamera belakang)
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) throw new Error('no-camera');
        await html5QrCode.start(cameras[0].id, config, routeFromQr, () => {});
      } catch {
        setError('Tidak bisa mengakses kamera. Izinkan akses kamera, atau gunakan tombol Ambil Gambar.');
        scannerRef.current = null;
        setScanning(false);
      }
    }
  }

  function stopScanner() {
    const inst = scannerRef.current;
    if (inst) {
      scannerRef.current = null;
      inst.stop().then(() => inst.clear()).catch(() => {});
    }
    setScanning(false);
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset agar file sama bisa dipilih lagi
    if (!file) return;

    setError(null);
    handledRef.current = false;

    // scanFile butuh elemen yang bebas dari kamera live → hentikan dulu
    if (scannerRef.current) stopScanner();

    setDecoding(true);
    const scanner = new Html5Qrcode('qr-file-reader', { verbose: false });
    try {
      const decodedText = await scanner.scanFile(file, false);
      routeFromQr(decodedText);
    } catch {
      toast.error('QR tidak terdeteksi pada gambar. Coba foto lebih dekat & fokus.');
    } finally {
      scanner.clear().catch(() => {});
      setDecoding(false);
    }
  }

  useEffect(() => {
    return () => { stopScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Scan QR Code</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center">
        <div id="qr-reader" className="w-full max-w-md mb-4" style={{ minHeight: scanning ? 300 : 0 }}></div>
        {/* elemen tersembunyi khusus decode dari file gambar */}
        <div id="qr-file-reader" className="hidden"></div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <CameraOff className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {!scanning ? (
            <button onClick={startScanner} disabled={decoding} className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-medium transition">
              <Camera className="h-5 w-5" /> Start Scan
            </button>
          ) : (
            <button onClick={stopScanner} className="flex items-center gap-2 px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition">
              <CameraOff className="h-5 w-5" /> Stop
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={decoding}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg font-medium transition"
          >
            <ImageUp className="h-5 w-5" /> {decoding ? 'Memproses...' : 'Ambil Gambar'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>

        <p className="mt-4 text-sm text-slate-500 text-center">
          Arahkan kamera ke QR label lot, atau gunakan <strong>Ambil Gambar</strong> untuk memotret / mengunggah QR.
        </p>
      </div>
    </div>
  );
}
