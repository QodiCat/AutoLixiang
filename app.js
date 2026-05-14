const askBtn = document.getElementById("askBtn");
const runBtn = document.getElementById("runBtn");
const questionBox = document.getElementById("interviewQuestions");
const answerBox = document.getElementById("interviewAnswers");
const summaryPanel = document.getElementById("summary");
const planPanel = document.getElementById("plan");
const jsonOut = document.getElementById("jsonOut");
const mdOut = document.getElementById("mdOut");
const reportFrame = document.getElementById("reportFrame");

const tabs = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll(".tab-panel");

let currentQuestions = [];

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    tabPanels.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

function getInput() {
  return {
    goal: document.getElementById("goal").value.trim(),
    pain: document.getElementById("pain").value.trim(),
    constraint: document.getElementById("constraint").value.trim()
  };
}

function buildQuestions(input) {
  return [
    `目标里最核心的业务指标是什么？（围绕：${input.goal || "未填写"}）`,
    `当前痛点在流程的哪个环节最严重？（围绕：${input.pain || "未填写"}）`,
    `约束下必须保留的系统边界是什么？（围绕：${input.constraint || "未填写"}）`,
    "如果只能先做一个MVP能力，你希望优先是什么？"
  ];
}

function renderQuestions(questions) {
  questionBox.innerHTML = "";
  answerBox.innerHTML = "";
  questions.forEach((q, i) => {
    const qEl = document.createElement("div");
    qEl.className = "question-item";
    qEl.textContent = `${i + 1}. ${q}`;
    questionBox.appendChild(qEl);

    const label = document.createElement("label");
    label.textContent = `回答 ${i + 1}`;
    const input = document.createElement("textarea");
    input.rows = 2;
    input.dataset.answerIdx = String(i);
    answerBox.appendChild(label);
    answerBox.appendChild(input);
  });
}

function collectAnswers() {
  const answers = [];
  answerBox.querySelectorAll("textarea").forEach((t, i) => {
    answers.push({ question: currentQuestions[i], answer: t.value.trim() || "（待补充）" });
  });
  return answers;
}

function buildResult(input, answers) {
  const modules = [
    "面谈追问Agent",
    "知识整合Agent",
    "方案推演Agent",
    "原型生成Agent",
    "执行拆解Agent"
  ];

  const plan = [
    { phase: "第1-2周", task: "需求澄清与知识对齐", output: "问题树+约束清单", risk: "输入缺失" },
    { phase: "第3-4周", task: "方案推演与原型生成", output: "可交互原型+验收标准", risk: "范围膨胀" },
    { phase: "第5-6周", task: "技术评审与开发", output: "MVP功能上线", risk: "接口改动" },
    { phase: "第7-8周", task: "验证与迭代", output: "评估报告+优化Backlog", risk: "指标不达标" }
  ];

  return {
    input,
    answers,
    feasibility: "可行。建议以MVP先验证“面谈追问+方案生成”闭环。",
    valueFindings: [
      "将产品经理时间从文档撰写迁移到价值判断",
      "减少业务与产品之间反复对齐成本",
      "形成可复用的需求-方案知识资产"
    ],
    modules,
    plan
  };
}

function renderSummary(result) {
  summaryPanel.innerHTML = `
    <div class="block"><strong>可行性判断：</strong>${result.feasibility}</div>
    <div class="block"><strong>价值发现：</strong><ul>${result.valueFindings.map((v) => `<li>${v}</li>`).join("")}</ul></div>
    <div class="block"><strong>功能模块：</strong><ul>${result.modules.map((m) => `<li>${m}</li>`).join("")}</ul></div>
  `;
}

function renderPlan(result) {
  planPanel.innerHTML = result.plan.map((p) => `
    <div class="block">
      <strong>${p.phase}</strong><br>
      任务：${p.task}<br>
      交付：${p.output}<br>
      风险：${p.risk}
    </div>
  `).join("");
}

function buildMarkdown(result) {
  return [
    "# Agent 协作输出",
    "## 输入",
    `- 目标：${result.input.goal || "未填写"}`,
    `- 痛点：${result.input.pain || "未填写"}`,
    `- 约束：${result.input.constraint || "未填写"}`,
    "## 面谈记录",
    ...result.answers.map((a, i) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}`),
    "## 方案摘要",
    `- 可行性：${result.feasibility}`,
    `- 价值发现：${result.valueFindings.join("；")}`,
    `- 模块：${result.modules.join("、")}`
  ].join("\n");
}

function buildReportHTML(result) {
  const rows = result.plan.map((p) => `<tr><td>${p.phase}</td><td>${p.task}</td><td>${p.output}</td></tr>`).join("");
  return `
  <!doctype html>
  <html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;padding:16px;color:#1f2937}
  h1{font-size:20px} .box{border:1px solid #d1d5db;border-radius:8px;padding:10px;margin:10px 0}
  table{width:100%;border-collapse:collapse} td,th{border:1px solid #d1d5db;padding:6px;text-align:left}
  </style></head><body>
  <h1>业务汇报页</h1>
  <div class="box"><b>业务目标：</b>${result.input.goal || "未填写"}</div>
  <div class="box"><b>可行性：</b>${result.feasibility}</div>
  <div class="box"><b>价值发现：</b><ul>${result.valueFindings.map((v) => `<li>${v}</li>`).join("")}</ul></div>
  <table><thead><tr><th>阶段</th><th>任务</th><th>交付</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;
}

askBtn.addEventListener("click", () => {
  const input = getInput();
  currentQuestions = buildQuestions(input);
  renderQuestions(currentQuestions);
});

runBtn.addEventListener("click", () => {
  const input = getInput();
  if (!currentQuestions.length) {
    currentQuestions = buildQuestions(input);
    renderQuestions(currentQuestions);
  }
  const result = buildResult(input, collectAnswers());
  renderSummary(result);
  renderPlan(result);
  jsonOut.value = JSON.stringify(result, null, 2);
  mdOut.value = buildMarkdown(result);
  reportFrame.srcdoc = buildReportHTML(result);
});
