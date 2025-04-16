import React, { useRef, useState, useEffect } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageCaptureProps {
  onImageCaptured: (imageData: string) => void;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onImageCaptured }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle video element creation and camera initialization
  useEffect(() => {
    if (showCamera && videoRef.current && !streamRef.current) {
      initializeCamera().catch((error) => {
        console.error("Failed to initialize camera:", error);
        stopCamera();
      });
    }
  }, [showCamera]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onImageCaptured(result);
      setShowCamera(false);
    };
    reader.readAsDataURL(file);
  };

  const initializeCamera = async () => {
    if (!videoRef.current) {
      throw new Error("Video element not found");
    }

    try {
      setIsCameraLoading(true);

      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }).catch(() => {
        // Fallback to any available camera
        return navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      });

      if (!stream) {
        throw new Error("Failed to get camera stream");
      }

      // Store the stream
      streamRef.current = stream;

      // Set up video element
      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      // Wait for the video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!video) return reject(new Error("Video element not found"));

        const timeoutId = setTimeout(() => {
          reject(new Error("Video stream timed out"));
        }, 10000);

        video.onloadedmetadata = async () => {
          clearTimeout(timeoutId);
          try {
            await video.play();
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        video.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error("Video failed to load"));
        };
      });

      return stream;
    } catch (error: any) {
      console.error("Camera initialization error:", error);
      let errorMessage = "Could not access camera. ";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage += "Please allow camera access in your browser settings and try again.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "No camera device was found on your device.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage += "Your camera may be in use by another application.";
      } else {
        errorMessage += error.message || "Please check permissions and try again.";
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsCameraLoading(false);
    }
  };

  const startCamera = () => {
    setShowCamera(true);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error("Error stopping track:", e);
        }
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    
    setShowCamera(false);
  };

  const captureImage = () => {
    if (!videoRef.current) {
      toast.error("Camera not ready. Please try again.");
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not get canvas context");
      }

      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to image data
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setPreviewUrl(imageData);
      onImageCaptured(imageData);
      stopCamera();
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Failed to capture image. Please try again.");
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    stopCamera();
  };

  return (
    <Card className="p-4 w-full">
      <div className="flex flex-col space-y-4">
        {!showCamera ? (
          <>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={startCamera}
                disabled={isCameraLoading}
              >
                <Camera className="mr-2 h-4 w-4" />
                {isCameraLoading ? "Loading..." : "Camera"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {previewUrl && (
              <div className="relative">
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img
                  src={previewUrl}
                  alt="Food preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {!previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-gray-500">
                <Camera className="h-12 w-12 mb-4" />
                <p className="text-center">Take a photo or upload an image of your food</p>
              </div>
            )}
          </>
        ) : (
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-10">
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={stopCamera}
              >
                <X className="h-6 w-6" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full",
                  "bg-food-green hover:bg-food-green-dark"
                )}
                onClick={captureImage}
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageCapture;
