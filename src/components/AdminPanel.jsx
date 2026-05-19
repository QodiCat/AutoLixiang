import { STATUS_TEXT } from "../constants/task";

function AdminPanel({ task, onGenerateReport, onPrintReport, onApprove, onReject, busy }) {
  const approvals = {
    optimized: "pending",
    prd: "pending",
    tech: "pending",
    report: "pending",
    ...(task.approvals || {})
  };

  return (
    <div className="card stack">
      <h3>管理者审批台</h3>
      <p className="small">可查看全角色互动，并对各阶段进行审批或打回</p>

      <button className="primary" onClick={onGenerateReport} disabled={busy || !task.tech}>
        {busy ? "生成中..." : "生成管理汇报摘要"}
      </button>
      {task.report && <pre>{task.report}</pre>}

      <div className="grid two">
        <div className="qa">
          <p>
            <b>优化需求</b>（{approvals.optimized}）
          </p>
          <div className="row">
            <button onClick={() => onApprove("optimized")} disabled={!task.optimized}>
              审批通过
            </button>
            <button onClick={() => onReject("optimized")} disabled={!task.optimized}>
              打回
            </button>
          </div>
        </div>

        <div className="qa">
          <p>
            <b>PRD</b>（{approvals.prd}）
          </p>
          <div className="row">
            <button onClick={() => onApprove("prd")} disabled={!task.prd}>
              审批通过
            </button>
            <button onClick={() => onReject("prd")} disabled={!task.prd}>
              打回
            </button>
          </div>
        </div>

        <div className="qa">
          <p>
            <b>技术方案</b>（{approvals.tech}）
          </p>
          <div className="row">
            <button onClick={() => onApprove("tech")} disabled={!task.tech}>
              审批通过
            </button>
            <button onClick={() => onReject("tech")} disabled={!task.tech}>
              打回
            </button>
          </div>
        </div>

        <div className="qa">
          <p>
            <b>汇报摘要</b>（{approvals.report}）
          </p>
          <div className="row">
            <button onClick={() => onApprove("report")} disabled={!task.report}>
              审批通过
            </button>
            <button onClick={() => onReject("report")} disabled={!task.report}>
              打回
            </button>
          </div>
        </div>
      </div>

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
      </div>

      <div className="divider"></div>
      <h4>全链路提交明细</h4>
      <div className="qa">
        <p>
          <b>需求方输入（{task.inputItems.length} 条）</b>
        </p>
        {task.inputItems.length === 0 && <p className="small">暂无</p>}
        {task.inputItems.map((item, idx) => (
          <pre key={item.id || idx}>{`[${item.type}] ${item.content}`}</pre>
        ))}
      </div>
      <div className="qa">
        <p>
          <b>需求澄清记录（{task.rounds.length} 轮）</b>
        </p>
        {task.rounds.length === 0 && <p className="small">暂无</p>}
        {task.rounds.map((item, idx) => (
          <pre key={`${item.q}-${idx}`}>{`Q: ${item.q}\nA: ${item.a}`}</pre>
        ))}
      </div>
      <div className="qa">
        <p>
          <b>优化需求全文</b>
        </p>
        <pre>{task.optimized || "暂无"}</pre>
      </div>
      <div className="qa">
        <p>
          <b>PRD 全文</b>
        </p>
        <pre>{task.prd || "暂无"}</pre>
      </div>
      <div className="qa">
        <p>
          <b>原型草案全文</b>
        </p>
        <pre>{task.prototype || "暂无"}</pre>
      </div>
      <div className="qa">
        <p>
          <b>技术方案全文</b>
        </p>
        <pre>{task.tech || "暂无"}</pre>
      </div>
      <div className="qa">
        <p>
          <b>管理摘要全文</b>
        </p>
        <pre>{task.report || "暂无"}</pre>
      </div>

      <button onClick={onPrintReport}>打印汇报页</button>
    </div>
  );
}

export default AdminPanel;
