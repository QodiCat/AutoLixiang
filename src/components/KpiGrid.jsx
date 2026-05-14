function KpiGrid({ kpis }) {
  return (
    <div className="grid three">
      <div className="kpi">
        <b>追问轮次</b>
        <span>{kpis.rounds} / 3+</span>
      </div>
      <div className="kpi">
        <b>新增价值点</b>
        <span>{kpis.value}</span>
      </div>
      <div className="kpi">
        <b>落地方案完整</b>
        <span>{kpis.landed}</span>
      </div>
    </div>
  );
}

export default KpiGrid;
