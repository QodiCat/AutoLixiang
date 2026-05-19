function TechPanel({ task, onGenerateTech, busy }) {
  return (
    <div className="card stack">
      <h3>技术可行性终审</h3>
      <p className="small">前置条件：PRD/原型已生成</p>
      <button className="primary" onClick={onGenerateTech} disabled={busy}>
        {busy ? "生成中..." : "生成技术方案草案"}
      </button>
      {task.tech && <p>{task.tech}</p>}
    </div>
  );
}

export default TechPanel;
