"use client";

import { useEffect } from "react";

const PwaRegister = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  return null;
};

export default PwaRegister;
