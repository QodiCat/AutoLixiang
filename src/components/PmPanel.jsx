import { useState } from "react";

function PmPanel({ task, onGeneratePrd, onRejectToBiz, busy, error }) {
  const [reason, setReason] = useState("");
  const canGeneratePrd = task.inputItems.length > 0;

  return (
    <div className="card stack">
      <h3>产品方案编排</h3>
      <div className="grid two">
        <div>
          <h4>需求方输入</h4>
          <p className="small">共 {task.inputItems.length} 条</p>
        </div>
        <div>
          <h4>优化需求</h4>
          <p className="small">{task.optimized ? "已生成" : "未生成"}</p>
        </div>
      </div>

      <button className="primary" onClick={onGeneratePrd} disabled={busy || !canGeneratePrd}>
        {busy ? "生成中..." : "根据需求方内容生成 PRD"}
      </button>
      {error && <p className="small">生成失败：{error}</p>}
      {!canGeneratePrd && <p className="small">请先让需求方至少提交 1 条输入材料</p>}

      <textarea
        placeholder="打回需求方原因（可选）"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={() => onRejectToBiz(reason)} disabled={!reason.trim()}>
        打回需求方补充
      </button>

      <div className="divider" />
      <h4>PRD 结果</h4>
      <pre>{task.prd || "暂无 PRD 结果。点击上方按钮生成后会显示在这里。"}</pre>

      <h4>原型草案结果</h4>
      <pre>{task.prototype || "暂无原型草案结果。"}</pre>
    </div>
  );
}

export default PmPanel;
