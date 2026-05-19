import fs from "node:fs";
import path from "node:path";

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const idx = s.indexOf("=");
    if (idx < 0) continue;
    const key = s.slice(0, idx).trim();
    const value = s.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function sampleTask() {
  return {
    title: "提升新用户注册后7日留存",
    status: "clarifying",
    inputItems: [
      { id: "1", type: "text", content: "新用户次日流失高，希望提高回访率。" },
      { id: "2", type: "meeting_note", content: "两周内上线试点，预算可控。" }
    ],
    rounds: [{ q: "成功指标是什么？", a: "7日留存提升3个百分点。" }],
    optimized: "",
    prd: "",
    prototype: "",
    tech: ""
  };
}

async function testProxy(kind) {
  const baseUrl = process.env.VITE_AI_API_BASE_URL || "http://localhost:8787";
  const resp = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, task: sampleTask() })
  });
  const text = await resp.text();
  if (!resp.ok) {
    console.error(`[proxy] HTTP ${resp.status}`);
    console.error(text);
    process.exit(1);
  }
  console.log("[proxy] ok");
  console.log(text.slice(0, 500));
}

async function testDirect() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("missing OPENAI_API_KEY");
    process.exit(1);
  }
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const url = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [{ role: "user", content: "请回复：AI直连测试通过" }]
    })
  });
  const text = await resp.text();
  if (!resp.ok) {
    console.error(`[direct] HTTP ${resp.status}`);
    console.error(text);
    process.exit(1);
  }
  console.log("[direct] ok");
  console.log(text.slice(0, 500));
}

async function main() {
  loadEnvFile();
  const mode = process.argv[2] || "proxy";
  const kind = process.argv[3] || "optimized";
  if (mode === "proxy") {
    await testProxy(kind);
    return;
  }
  if (mode === "direct") {
    await testDirect();
    return;
  }
  console.error("usage: node scripts/test-ai.mjs [proxy|direct] [kind]");
  process.exit(1);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
