import React, { useState, useRef, useEffect } from 'react';
import { X, Timer } from 'lucide-react';

interface CameraAppProps {
  onClose: () => void;
  onPhotoTaken: (photoData: string) => void;
  onOpenPhotos: () => void;
}

interface Photo {
  id: string;
  data: string;
  timestamp: number;
}

const CameraApp: React.FC<CameraAppProps> = ({ onClose, onPhotoTaken, onOpenPhotos }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [mostRecentPhoto, setMostRecentPhoto] = useState<Photo | null>(null);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);

  useEffect(() => {
    startCamera();
    loadMostRecentPhoto();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev && prev <= 1) {
            capturePhoto();
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  };

  const loadMostRecentPhoto = () => {
    const stored = localStorage.getItem('camera_photos');
    if (stored) {
      const photos = JSON.parse(stored);
      if (photos.length > 0) {
        setMostRecentPhoto(photos[photos.length - 1]);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      const photo: Photo = {
        id: Date.now().toString(),
        data: photoData,
        timestamp: Date.now()
      };

      // Save to localStorage
      const stored = localStorage.getItem('camera_photos');
      const photos = stored ? JSON.parse(stored) : [];
      photos.push(photo);
      localStorage.setItem('camera_photos', JSON.stringify(photos));

      setMostRecentPhoto(photo);
      onPhotoTaken(photoData);
    }

    setTimeout(() => {
      setIsCapturing(false);
      setCountdown(null);
      setSelectedTimer(null);
      setTimer(null);
    }, 200);
  };

  const handleTimerSelect = (seconds: number) => {
    if (selectedTimer === seconds) {
      // Reset to no timer
      setSelectedTimer(null);
      setTimer(null);
    } else {
      setSelectedTimer(seconds);
      setTimer(seconds);
    }
  };

  const handleShutterPress = () => {
    if (timer) {
      setCountdown(timer);
    } else {
      capturePhoto();
    }
  };

  return (
    <div 
      className="absolute inset-0 bg-black z-50 flex flex-col overflow-hidden"
      style={{ borderRadius: '40px' }}
    >
      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Countdown Overlay */}
        {countdown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-8xl font-light animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Flash Effect */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white animate-pulse" />
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* Controls */}
      <div className="bg-black px-4 py-6">
        {/* Timer Controls */}
        <div className="flex justify-center items-center mb-6 space-x-8">
          <div className="flex items-center space-x-4">
            <Timer size={20} className="text-white" />
            <span className="text-white text-sm">
              {selectedTimer ? `${selectedTimer}s` : 'Off'}
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setSelectedTimer(null);
                setTimer(null);
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTimer === null
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 text-white'
              }`}
            >
              Off
            </button>
            {[3, 5, 10].map((seconds) => (
              <button
                key={seconds}
                onClick={() => handleTimerSelect(seconds)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTimer === seconds
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between">
          {/* Recent Photo */}
          <div className="w-12 h-12">
            {mostRecentPhoto ? (
              <button
                onClick={onOpenPhotos}
                className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20"
              >
                <img
                  src={mostRecentPhoto.data}
                  alt="Recent"
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <div className="w-12 h-12 rounded-lg border-2 border-white/20 bg-gray-800" />
            )}
          </div>

          {/* Shutter Button */}
          <button
            onClick={handleShutterPress}
            disabled={countdown !== null}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            <div className="w-16 h-16 bg-white border-4 border-black rounded-full" />
          </button>

          {/* Placeholder for balance */}
          <div className="w-12" />
        </div>
      </div>
    </div>
  );
};

export default CameraApp;