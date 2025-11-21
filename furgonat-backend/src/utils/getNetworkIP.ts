// Utility për të marrë IP address të kompjuterit
import os from "os";

export function getNetworkIP(): string {
  const interfaces = os.networkInterfaces();
  
  if (!interfaces) {
    return "localhost";
  }

  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (!networkInterface) continue;

    for (const iface of networkInterface) {
      // Skip internal (loopback) addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return "localhost";
}

