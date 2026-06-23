"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PermissionState =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported";

const SOUND_THRESHOLD = 0.02;
const SILENCE_TIMEOUT_MS = 4000;

type AudioContextConstructor = typeof AudioContext;

const getAudioContextConstructor = (): AudioContextConstructor | null => {
  if (typeof window === "undefined") return null;
  if (typeof AudioContext !== "undefined") return AudioContext;

  const win = window as Window & {
    webkitAudioContext?: AudioContextConstructor;
  };
  return win.webkitAudioContext ?? null;
};

const MicCheck = () => {
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [level, setLevel] = useState(0);
  const [heardYou, setHeardYou] = useState(false);
  const [silenceWarning, setSilenceWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastLoudAtRef = useRef(0);
  const heardYouRef = useRef(false);
  const silenceWarningRef = useRef(false);

  const stopAll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    analyserRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
    }
    audioContextRef.current = null;
    heardYouRef.current = false;
    silenceWarningRef.current = false;
    setLevel(0);
    setHeardYou(false);
    setSilenceWarning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  const monitorLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const buffer = new Uint8Array(analyser.fftSize);

    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(buffer);

      let sumSquares = 0;
      for (let i = 0; i < buffer.length; i++) {
        const normalized = (buffer[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / buffer.length);
      setLevel(Math.min(1, rms * 4));

      const now = performance.now();
      if (rms > SOUND_THRESHOLD) {
        lastLoudAtRef.current = now;
        if (!heardYouRef.current) {
          heardYouRef.current = true;
          setHeardYou(true);
        }
        if (silenceWarningRef.current) {
          silenceWarningRef.current = false;
          setSilenceWarning(false);
        }
      } else if (
        !heardYouRef.current &&
        !silenceWarningRef.current &&
        now - lastLoudAtRef.current > SILENCE_TIMEOUT_MS
      ) {
        silenceWarningRef.current = true;
        setSilenceWarning(true);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const attachStream = useCallback(
    async (deviceId?: string) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        await audioContextRef.current.close();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      });

      const AudioContextClass = getAudioContextConstructor();
      if (!AudioContextClass) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Web Audio API is not supported in this browser.");
      }

      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      lastLoudAtRef.current = performance.now();
      heardYouRef.current = false;
      silenceWarningRef.current = false;
      setHeardYou(false);
      setSilenceWarning(false);

      monitorLevel();

      const activeDeviceId = stream.getAudioTracks()[0]?.getSettings().deviceId;
      if (activeDeviceId) setSelectedDeviceId(activeDeviceId);
    },
    [monitorLevel]
  );

  const handleTestMic = async () => {
    setError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermission("unsupported");
      return;
    }

    setPermission("requesting");

    try {
      await attachStream();
      setPermission("granted");

      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList.filter((device) => device.kind === "audioinput"));
    } catch (err) {
      stopAll();
      setPermission("denied");

      if (err instanceof DOMException) {
        if (err.name === "NotFoundError") {
          setError("No microphone was found on this device.");
        } else if (err.name !== "NotAllowedError" && err.name !== "PermissionDeniedError") {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    try {
      await attachStream(deviceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not switch microphone.");
    }
  };

  const handleStop = () => {
    stopAll();
    setPermission("idle");
  };

  const isGranted = permission === "granted";

  return (
    <div className="card-border w-full">
      <div className="card flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3>Microphone check</h3>
            <p className="text-sm">
              Make sure your mic is working before you start the interview.
            </p>
          </div>

          {isGranted ? (
            <button type="button" onClick={handleStop} className="btn-secondary">
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTestMic}
              disabled={permission === "requesting"}
              className="btn-primary"
            >
              {permission === "requesting" ? "Requesting access..." : "Test microphone"}
            </button>
          )}
        </div>

        {permission === "unsupported" && (
          <p className="text-destructive-100 text-sm">
            Your browser doesn&apos;t support microphone access. Try the latest
            Chrome, Edge, or Firefox.
          </p>
        )}

        {permission === "denied" && (
          <p className="text-destructive-100 text-sm">
            Microphone access was blocked. Click the lock/camera icon in your
            browser&apos;s address bar, allow microphone access for this site,
            then click &quot;Test microphone&quot; again.
            {error ? ` (${error})` : ""}
          </p>
        )}

        {isGranted && (
          <div className="flex flex-col gap-4">
            {devices.length > 0 && (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-light-100">Microphone</span>
                <select
                  value={selectedDeviceId}
                  onChange={(event) => handleDeviceChange(event.target.value)}
                  className="bg-dark-200 rounded-full min-h-12 px-5 border border-input text-light-100"
                >
                  {devices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${index + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="flex flex-col gap-2">
              <div className="h-3 w-full rounded-full bg-dark-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-200 transition-[width] duration-100"
                  style={{ width: `${Math.round(level * 100)}%` }}
                />
              </div>

              {heardYou ? (
                <p className="text-success-100 text-sm font-semibold">
                  ✓ We can hear you — your mic is working.
                </p>
              ) : silenceWarning ? (
                <p className="text-destructive-100 text-sm font-semibold">
                  We&apos;re not detecting any sound — check your mic selection
                  or system volume.
                </p>
              ) : (
                <p className="text-light-400 text-sm">
                  Say something to test your mic...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MicCheck;
