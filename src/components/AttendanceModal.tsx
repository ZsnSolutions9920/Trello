"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CameraCapture } from "@/components/ui/CameraCapture";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { api } from "@/lib/api";
import type { AttendanceRecord } from "@/types";

type AttendanceStatus = "not_signed_in" | "signed_in" | "signed_out";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  status: AttendanceStatus;
  onStatusChange: (status: AttendanceStatus, record: AttendanceRecord | null) => void;
}

export function AttendanceModal({ isOpen, onClose, status, onStatusChange }: Props) {
  const [step, setStep] = useState<"confirm" | "camera" | "submitting" | "done">("confirm");
  const [error, setError] = useState("");

  const action = status === "not_signed_in" ? "sign-in" : "sign-out";
  const actionLabel = action === "sign-in" ? "Clock In" : "Clock Out";

  const handleCapture = async (photo: string) => {
    setStep("submitting");
    setError("");
    try {
      const record = await api.attendance.submit(action, photo);
      setStep("done");
      onStatusChange(action === "sign-in" ? "signed_in" : "signed_out", record);
      setTimeout(() => {
        onClose();
        setStep("confirm");
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
      setStep("camera");
    }
  };

  const handleClose = () => {
    onClose();
    setStep("confirm");
    setError("");
  };

  const title =
    step === "done"
      ? action === "sign-in" ? "Signed in!" : "Signed out!"
      : `Attendance — ${actionLabel}`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {step === "done" ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-ink-secondary text-sm">
            {action === "sign-in"
              ? "Your attendance has been recorded. Have a great day!"
              : "You've signed out. See you tomorrow!"}
          </p>
        </div>
      ) : step === "submitting" ? (
        <div className="text-center py-10">
          <LoadingDots className="mb-3 flex justify-center gap-2" />
          <p className="text-ink-secondary text-sm">Recording your attendance...</p>
        </div>
      ) : step === "camera" ? (
        <div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 border border-red-100">
              {error}
            </div>
          )}
          <p className="text-ink-secondary text-sm mb-4">
            Take a photo to confirm your {action === "sign-in" ? "sign in" : "sign out"}.
          </p>
          <CameraCapture
            onCapture={handleCapture}
            onCancel={() => setStep("confirm")}
          />
        </div>
      ) : (
        /* Confirm step */
        <div className="space-y-4">
          <p className="text-ink-secondary text-sm">
            {action === "sign-in"
              ? "You're about to mark your attendance for today. A photo will be taken for verification."
              : "You're about to sign out for today. A photo will be taken for verification."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("camera")}
              className="bg-black text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-800 transition-all duration-150 active:scale-[0.97]"
            >
              Open Camera
            </button>
            <button
              onClick={handleClose}
              className="text-ink-secondary text-sm px-4 py-2.5 border border-border rounded-xl hover:text-ink hover:border-ink-tertiary transition-all duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
