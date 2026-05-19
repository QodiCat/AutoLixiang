import { useState } from "react";

const INITIAL_FORM = {
  demandTitle: "",
  demandDetail: "",
  proposer: "",
  proposeDate: "",
  expectedLaunchDate: "",
  demandModule: "薪酬",
  demandCategory: "日常迭代",
  rationalityAssessment: "继续推进",
  problemType: "阻断业务",
  impactScope: "公司",
  expectedBenefit: "",
  demandOwner: "",
  productOwner: "",
  estimatedManDays: "",
  demandYear: "",
  businessPriority: "P0",
  demandProgress: "产品阶段"
};

function BizPanel({ task, onAddInput, onAskRound, onGenerateOptimized, busy }) {
  const [form, setForm] = useState(INITIAL_FORM);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submitForm() {
    if (!form.demandTitle.trim() || !form.demandDetail.trim() || !form.proposer.trim()) return;
    onAddInput(form);
  }

  return (
    <div className="card stack">
      <h3>需求输入与澄清（结构化填写）</h3>
      <div className="grid two">
        <input
          placeholder="需求标题 *"
          value={form.demandTitle}
          onChange={(e) => updateField("demandTitle", e.target.value)}
        />
        <input placeholder="需求提出人 *" value={form.proposer} onChange={(e) => updateField("proposer", e.target.value)} />
      </div>

      <textarea
        placeholder="需求详情（可附文档要点）*"
        value={form.demandDetail}
        onChange={(e) => updateField("demandDetail", e.target.value)}
      />

      <div className="grid three">
        <input type="date" value={form.proposeDate} onChange={(e) => updateField("proposeDate", e.target.value)} />
        <input
          type="date"
          value={form.expectedLaunchDate}
          onChange={(e) => updateField("expectedLaunchDate", e.target.value)}
        />
        <input placeholder="需求年度（如 2026）" value={form.demandYear} onChange={(e) => updateField("demandYear", e.target.value)} />
      </div>

      <div className="grid three">
        <select value={form.demandModule} onChange={(e) => updateField("demandModule", e.target.value)}>
          <option value="薪酬">薪酬</option>
          <option value="组织架构">组织架构</option>
          <option value="考勤">考勤</option>
          <option value="招聘">招聘</option>
          <option value="绩效">绩效</option>
          <option value="员工服务">员工服务</option>
        </select>
        <select value={form.demandCategory} onChange={(e) => updateField("demandCategory", e.target.value)}>
          <option value="日常迭代">日常迭代</option>
          <option value="大版本项目">大版本项目</option>
          <option value="线上Bug">线上 Bug</option>
          <option value="技术优化">技术优化</option>
          <option value="合规性调整">合规性调整</option>
        </select>
        <select value={form.rationalityAssessment} onChange={(e) => updateField("rationalityAssessment", e.target.value)}>
          <option value="继续推进">继续推进</option>
          <option value="暂缓执行">暂缓执行</option>
          <option value="驳回">驳回</option>
          <option value="需进一步讨论">需进一步讨论</option>
        </select>
      </div>

      <div className="grid three">
        <select value={form.problemType} onChange={(e) => updateField("problemType", e.target.value)}>
          <option value="阻断业务">阻断业务</option>
          <option value="体验优化">体验优化</option>
          <option value="效率提升">效率提升</option>
          <option value="合规风险">合规风险</option>
          <option value="数据统计">数据统计</option>
        </select>
        <select value={form.impactScope} onChange={(e) => updateField("impactScope", e.target.value)}>
          <option value="公司">公司</option>
          <option value="特定部门">特定部门</option>
          <option value="特定岗位">特定岗位</option>
          <option value="仅管理员">仅管理员</option>
          <option value="全员">全员</option>
        </select>
        <select value={form.businessPriority} onChange={(e) => updateField("businessPriority", e.target.value)}>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
      </div>

      <div className="grid three">
        <input placeholder="需求 Owner" value={form.demandOwner} onChange={(e) => updateField("demandOwner", e.target.value)} />
        <input
          placeholder="产品负责人"
          value={form.productOwner}
          onChange={(e) => updateField("productOwner", e.target.value)}
        />
        <input
          placeholder="需求预估人天"
          value={form.estimatedManDays}
          onChange={(e) => updateField("estimatedManDays", e.target.value)}
        />
      </div>

      <textarea
        placeholder="预计收益（业务价值或成本节省）"
        value={form.expectedBenefit}
        onChange={(e) => updateField("expectedBenefit", e.target.value)}
      />

      <select value={form.demandProgress} onChange={(e) => updateField("demandProgress", e.target.value)}>
        <option value="需求收集">需求收集</option>
        <option value="产品阶段">产品阶段</option>
        <option value="技术评审">技术评审</option>
        <option value="开发中">开发中</option>
        <option value="测试中">测试中</option>
        <option value="已上线">已上线</option>
        <option value="已作废">已作废</option>
      </select>

      <div className="row">
        <button className="primary" onClick={submitForm}>
          提交需求表单
        </button>
        <button onClick={onAskRound}>模拟 Agent 追问</button>
        <button onClick={onGenerateOptimized} disabled={busy}>
          {busy ? "生成中..." : "生成优化需求"}
        </button>
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
