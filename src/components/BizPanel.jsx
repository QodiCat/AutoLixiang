function BizPanel({
  task,
  titleInput,
  contentInput,
  inputType,
  setTitleInput,
  setContentInput,
  setInputType,
  onStartDemand,
  onAddInput,
  onAskRound,
  onGenerateOptimized
}) {
  return (
    <div className="card stack">
      <h3>需求输入与澄清</h3>
      <input placeholder="需求标题" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} />
      <button onClick={onStartDemand}>更新任务标题</button>
      <div className="row">
        <select value={inputType} onChange={(e) => setInputType(e.target.value)}>
          <option value="text">文本</option>
          <option value="meeting_note">会议纪要</option>
          <option value="doc">文档内容</option>
        </select>
      </div>
      <textarea
        value={contentInput}
        onChange={(e) => setContentInput(e.target.value)}
        placeholder="输入业务目标、用户原声、约束条件..."
      />
      <div className="row">
        <button className="primary" onClick={onAddInput}>
          提交输入材料
        </button>
        <button onClick={onAskRound}>模拟 Agent 追问</button>
        <button onClick={onGenerateOptimized}>生成优化需求</button>
      </div>
      <div className="divider"></div>
      <p className="small">输入材料 {task.inputItems.length} 条</p>
      <p className="small">追问记录 {task.rounds.length} 轮</p>
      {task.rounds.map((item, i) => (
        <div key={`${item.q}-${i}`} className="qa">
          <p>
            <b>Q{i + 1}：</b>
            {item.q}
          </p>
          <p className="small">
            <b>A：</b>
            {item.a}
          </p>
        </div>
      ))}
      {task.optimized && <pre>{task.optimized}</pre>}
    </div>
  );
}

export default BizPanel;
