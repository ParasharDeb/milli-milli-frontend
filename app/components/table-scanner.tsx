"use client";

import { useEffect, useRef, useState } from "react";
import { tableFromQr } from "@/app/lib/table";

/**
 * Opens the back camera and watches for the QR code on the table.
 *
 * Uses the browser's own BarcodeDetector where there is one (Chrome on Android)
 * and falls back to jsQR on a canvas everywhere else -- notably iOS Safari,
 * which has the camera but not the detector. The camera needs a secure origin:
 * https in production, or localhost.
 */

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type DetectorCtor = new (opts: { formats: string[] }) => Detector;

type ScanState =
  | { kind: "starting" }
  | { kind: "scanning"; hint: string | null }
  | { kind: "error"; message: string };

const SCAN_EVERY_MS = 200;
const MAX_SIDE = 640;

function cameraError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera access was blocked. Allow it in your browser settings, or type your table number below.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera found on this device. Type your table number below.";
  }
  return "Couldn't start the camera. Type your table number below.";
}

export function TableScanner({ onDetect }: { onDetect: (table: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<ScanState>({ kind: "starting" });
  // Held in a ref so a parent re-render doesn't restart the camera.
  const onDetectRef = useRef(onDetect);
  useEffect(() => {
    onDetectRef.current = onDetect;
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let stopped = false;

    async function start() {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setState({ kind: "error", message: "The camera only works over a secure (https) connection. Type your table number below." });
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch (err) {
        if (!stopped) setState({ kind: "error", message: cameraError(err) });
        return;
      }
      if (stopped) return stream.getTracks().forEach((t) => t.stop());

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setState({ kind: "scanning", hint: null });

      const Native = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
      const detector = Native ? new Native({ formats: ["qr_code"] }) : null;
      const jsQR = detector ? null : (await import("jsqr")).default;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      async function readFrame(): Promise<string | null> {
        if (video.readyState < 2 || !video.videoWidth) return null;
        if (detector) {
          const codes = await detector.detect(video).catch(() => []);
          return codes[0]?.rawValue ?? null;
        }
        if (!jsQR || !ctx) return null;
        const scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" })?.data ?? null;
      }

      async function tick() {
        if (stopped) return;
        const text = await readFrame();
        if (stopped) return;
        if (text) {
          const table = tableFromQr(text);
          if (table) {
            navigator.vibrate?.(40);
            onDetectRef.current(table);
            return;
          }
          setState({ kind: "scanning", hint: "That isn't a table code — look for the one on your table." });
        }
        timer = window.setTimeout(tick, SCAN_EVERY_MS);
      }
      tick();
    }

    start();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (state.kind === "error") {
    return (
      <p className="rounded-xl border border-ember/30 bg-ember/5 px-4 py-3 text-[13px] leading-relaxed text-ink/70">
        {state.message}
      </p>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-ink">
      <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
      {/* viewfinder */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[62%] w-[62%] rounded-2xl border-2 border-cream/80 shadow-[0_0_0_9999px_rgba(28,20,15,0.45)]" />
      </div>
      <p className="absolute inset-x-0 bottom-0 px-4 pb-3 text-center text-[12.5px] text-cream/90">
        {state.kind === "starting"
          ? "Starting the camera…"
          : (state.hint ?? "Point at the QR code on your table")}
      </p>
    </div>
  );
}
