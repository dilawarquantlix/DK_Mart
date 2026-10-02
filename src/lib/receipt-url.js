import os from "node:os";

function scoreAddress(address) {
  if (address.startsWith("192.168.")) return 0;
  if (address.startsWith("10.")) return 1;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(address)) return 2;
  if (address.startsWith("169.254.")) return 9;
  return 5;
}

export function getLanAddresses() {
  const addresses = [];
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name] ?? []) {
      if (info.family === "IPv4" && !info.internal) {
        addresses.push(info.address);
      }
    }
  }

  return addresses;
}

export function getLanAddress() {
  const addresses = getLanAddresses();
  if (addresses.length === 0) return null;
  return [...addresses].sort((a, b) => scoreAddress(a) - scoreAddress(b))[0];
}

function splitHost(host) {
  const bracketed = host.match(/^\[(.+)\](?::(\d+))?$/);
  if (bracketed) return { hostname: bracketed[1], port: bracketed[2] ?? "" };

  const index = host.lastIndexOf(":");
  if (index > -1 && host.indexOf(":") === index) {
    return { hostname: host.slice(0, index), port: host.slice(index + 1) };
  }

  return { hostname: host, port: "" };
}

function isLocalHostname(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1"
  );
}

export function buildReceiptBaseUrl({ configured, host, protocol } = {}) {
  if (configured) return String(configured).replace(/\/+$/, "");

  if (!host) return "";

  const scheme = protocol || "http";
  const { hostname, port } = splitHost(String(host));
  const suffix = port ? `:${port}` : "";

  if (isLocalHostname(hostname)) {
    const lan = getLanAddress();
    if (lan) return `${scheme}://${lan}${suffix}`;
  }

  return `${scheme}://${host}`;
}
