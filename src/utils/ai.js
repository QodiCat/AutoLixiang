const API_BASE = import.meta.env.VITE_AI_API_BASE_URL || "http://localhost:8787";

export async function generateWithAI({ task, kind }) {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, kind })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "AI 请求失败");
  }

  const data = await response.json();
  return data.text || "";
}
