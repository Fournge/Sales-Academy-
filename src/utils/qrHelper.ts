import QRCode from 'qrcode';

export async function generateQrDataUrl(url: string, isDarkTheme = false): Promise<string> {
  if (!url || !url.trim()) return '';

  try {
    const dataUrl = await QRCode.toDataURL(url.trim(), {
      width: 256,
      margin: 1.5,
      color: {
        dark: isDarkTheme ? '#ffffff' : '#001a4d',
        light: isDarkTheme ? '#001438' : '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return '';
  }
}
