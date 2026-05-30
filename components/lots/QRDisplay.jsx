'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Download, Printer } from 'lucide-react';

export default function QRDisplay({ lotId, lotType, lotNumber }) {
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    const endpoint = lotType === 'raw' ? `/raw-lots/${lotId}/qr` : `/finished-lots/${lotId}/qr`;
    api.get(endpoint, { responseType: 'blob' }).then((res) => {
      const url = URL.createObjectURL(res.data);
      setQrUrl(url);
    }).catch(() => {});
  }, [lotId, lotType]);

  function handleDownload() {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR-${lotNumber}.png`;
    a.click();
  }

  function handlePrint() {
    if (!qrUrl) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>QR - ${lotNumber}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;">
        <h2>${lotNumber}</h2>
        <img src="${qrUrl}" style="width:300px;height:300px;" />
      </body></html>
    `);
    win.document.close();
    win.onload = () => { win.print(); win.close(); };
  }

  if (!qrUrl) {
    return <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg"></div>;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <img src={qrUrl} alt={`QR Code ${lotNumber}`} className="w-48 h-48 border border-slate-200 rounded-lg" />
      <p className="text-sm font-medium text-slate-600">{lotNumber}</p>
      <div className="flex gap-2">
        <button onClick={handleDownload} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition">
          <Download className="h-4 w-4" /> Download
        </button>
        <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>
    </div>
  );
}
