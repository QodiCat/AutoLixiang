function PmPanel({ task, onGeneratePrd, busy }) {
  return (
    <div className="card stack">
      <h3>产品方案编排</h3>
      <div className="grid two">
        <div>
          <h4>原始输入</h4>
          <p className="small">共 {task.inputItems.length} 条</p>
        </div>
        <div>
          <h4>优化需求</h4>
          <p className="small">{task.optimized ? "已生成" : "未生成"}</p>
        </div>
      </div>
      <button className="primary" onClick={onGeneratePrd} disabled={busy}>
        {busy ? "生成中..." : "生成 PRD 与原型草案"}
      </button>
      {task.prd && <p>{task.prd}</p>}
      {task.prototype && <p>{task.prototype}</p>}
    </div>
  );
}

export default PmPanel;
