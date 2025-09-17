import React, { useEffect, useRef, useState } from 'react';

interface ScanResult {
    status: 'valid' | 'invalid';
    message: string;
}

export function QrCodeScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasCamera, setHasCamera] = useState(true);

    useEffect(() => {
        // Check if camera is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setHasCamera(false);
            setError('Camera access is not supported by your browser.');
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startScanning = async () => {
        try {
            setError(null);
            setResult(null);

            if (!hasCamera || !videoRef.current) return;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setIsScanning(true);

            // Start scanning for QR codes
            scanForQRCode();
        } catch (error) {
            console.error('Error starting scanner:', error);
            setError('Failed to access camera. Please check permissions and try again.');
        }
    };

    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    };

    const scanForQRCode = async () => {
        if (!videoRef.current || !canvasRef.current || !isScanning) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context || video.videoWidth === 0 || video.videoHeight === 0) {
            // Video not ready yet, try again
            setTimeout(scanForQRCode, 100);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            // Try to detect QR code using BarcodeDetector API if available
            if ('BarcodeDetector' in window) {
                const DetectorClass = (window as { BarcodeDetector?: unknown }).BarcodeDetector;
                if (DetectorClass && typeof DetectorClass === 'function') {
                    const detector = new (DetectorClass as new (options: { formats: string[] }) => {
                        detect: (canvas: HTMLCanvasElement) => Promise<{ rawValue: string }[]>
                    })({ formats: ['qr_code'] });
                    const barcodes = await detector.detect(canvas);
                
                    if (barcodes.length > 0) {
                        const qrData = barcodes[0].rawValue;
                        await handleQRCodeDetected(qrData);
                        return;
                    }
                }
            }
        } catch {
            // BarcodeDetector not available or failed, continue scanning
        }

        // Continue scanning if no QR code detected
        if (isScanning) {
            setTimeout(scanForQRCode, 100);
        }
    };

    const handleQRCodeDetected = async (qrData: string) => {
        setIsLoading(true);
        
        try {
            // Send POST request to verify endpoint
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ qrcode: qrData }),
            });

            const data = await response.json();
            setResult(data);
            
            // Stop scanning after successful scan
            stopScanning();
        } catch (error) {
            console.error('Error verifying QR code:', error);
            setError('Failed to verify QR code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetScanner = () => {
        setResult(null);
        setError(null);
        setIsLoading(false);
    };

    const handleManualEntry = async () => {
        const qrData = prompt('Enter QR code data manually:');
        if (qrData) {
            await handleQRCodeDetected(qrData);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        📱 QR Code Scanner
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Scan QR codes to verify tickets
                    </p>
                </div>

                {/* Camera View */}
                <div className="relative mb-6">
                    <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-700 relative">
                        {hasCamera ? (
                            <>
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    playsInline
                                    muted
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="hidden"
                                />
                                
                                {/* Scanning overlay */}
                                {isScanning && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-48 h-48 border-4 border-blue-500 rounded-lg opacity-50">
                                            <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-blue-500"></div>
                                            <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-blue-500"></div>
                                            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-blue-500"></div>
                                            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-blue-500"></div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    <div className="text-4xl mb-4">📷</div>
                                    <p>Camera not available</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {isLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="bg-white rounded-lg p-4 flex items-center gap-3 dark:bg-gray-800">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-gray-900 dark:text-white">Verifying...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex gap-3 mb-6">
                    {hasCamera && (
                        <>
                            {!isScanning ? (
                                <button
                                    onClick={startScanning}
                                    disabled={isLoading}
                                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    🎯 Start Scanning
                                </button>
                            ) : (
                                <button
                                    onClick={stopScanning}
                                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    ⏹️ Stop Scanning
                                </button>
                            )}
                        </>
                    )}
                    
                    <button
                        onClick={handleManualEntry}
                        disabled={isLoading || isScanning}
                        className="px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ✏️ Manual
                    </button>
                    
                    {(result || error) && (
                        <button
                            onClick={resetScanner}
                            className="px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                        >
                            🔄 Reset
                        </button>
                    )}
                </div>

                {/* Results */}
                {result && (
                    <div className={`p-4 rounded-lg text-center ${
                        result.status === 'valid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                        <div className="text-2xl mb-2">
                            {result.status === 'valid' ? '✅' : '❌'}
                        </div>
                        <div className="font-semibold text-lg">
                            {result.message}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-100 text-red-800 rounded-lg text-center dark:bg-red-900 dark:text-red-200">
                        <div className="text-2xl mb-2">⚠️</div>
                        <div className="font-semibold">
                            {error}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!isScanning && !result && !error && (
                    <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            📋 How to use:
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {hasCamera ? (
                                <>
                                    <li>• Click "Start Scanning" to activate camera</li>
                                    <li>• Point your camera at a QR code</li>
                                    <li>• Wait for automatic detection</li>
                                    <li>• View the verification result</li>
                                </>
                            ) : (
                                <>
                                    <li>• Camera not available on this device</li>
                                    <li>• Use "Manual" button to enter QR data</li>
                                    <li>• Or try on a device with camera support</li>
                                </>
                            )}
                        </ul>
                        
                        {!hasCamera && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded dark:bg-yellow-900/20">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    💡 This browser or device doesn't support camera access. 
                                    You can still test the verification by using the "Manual" button.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}