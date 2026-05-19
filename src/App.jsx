import { useEffect, useMemo, useState } from "react";
import AdminPanel from "./components/AdminPanel";
import BizPanel from "./components/BizPanel";
import DashboardHeader from "./components/DashboardHeader";
import InteractionFeed from "./components/InteractionFeed";
import KpiGrid from "./components/KpiGrid";
import PmPanel from "./components/PmPanel";
import RoleGate from "./components/RoleGate";
import StageDeliverables from "./components/StageDeliverables";
import TechPanel from "./components/TechPanel";
import { AUTH_SESSION_KEY, AUTH_USERS_KEY, INITIAL_TASK, STORAGE_KEY } from "./constants/task";
import { nextStatus } from "./utils/task";
import { generateWithAI } from "./utils/ai";

function normalizeTask(raw) {
  const base = { ...INITIAL_TASK, ...(raw || {}) };
  return {
    ...base,
    rounds: Array.isArray(base.rounds) ? base.rounds : [],
    inputItems: Array.isArray(base.inputItems) ? base.inputItems : [],
    interactions: Array.isArray(base.interactions) ? base.interactions : [],
    approvals: { ...INITIAL_TASK.approvals, ...(base.approvals || {}) }
  };
}

function App() {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [task, setTask] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeTask(JSON.parse(raw)) : normalizeTask(INITIAL_TASK);
    } catch {
      return normalizeTask(INITIAL_TASK);
    }
  });
  const [notice, setNotice] = useState("");
  const [busyKind, setBusyKind] = useState("");
  const [lastError, setLastError] = useState("");

  const kpis = useMemo(() => {
    const rounds = task.rounds.length;
    const hasValuePoint = task.optimized.includes("新增价值点");
    const landed = Boolean(task.prd && task.tech);
    return { rounds, value: hasValuePoint ? "是" : "否", landed: landed ? "是" : "否" };
  }, [task]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(task));
  }, [task]);

  useEffect(() => {
    if (session) localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(AUTH_SESSION_KEY);
  }, [session]);

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2000);
  }

  function nowText() {
    return new Date().toLocaleString("zh-CN", { hour12: false });
  }

  function addInteraction(prev, role, action, message) {
    return {
      ...prev,
      interactions: [
        ...(prev.interactions || []),
        { id: crypto.randomUUID(), role, action, message, time: nowText() }
      ]
    };
  }

  function addInput(formPayload) {
    if (!formPayload || !formPayload.demandTitle?.trim() || !formPayload.demandDetail?.trim()) return;
    const summary = [
      `需求标题：${formPayload.demandTitle}`,
      `需求详情：${formPayload.demandDetail}`,
      `提出人：${formPayload.proposer || "-"}`,
      `提出日期：${formPayload.proposeDate || "-"}`,
      `期望上线：${formPayload.expectedLaunchDate || "-"}`,
      `需求模块：${formPayload.demandModule || "-"}`,
      `需求分类：${formPayload.demandCategory || "-"}`,
      `合理性评估：${formPayload.rationalityAssessment || "-"}`,
      `问题类型：${formPayload.problemType || "-"}`,
      `影响范围：${formPayload.impactScope || "-"}`,
      `预计收益：${formPayload.expectedBenefit || "-"}`,
      `需求Owner：${formPayload.demandOwner || "-"}`,
      `产品负责人：${formPayload.productOwner || "-"}`,
      `预估人天：${formPayload.estimatedManDays || "-"}`,
      `需求年度：${formPayload.demandYear || "-"}`,
      `业务优先级：${formPayload.businessPriority || "-"}`,
      `需求进展：${formPayload.demandProgress || "-"}`
    ].join("\n");

    setTask((prev) => {
      const updated = {
        ...prev,
        title: formPayload.demandTitle.trim(),
        inputItems: [...prev.inputItems, { id: crypto.randomUUID(), type: "demand_form", content: summary }],
        status: nextStatus(prev.status, "clarifying")
      };
      return addInteraction(updated, "biz", "提交需求表单", formPayload.demandTitle.trim());
    });
    flash("需求表单已提交");
  }

  function askRound() {
    const presets = [
      "你希望优先改善哪个用户细分？",
      "业务方成功标准的量化口径是什么？",
      "有哪些硬约束（预算、时间、合规）？",
      "是否存在需要兼容的既有流程？"
    ];
    const q = presets[task.rounds.length % presets.length];
    setTask((prev) => {
      const updated = {
        ...prev,
        status: nextStatus(prev.status, "clarifying"),
        rounds: [...prev.rounds, { q, a: "已记录：由业务方在评审会上确认。" }]
      };
      return addInteraction(updated, "biz", "澄清追问", q);
    });
    flash("已新增 1 轮追问");
  }

  async function runAIGeneration(kind) {
    if (kind === "prd" && task.inputItems.length === 0) return flash("请先提交需求方输入材料");
    if (kind === "tech" && !task.prd) return flash("请先生成 PRD");
    if (kind === "report" && !task.tech) return flash("请先生成技术方案");

    setBusyKind(kind);
    setLastError("");
    try {
      const text = await generateWithAI({ task, kind });
      setTask((prev) => {
        if (kind === "optimized") {
          const updated = {
            ...prev,
            status: nextStatus(prev.status, "optimized"),
            optimized: text,
            approvals: { ...prev.approvals, optimized: "pending" }
          };
          return addInteraction(updated, "biz", "AI生成优化需求", "已基于需求方输入生成");
        }
        if (kind === "prd") {
          const [prdPart, prototypePart] = splitPrdAndPrototype(text);
          const updated = {
            ...prev,
            status: nextStatus(prev.status, "prd_ready"),
            prd: prdPart || text,
            prototype: prototypePart,
            approvals: { ...prev.approvals, prd: "pending" }
          };
          return addInteraction(updated, "pm", "AI生成PRD", "已基于需求方输入与历史内容生成");
        }
        if (kind === "tech") {
          const updated = {
            ...prev,
            status: nextStatus(prev.status, "tech_ready"),
            tech: text,
            approvals: { ...prev.approvals, tech: "pending" }
          };
          return addInteraction(updated, "tech", "AI生成技术方案", "已基于业务+产品内容生成");
        }
        if (kind === "report") {
          const updated = {
            ...prev,
            status: nextStatus(prev.status, "report_ready"),
            report: text,
            approvals: { ...prev.approvals, report: "pending" }
          };
          return addInteraction(updated, "admin", "AI生成管理摘要", "已基于全链路内容生成");
        }
        return prev;
      });
      flash("AI 生成完成");
    } catch (error) {
      const msg = error?.message || "未知错误";
      setLastError(msg);
      flash(`AI 调用失败：${msg}`);
    } finally {
      setBusyKind("");
    }
  }

  function splitPrdAndPrototype(text) {
    const markers = ["原型草案：", "原型：", "Prototype:"];
    let idx = -1;
    for (const marker of markers) {
      idx = text.indexOf(marker);
      if (idx >= 0) break;
    }
    if (idx < 0) return [text.trim(), ""];
    return [text.slice(0, idx).trim(), text.slice(idx).trim()];
  }

  function rejectToBiz(reason) {
    if (!reason.trim()) return;
    setTask((prev) => addInteraction({ ...prev, status: "clarifying" }, "pm", "打回需求方", reason.trim()));
    flash("已打回需求方");
  }

  function rejectToPm(reason) {
    if (!reason.trim()) return;
    setTask((prev) => addInteraction({ ...prev, status: "prd_ready" }, "tech", "打回产品", reason.trim()));
    flash("已打回产品");
  }

  function approveStage(stage) {
    setTask((prev) =>
      addInteraction({ ...prev, approvals: { ...prev.approvals, [stage]: "approved" } }, "admin", "审批通过", `阶段：${stage}`)
    );
    flash(`${stage} 已审批通过`);
  }

  function rejectStage(stage) {
    setTask((prev) =>
      addInteraction({ ...prev, approvals: { ...prev.approvals, [stage]: "rejected" } }, "admin", "审批打回", `阶段：${stage}`)
    );
    flash(`${stage} 已打回`);
  }

  function resetTask() {
    setTask(normalizeTask(INITIAL_TASK));
    localStorage.removeItem(STORAGE_KEY);
    flash("演示数据已重置");
  }

  function seedDemo() {
    setTask(
      normalizeTask({
        ...INITIAL_TASK,
        status: "optimized",
        inputItems: [
          { id: crypto.randomUUID(), type: "meeting_note", content: "核心目标是 7 日留存，预算可控。" },
          { id: crypto.randomUUID(), type: "text", content: "新用户注册后缺少引导，次日回访动力不足。" }
        ],
        rounds: [{ q: "优先改善哪个用户细分？", a: "优先新注册且近 30 天首登用户。" }],
        optimized: "目标：提升新用户注册后7日留存\n背景：新用户次日流失明显\n约束：两周内试点上线\n新增价值点：行为激励+分层触达",
        interactions: [
          {
            id: crypto.randomUUID(),
            role: "biz",
            action: "提交材料",
            message: "用户流失背景与目标已提交",
            time: nowText()
          }
        ]
      })
    );
    flash("已加载演示数据");
  }

  function printReport() {
    window.print();
  }

  function getUsers() {
    try {
      const raw = localStorage.getItem(AUTH_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  }

  function handleRegister({ username, password, role }) {
    const users = getUsers();
    if (users.some((item) => item.username === username)) return { ok: false, message: "账号已存在，请直接登录" };
    saveUsers([...users, { username, password, role }]);
    setSession({ username, role });
    return { ok: true, message: `注册成功，已登录为${username}` };
  }

  function handleLogin({ username, password }) {
    const users = getUsers();
    const matched = users.find((item) => item.username === username && item.password === password);
    if (!matched) return { ok: false, message: "账号或密码错误" };
    setSession({ username: matched.username, role: matched.role });
    return { ok: true, message: `登录成功，身份：${matched.role}` };
  }

  function logout() {
    setSession(null);
    flash("已退出登录");
  }

  if (!session) return <RoleGate onRegister={handleRegister} onLogin={handleLogin} />;

  return (
    <div className="app stack">
      <DashboardHeader role={session.role} username={session.username} task={task} notice={notice} onSeedDemo={seedDemo} onResetTask={resetTask} onLogout={logout} />
      <KpiGrid kpis={kpis} />

      {session.role === "biz" && <BizPanel task={task} onAddInput={addInput} onAskRound={askRound} onGenerateOptimized={() => runAIGeneration("optimized")} busy={busyKind === "optimized"} />}
      {session.role === "pm" && <PmPanel task={task} onGeneratePrd={() => runAIGeneration("prd")} onRejectToBiz={rejectToBiz} busy={busyKind === "prd"} error={lastError} />}
      {session.role === "tech" && <TechPanel task={task} onGenerateTech={() => runAIGeneration("tech")} onRejectToPm={rejectToPm} busy={busyKind === "tech"} />}
      {session.role === "admin" && <AdminPanel task={task} onGenerateReport={() => runAIGeneration("report")} onPrintReport={printReport} onApprove={approveStage} onReject={rejectStage} busy={busyKind === "report"} />}

      <StageDeliverables task={task} />
      <InteractionFeed items={task.interactions || []} />
    </div>
  );
}

export default App;
