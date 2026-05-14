import { STATUS_TEXT } from "../constants/task";

function AdminPanel({ task, onGenerateReport, onPrintReport }) {
  return (
    <div className="card stack">
      <h3>管理汇报</h3>
      <p className="small">整合需求、产品、技术输出，生成业务汇报页</p>
      <button className="primary" onClick={onGenerateReport}>
        生成 HTML 汇报摘要
      </button>
      {task.report && <p>{task.report}</p>}
      <div className="report-sheet">
        <h4>业务汇报页（预览）</h4>
        <p>
          <b>项目目标：</b>
          {task.title}
        </p>
        <p>
          <b>当前阶段：</b>
          {STATUS_TEXT[task.status]}
        </p>
        <p>
          <b>需求澄清：</b>
          {task.rounds.length} 轮
        </p>
        <p>
          <b>优化需求：</b>
          {task.optimized ? "已完成" : "未完成"}
        </p>
        <p>
          <b>产品方案：</b>
          {task.prd ? "已完成" : "未完成"}
        </p>
        <p>
          <b>技术方案：</b>
          {task.tech ? "已完成" : "未完成"}
        </p>
        <p>
          <b>管理结论：</b>
          {task.report || "待生成"}
        </p>
      </div>
      <button onClick={onPrintReport}>打印汇报页</button>
      <div className="divider"></div>
      <div className="row">
        <span className="role-chip">业务方</span>
        <span className="role-chip">产品同学</span>
        <span className="role-chip">技术同学</span>
        <span className="role-chip">管理员</span>
      </div>
    </div>
  );
}

export default AdminPanel;
