import { ROLE, STATUS_TEXT } from "../constants/task";

function DashboardHeader({ role, task, notice, onSeedDemo, onResetTask, onSwitchRole }) {
  return (
    <div className="card header">
      <div>
        <h2>{ROLE[role]}工作台</h2>
        <p className="sub">
          任务：{task.id} · {task.title}
        </p>
      </div>
      <div className="row">
        {notice && <span className="role-chip">{notice}</span>}
        <span className="status">
          <span className={`dot ${task.status === "report_ready" ? "ok" : ""}`}></span>
          {STATUS_TEXT[task.status]}
        </span>
        <button className="ghost" onClick={onSeedDemo}>
          加载演示数据
        </button>
        <button className="ghost" onClick={onResetTask}>
          重置数据
        </button>
        <button className="ghost" onClick={onSwitchRole}>
          切换角色
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;
