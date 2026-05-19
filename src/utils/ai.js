const API_BASE = (import.meta.env.VITE_AI_API_BASE_URL || "").trim();

function buildUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

export async function generateWithAI({ task, kind }) {
  const response = await fetch(buildUrl("/api/generate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, kind })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "AI 请求失败");
  }

  const data = await response.json();
  if (data?.error) {
    throw new Error(data.error);
  }
  const text = (data?.text || "").trim();
  if (!text) {
    throw new Error("模型返回为空，请检查模型配置或提示词");
  }
  return text;
}
