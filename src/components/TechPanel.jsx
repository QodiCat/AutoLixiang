import { useState } from "react";

function TechPanel({ task, onGenerateTech, onRejectToPm, busy }) {
  const [reason, setReason] = useState("");

  return (
    <div className="card stack">
      <h3>技术可行性终审</h3>
      <p className="small">前置条件：产品 PRD 已生成</p>
      <button className="primary" onClick={onGenerateTech} disabled={busy || !task.prd}>
        {busy ? "生成中..." : "根据前序提交生成技术方案"}
      </button>
      <textarea placeholder="打回产品原因（可选）" value={reason} onChange={(e) => setReason(e.target.value)} />
      <button onClick={() => onRejectToPm(reason)} disabled={!reason.trim()}>
        打回产品修订
      </button>
      {task.tech && <pre>{task.tech}</pre>}
    </div>
  );
}

export default TechPanel;
