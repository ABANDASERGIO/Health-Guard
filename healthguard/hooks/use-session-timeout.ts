"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WARNING_MS = 25 * 60 * 1000;
const TIMEOUT_MS = 30 * 60 * 1000;

export function useSessionTimeout(onExpire: () => void, enabled: boolean) {
  const [showWarning, setShowWarning] = useState(false);
  const lastActivity = useRef(Date.now());
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (expireTimer.current) clearTimeout(expireTimer.current);
    warningTimer.current = null;
    expireTimer.current = null;
  }, []);

  const bump = useCallback(() => {
    lastActivity.current = Date.now();
    setShowWarning(false);
    clearTimers();
    if (!enabled) return;

    warningTimer.current = setTimeout(() => setShowWarning(true), WARNING_MS);
    expireTimer.current = setTimeout(() => {
      onExpire();
      setShowWarning(false);
    }, TIMEOUT_MS);
  }, [clearTimers, enabled, onExpire]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handler = () => bump();
    events.forEach((e) => window.addEventListener(e, handler));
    bump();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimers();
    };
  }, [bump, clearTimers, enabled]);

  const extendSession = useCallback(() => {
    bump();
  }, [bump]);

  return { showWarning, extendSession };
}
