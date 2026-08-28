import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa/offline";

export function PwaRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
