import { spawn } from "child_process";

console.log("🌐 Initializing localtunnel on port 3000...");

// Spawn localtunnel process
const tunnel = spawn("npx", ["localtunnel", "--port", "3000"], {
  shell: true,
});

tunnel.stdout.on("data", (data) => {
  const output = data.toString().trim();
  if (output.includes("your url is:")) {
    const url = output.replace("your url is:", "").trim();
    console.log(`
┌──────────────────────────────────────────────────────────────┐
│                    LOCALTUNNEL IS RUNNING                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Local Server : http://localhost:3000                        │
│  Public Tunnel: ${url}                             │
│                                                              │
│  👉 Copy & update your Clerk Dashboard Webhook URL to:       │
│     ${url}/api/webhooks/clerk                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
`);
  } else {
    console.log(`[localtunnel] ${output}`);
  }
});

tunnel.stderr.on("data", (data) => {
  console.error(`[localtunnel-error] ${data.toString()}`);
});

tunnel.on("close", (code) => {
  console.log(`[localtunnel] Tunnel process exited with code ${code}`);
});
