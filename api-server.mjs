import http from "node:http";

const PORT = Number(process.env.AI_API_PORT || 8787);
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions";

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(payload));
}

function buildPrompt(task, kind) {
  const context = {
    title: task.title,
    status: task.status,
    inputItems: task.inputItems || [],
    rounds: task.rounds || [],
    optimized: task.optimized || "",
    prd: task.prd || "",
    prototype: task.prototype || "",
    tech: task.tech || ""
  };

  if (kind === "optimized") {
    return `你是资深业务分析师。请基于以下 JSON 输出“优化后的业务需求”，必须包含：目标、背景、约束、新增价值点、验收指标。\n\n${JSON.stringify(context, null, 2)}`;
  }
  if (kind === "prd") {
    return `你是产品经理。请基于以下 JSON 输出两段内容，分别以“PRD草案：”和“原型草案：”开头。\n\n${JSON.stringify(context, null, 2)}`;
  }
  if (kind === "tech") {
    return `你是技术负责人。请基于以下 JSON 输出“技术方案草案”，包含架构要点、数据埋点、风险与灰度策略。\n\n${JSON.stringify(context, null, 2)}`;
  }
  if (kind === "report") {
    return `你是管理汇报顾问。请基于以下 JSON 输出“汇报摘要”，面向业务管理层，要求简洁、可决策。\n\n${JSON.stringify(context, null, 2)}`;
  }
  throw new Error(`未知 kind: ${kind}`);
}

async function callModel(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error("缺少 OPENAI_API_KEY 环境变量");
  }

  const resp = await fetch(OPENAI_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: "你输出结构化、可执行、中文简体内容。" },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(err || "模型调用失败");
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("模型返回为空");
  }
  return text;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/generate") {
    sendJson(res, 404, { error: "Not Found" });
    return;
  }

  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
  });

  req.on("end", async () => {
    try {
      const body = JSON.parse(raw || "{}");
      const prompt = buildPrompt(body.task || {}, body.kind);
      const text = await callModel(prompt);
      sendJson(res, 200, { text });
    } catch (error) {
      sendJson(res, 500, { error: error.message || "Internal Error" });
    }
  });
});

server.listen(PORT, () => {
  console.log(`AI proxy running: http://localhost:${PORT}`);
});
