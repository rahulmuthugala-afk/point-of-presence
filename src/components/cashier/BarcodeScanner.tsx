import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onManualEntry: (barcode: string) => void;
}

export function BarcodeScanner({ onScan, onManualEntry }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    try {
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.ITF,
      ];

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('barcode-reader', {
          formatsToSupport,
          verbose: false,
        });
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
          disableFlip: false,
        },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please use manual entry.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onManualEntry(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Barcode Scanner</h3>
        <button
          onClick={isScanning ? stopScanning : startScanning}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            isScanning
              ? 'bg-danger/20 text-danger hover:bg-danger/30'
              : 'gradient-primary text-primary-foreground hover:opacity-90'
          )}
        >
          {isScanning ? (
            <>
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Start Camera
            </>
          )}
        </button>
      </div>

      {/* Camera View */}
      <div
        ref={containerRef}
        className={cn(
          'relative rounded-lg overflow-hidden bg-muted mb-4 transition-all',
          isScanning ? 'h-64' : 'h-32'
        )}
      >
        <div id="barcode-reader" className="w-full h-full" />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Click "Start Camera" to scan barcodes</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Manual Entry */}
      <form onSubmit={handleManualSubmit}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode manually..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!manualBarcode.trim()}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
