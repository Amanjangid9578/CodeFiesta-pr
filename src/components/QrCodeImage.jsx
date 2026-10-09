import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCodeImage({ value, size = 128, className = '' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!value) {
      setSrc('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#386641', light: '#ffffff' },
    }).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [value, size]);

  if (!src) {
    return (
      <div
        className={`bg-[#f2e8cf] animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={src}
      alt="Admit card QR code"
      width={size}
      height={size}
      className={className}
    />
  );
}
