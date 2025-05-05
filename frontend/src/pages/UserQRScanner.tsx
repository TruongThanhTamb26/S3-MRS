import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import UserNavbar from '../components/UserNavbar';
import { userService } from '../services/user.service';

const UserQRScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasProcessedCode, setHasProcessedCode] = useState<boolean>(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scanning && scannerContainerRef.current) {
      const scannerId = "html5-qrcode-scanner";
      
      // Create scanner container if it doesn't exist
      if (!document.getElementById(scannerId) && scannerContainerRef.current) {
        const scannerElement = document.createElement("div");
        scannerElement.id = scannerId;
        scannerContainerRef.current.appendChild(scannerElement);
      }
      
      // Initialize scanner
      const html5QrCode = new Html5Qrcode(scannerId);
      qrScannerRef.current = html5QrCode;
      
      console.log("Starting QR scanner...");
      
      // Start scanning with throttled callback
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 5, // Giảm FPS xuống để giảm tần suất quét
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Thêm điều kiện kiểm tra trước khi xử lý
          if (!hasProcessedCode) {
            console.log("QR code detected:", decodedText.substring(0, 20) + "...");
            handleScan(decodedText);
          }
        },
        (errorMessage) => {
          // Ignore continuous errors - only show if we haven't successfully scanned yet
          if (!scanResult && errorMessage.includes("No QR code found")) {
            // Silent logging
          }
        }
      ).catch(err => {
        handleError(new Error(err));
      });
      
      // Cleanup function
      return () => {
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
          qrScannerRef.current.stop().catch(error => console.error("Error stopping scanner:", error));
        }
      };
    }
  }, [scanning]); // Only depend on scanning state
 

  const handleScan = async (data: string) => {
    // Ngăn xử lý nhiều lần cùng một mã QR
    if (data && !isProcessing && !hasProcessedCode) {
      // Đánh dấu đã xử lý để tránh gọi lại
      setHasProcessedCode(true);
      setIsProcessing(true);
      
      // Dừng scanner ngay lập tức
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        try {
          await qrScannerRef.current.stop();
          console.log("Scanner stopped successfully");
        } catch (error) {
          console.error("Error stopping scanner:", error);
        }
      }
      
      setScanning(false);
      setScanResult(data);
      
      console.log("Processing QR code:", data);
      
      try {
        // Parse QR data
        const qrData = JSON.parse(data);
        const { id, action } = qrData;
        
        if (!id || !action) {
          throw new Error('Mã QR thiếu thông tin cần thiết');
        }
        
        console.log(`Attempting ${action} for reservation #${id}`);
        
        // Process based on the action
        if (action === 'check-in') {
          const response = await userService.checkInReservation(id);
          console.log("Check-in response:", response);
          if (response.success) {
            setSuccess(`Check-in thành công cho đặt phòng #${id}`);
          } else {
            setError(response.message || `Không thể check-in cho đặt phòng #${id}`);
          }
        } else if (action === 'check-out') {
          const response = await userService.checkOutReservation(id);
          console.log("Check-out response:", response);
          if (response.success) {
            setSuccess(`Check-out thành công cho đặt phòng #${id}`);
          } else {
            setError(response.message || `Không thể check-out cho đặt phòng #${id}`);
          }
        } else {
          setError(`Hành động không hợp lệ: ${action}`);
        }
      } catch (err: any) {
        console.error('Error processing QR code:', err);
        setError(err.message || 'Mã QR không hợp lệ hoặc đã xảy ra lỗi');
      } finally {
        setIsProcessing(false);
      }
    } else if (data && hasProcessedCode) {
      console.log("QR code already processed, ignoring duplicate scan");
    }
  };

  const handleError = (err: Error) => {
    console.error('QR Scanner error:', err);
    setError('Không thể kết nối với camera. Vui lòng kiểm tra quyền truy cập camera.');
  };

  const resetScanner = () => {
    setScanResult(null);
    setError("");
    setSuccess("");
    setHasProcessedCode(false); // Reset trạng thái đã xử lý
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <UserNavbar title="QR Scanner" />
      
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Quét mã QR</h1>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate('/manage')}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Quay lại
                </button>
                
                {!scanning && (
                  <button 
                    onClick={resetScanner}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Quét mã khác
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError("")}>
                  <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <title>Đóng</title>
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                  </svg>
                </span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{success}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccess("")}>
                  <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <title>Đóng</title>
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                  </svg>
                </span>
              </div>
            )}
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="max-w-md mx-auto">
                {scanning ? (
                  <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                      Quét mã QR để check-in/check-out
                    </h2>
                    <div 
                      ref={scannerContainerRef}
                      className="bg-gray-100 p-1 rounded-lg overflow-hidden"
                      style={{ minHeight: '300px' }}
                    />
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Hướng camera về phía mã QR để quét
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    {isProcessing ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Đang xử lý...</p>
                      </div>
                    ) : success ? (
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="mt-4 text-lg font-medium text-gray-800">{success}</p>
                        <button 
                          onClick={resetScanner}
                          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Quét mã khác
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="mt-4 text-lg font-medium text-gray-800">{error || 'Đã xảy ra lỗi'}</p>
                        <button 
                          onClick={resetScanner}
                          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Thử lại
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-gray-800 text-white text-xs p-4 text-center">
        <p>Email: btstgroup@hcmut.edu.vn</p>
        <p>ĐT (Tel.): +84 363459876</p>
        <p>Trường ĐH Bách Khoa – 268 Lý Thường Kiệt, Q.10, TP.HCM</p>
        <p>Copyright 2025-20XX CO3001</p>
      </footer>
    </div>
  );
};

export default UserQRScanner;