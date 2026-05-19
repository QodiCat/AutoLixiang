import { useEffect, useMemo, useState } from "react";
import AdminPanel from "./components/AdminPanel";
import BizPanel from "./components/BizPanel";
import DashboardHeader from "./components/DashboardHeader";
import KpiGrid from "./components/KpiGrid";
import PmPanel from "./components/PmPanel";
import RoleGate from "./components/RoleGate";
import TechPanel from "./components/TechPanel";
import { AUTH_SESSION_KEY, AUTH_USERS_KEY, INITIAL_TASK, STORAGE_KEY } from "./constants/task";
import { nextStatus } from "./utils/task";
import { generateWithAI } from "./utils/ai";

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
      return raw ? JSON.parse(raw) : INITIAL_TASK;
    } catch {
      return INITIAL_TASK;
    }
  });
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [inputType, setInputType] = useState("text");
  const [notice, setNotice] = useState("");
  const [busyKind, setBusyKind] = useState("");

  const kpis = useMemo(() => {
    const rounds = task.rounds.length;
    const hasValuePoint = task.optimized.includes("新增价值点");
    const landed = task.prd && task.tech;
    return {
      rounds,
      value: hasValuePoint ? "是" : "否",
      landed: landed ? "是" : "否"
    };
  }, [task]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(task));
  }, [task]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      return;
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
  }, [session]);

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2000);
  }

  function addInput() {
    if (!contentInput.trim()) return;
    setTask((prev) => ({
      ...prev,
      inputItems: [
        ...prev.inputItems,
        { id: crypto.randomUUID(), type: inputType, content: contentInput.trim() }
      ],
      status: nextStatus(prev.status, "clarifying")
    }));
    setContentInput("");
    flash("已保存输入材料");
  }

  function startDemand() {
    if (!titleInput.trim()) return;
    setTask((prev) => ({ ...prev, title: titleInput.trim() }));
    setTitleInput("");
    flash("任务标题已更新");
  }

  function askRound() {
    const presets = [
      "你希望优先改善哪个用户细分？",
      "业务方成功标准的量化口径是什么？",
      "有哪些硬约束（预算、时间、合规）？",
      "是否存在需要兼容的既有流程？"
    ];
    const q = presets[task.rounds.length % presets.length];
    setTask((prev) => ({
      ...prev,
      status: nextStatus(prev.status, "clarifying"),
      rounds: [...prev.rounds, { q, a: "已记录：由业务方在评审会上确认。" }]
    }));
    flash("已新增1轮追问");
  }

  async function runAIGeneration(kind) {
    setBusyKind(kind);
    try {
      const text = await generateWithAI({ task, kind });
      setTask((prev) => {
        if (kind === "optimized") {
          return { ...prev, status: nextStatus(prev.status, "optimized"), optimized: text };
        }
        if (kind === "prd") {
          const [prdPart, prototypePart] = splitPrdAndPrototype(text);
          return {
            ...prev,
            status: nextStatus(prev.status, "prd_ready"),
            prd: prdPart || text,
            prototype: prototypePart
          };
        }
        if (kind === "tech") {
          return { ...prev, status: nextStatus(prev.status, "tech_ready"), tech: text };
        }
        if (kind === "report") {
          return { ...prev, status: nextStatus(prev.status, "report_ready"), report: text };
        }
        return prev;
      });
      flash("AI 生成完成");
    } catch (error) {
      flash(`AI 调用失败：${error.message}`);
    } finally {
      setBusyKind("");
    }
  }

  function splitPrdAndPrototype(text) {
    const marker = "原型草案：";
    const idx = text.indexOf(marker);
    if (idx < 0) {
      return [text, ""];
    }
    return [text.slice(0, idx).trim(), text.slice(idx).trim()];
  }

  function resetTask() {
    setTask(INITIAL_TASK);
    localStorage.removeItem(STORAGE_KEY);
    flash("演示数据已重置");
  }

  function seedDemo() {
    setTask({
      ...INITIAL_TASK,
      status: "optimized",
      inputItems: [
        { id: crypto.randomUUID(), type: "meeting_note", content: "会上确认：核心目标是7日留存，预算可控。" },
        { id: crypto.randomUUID(), type: "text", content: "用户反映注册后无明确引导，次日回访动力不足。" }
      ],
      rounds: [
        { q: "你希望优先改善哪个用户细分？", a: "优先新注册且近30天首登用户。" },
        { q: "成功指标口径？", a: "7日留存提升3个百分点。" },
        { q: "有什么硬约束？", a: "2周内上线试点，不影响主流程转化。" }
      ],
      optimized:
        "目标：提升新用户注册后7日留存\n背景：新用户次日流失明显，缺少有效回访机制\n约束：两周上线试点，预算与合规受控\n新增价值点：引入行为激励和分层触达策略，提升回访率"
    });
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
    if (users.some((item) => item.username === username)) {
      return { ok: false, message: "账号已存在，请直接登录" };
    }
    const created = { username, password, role };
    saveUsers([...users, created]);
    setSession({ username, role });
    return { ok: true, message: `注册成功，已登录为${username}` };
  }

  function handleLogin({ username, password }) {
    const users = getUsers();
    const matched = users.find((item) => item.username === username && item.password === password);
    if (!matched) {
      return { ok: false, message: "账号或密码错误" };
    }
    setSession({ username: matched.username, role: matched.role });
    return { ok: true, message: `登录成功，身份：${matched.role}` };
  }

  function logout() {
    setSession(null);
    flash("已退出登录");
  }

  if (!session) {
    return <RoleGate onRegister={handleRegister} onLogin={handleLogin} />;
  }

  return (
    <div className="app stack">
      <DashboardHeader
        role={session.role}
        username={session.username}
        task={task}
        notice={notice}
        onSeedDemo={seedDemo}
        onResetTask={resetTask}
        onLogout={logout}
      />

      <KpiGrid kpis={kpis} />

      {session.role === "biz" && (
        <BizPanel
          task={task}
          titleInput={titleInput}
          contentInput={contentInput}
          inputType={inputType}
          setTitleInput={setTitleInput}
          setContentInput={setContentInput}
          setInputType={setInputType}
          onStartDemand={startDemand}
          onAddInput={addInput}
          onAskRound={askRound}
          onGenerateOptimized={() => runAIGeneration("optimized")}
          busy={busyKind === "optimized"}
        />
      )}

      {session.role === "pm" && (
        <PmPanel task={task} onGeneratePrd={() => runAIGeneration("prd")} busy={busyKind === "prd"} />
      )}
      {session.role === "tech" && (
        <TechPanel task={task} onGenerateTech={() => runAIGeneration("tech")} busy={busyKind === "tech"} />
      )}
      {session.role === "admin" && (
        <AdminPanel
          task={task}
          onGenerateReport={() => runAIGeneration("report")}
          onPrintReport={printReport}
          busy={busyKind === "report"}
        />
      )}
    </div>
  );
}

export default App;
