import { ROLE } from "../constants/task";

function RoleGate({ onSelect }) {
  return (
    <div className="app">
      <div className="card stack">
        <div>
          <h1>AI 协作需求平台</h1>
          <p className="sub">React + Vite 前端模拟版 · 莫兰迪风格</p>
        </div>
        <div className="grid two">
          {Object.entries(ROLE).map(([key, label]) => (
            <button key={key} onClick={() => onSelect(key)} className="primary">
              进入{label}工作台
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoleGate;
