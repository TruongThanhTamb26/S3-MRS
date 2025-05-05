import React from 'react';
import QRCode from 'react-qr-code';

interface QRCodeGeneratorProps {
  reservationId: number;
  action: 'check-in' | 'check-out';
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ reservationId, action, size = 200 }) => {
  const qrData = JSON.stringify({
    id: reservationId,
    action,
    timestamp: new Date().toISOString()
  });

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${action}-reservation-${reservationId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = url;
  };

  return (
    <div className="flex flex-col items-center">
      <div id="qr-code">
        <QRCode value={qrData} size={size} />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {action === 'check-in' ? 'Mã QR check-in' : 'Mã QR check-out'}
      </p>
      <button
        onClick={downloadQRCode}
        className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Tải xuống QR
      </button>
    </div>
  );
};

export default QRCodeGenerator;
