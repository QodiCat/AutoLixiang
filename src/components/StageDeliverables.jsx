function StageDeliverables({ task }) {
  return (
    <div className="card stack">
      <h3>阶段成果总览（全角色可见）</h3>

      <div className="qa">
        <p>
          <b>优化需求</b>
        </p>
        <pre>{task.optimized || "暂无"}</pre>
      </div>

      <div className="qa">
        <p>
          <b>PRD 草案（重点）</b>
        </p>
        <pre>{task.prd || "暂无"}</pre>
      </div>

      <div className="qa">
        <p>
          <b>原型草案</b>
        </p>
        <pre>{task.prototype || "暂无"}</pre>
      </div>

      <div className="qa">
        <p>
          <b>技术方案</b>
        </p>
        <pre>{task.tech || "暂无"}</pre>
      </div>

      <div className="qa">
        <p>
          <b>管理汇报摘要</b>
        </p>
        <pre>{task.report || "暂无"}</pre>
      </div>
    </div>
  );
}

export default StageDeliverables;
