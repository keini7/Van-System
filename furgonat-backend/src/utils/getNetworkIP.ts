// Utility për të marrë IP address të kompjuterit
import os from "os";

export function getNetworkIP(): string {
  const interfaces = os.networkInterfaces();
  
  if (!interfaces) {
    return "localhost";
  }

  // Lista e IP-ve të gjetura (prioritet sipas renditjes)
  const foundIPs: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (!networkInterface) continue;

    for (const iface of networkInterface) {
      // Skip internal (loopback) addresses
      if (iface.family === "IPv4" && !iface.internal) {
        foundIPs.push(iface.address);
      }
    }
  }
  
  // Kthejmë IP-në e parë që gjejmë (zakonisht është ajo kryesore)
  // Ose mund të kthejmë të gjitha IP-të për frontend
  return foundIPs.length > 0 ? foundIPs[0] : "localhost";
}

// Funksion për të marrë të gjitha IP-të e network-it
export function getAllNetworkIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  
  if (!interfaces) {
    return ["localhost"];
  }

  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (!networkInterface) continue;

    for (const iface of networkInterface) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  
  return ips.length > 0 ? ips : ["localhost"];
}

