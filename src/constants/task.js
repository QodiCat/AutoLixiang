export const ROLE = {
  biz: "业务方",
  pm: "产品同学",
  tech: "技术同学",
  admin: "管理员"
};

export const STATUS = ["draft", "clarifying", "optimized", "prd_ready", "tech_ready", "report_ready"];

export const STATUS_TEXT = {
  draft: "草稿创建",
  clarifying: "Agent 追问中",
  optimized: "需求已优化",
  prd_ready: "PRD/原型已生成",
  tech_ready: "技术方案已生成",
  report_ready: "汇报页已生成"
};

export const INITIAL_TASK = {
  id: "D-2026-001",
  title: "提升新用户注册后7日留存",
  status: "draft",
  rounds: [],
  optimized: "",
  prd: "",
  prototype: "",
  tech: "",
  report: "",
  inputItems: []
};

export const STORAGE_KEY = "ai-collab-demo-v1";
