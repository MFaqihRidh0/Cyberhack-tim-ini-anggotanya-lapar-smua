'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Download, Printer } from 'lucide-react';

/**
 * Menampilkan QR code sebuah lot.
 *
 * Props:
 *  - lotId            : id lot
 *  - lotNumber        : nomor lot (ditampilkan + nama file)
 *  - lotType          : 'raw-lots' | 'finished-goods' (segmen endpoint API)
 *  - materialOrProduct: nama material (raw) atau produk (finished) — tampil di label print
 *  - isOperator       : true jika role OPERATOR → tombol Download & Print muncul
 *
 * QR image tampil untuk SEMUA role; Download/Print hanya OPERATOR.
 */
export default function QRDisplay({ lotId, lotNumber, lotType, materialOrProduct, isOperator, canDownload }) {
  const showActions = isOperator || canDownload;
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    let revoked = false;
    let objectUrl = null;
    api
      .get(`/${lotType}/${lotId}/qr`, { responseType: 'blob' })
      .then((res) => {
        if (revoked) return;
        objectUrl = URL.createObjectURL(res.data);
        setQrUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
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
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>QR Label - ${lotNumber}</title>
          <style>
            body { font-family: monospace; text-align: center; padding: 40px; margin: 0; }
            .label { border: 3px solid #1C1A14; padding: 24px; display: inline-block; border-radius: 8px; }
            .brand { font-size: 13px; font-weight: bold; letter-spacing: 0.1em; margin-bottom: 4px; }
            .sub { font-size: 10px; color: #666; margin-bottom: 16px; }
            img { width: 240px; height: 240px; display: block; margin: 0 auto; }
            .lot-number { font-size: 14px; font-weight: bold; margin-top: 14px; margin-bottom: 4px; }
            .meta { font-size: 11px; color: #555; }
            .divider { border-top: 1px dashed #ccc; margin: 12px 0; }
          </style>
        </head>
        <body>
          <div class="label">
            <p class="brand">SIMATRACK</p>
            <p class="sub">Sima Arome Manufacturing</p>
            <img src="${qrUrl}" />
            <div class="divider"></div>
            <p class="lot-number">${lotNumber}</p>
            <p class="meta">${materialOrProduct || ''}</p>
          </div>
          <script>
            window.onload = () => setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  }

  return (
    <div className="qr-section">
      <h3>QR Code</h3>

      <div className="qr-image-wrap">
        {qrUrl ? (
          <img src={qrUrl} alt={`QR Code ${lotNumber}`} />
        ) : (
          <div className="w-full h-[200px] bg-slate-100 animate-pulse rounded-lg" />
        )}
      </div>

      <div>
        <span className="qr-lot-number">{lotNumber}</span>
      </div>

      {showActions ? (
        <div className="qr-actions">
          <button
            onClick={handleDownload}
            disabled={!qrUrl}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          <button
            onClick={handlePrint}
            disabled={!qrUrl}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      ) : (
        <p className="qr-operator-only">Download &amp; print tersedia untuk OPERATOR</p>
      )}
    </div>
  );
}
