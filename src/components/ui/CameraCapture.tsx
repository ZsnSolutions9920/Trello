"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface Props {
  onCapture: (photoBase64: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [captured, setCaptured] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 480, height: 480 } })
      .then((s) => {
        if (!mounted) { s.getTracks().forEach((t) => t.stop()); return; }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError("Camera access denied. Please allow camera permissions."));

    return () => {
      mounted = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCaptured(dataUrl);
    // Stop the camera after capture
    stream?.getTracks().forEach((t) => t.stop());
  }, [stream]);

  const handleRetake = () => {
    setCaptured(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 480, height: 480 } })
      .then((s) => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button onClick={onCancel} className="text-ink-secondary text-sm hover:text-ink">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {captured ? (
        /* Preview captured photo */
        <div className="relative">
          <img
            src={captured}
            alt="Captured"
            className="w-full rounded-xl border border-border"
          />
        </div>
      ) : (
        /* Live camera feed */
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-xl border border-border bg-black"
          />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-3 justify-center">
        {captured ? (
          <>
            <button
              onClick={() => onCapture(captured)}
              className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-800 transition-all duration-150 active:scale-[0.97]"
            >
              Use photo
            </button>
            <button
              onClick={handleRetake}
              className="text-ink-secondary text-sm px-4 py-2.5 border border-border rounded-xl hover:text-ink hover:border-ink-tertiary transition-all duration-150"
            >
              Retake
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleCapture}
              className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-800 transition-all duration-150 active:scale-[0.97]"
            >
              Take photo
            </button>
            <button
              onClick={onCancel}
              className="text-ink-secondary text-sm px-4 py-2.5 border border-border rounded-xl hover:text-ink hover:border-ink-tertiary transition-all duration-150"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
