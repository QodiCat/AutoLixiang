import { useMemo, useState } from "react";
import { ROLE } from "../constants/task";

function RoleGate({ onRegister, onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("biz");
  const [notice, setNotice] = useState("");
  const roleEntries = useMemo(() => Object.entries(ROLE), []);

  function submit() {
    const cleanUser = username.trim();
    const cleanPassword = password.trim();
    if (!cleanUser || !cleanPassword) {
      setNotice("请填写账号和密码");
      return;
    }
    if (mode === "register") {
      const result = onRegister({ username: cleanUser, password: cleanPassword, role });
      setNotice(result.message);
      return;
    }
    const result = onLogin({ username: cleanUser, password: cleanPassword });
    setNotice(result.message);
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-head">
          <h1>AI 协作需求平台</h1>
          <p className="sub">登录或注册后，按身份进入对应工作台</p>
        </div>

        <div className="auth-switch">
          <button className={mode === "login" ? "primary" : ""} onClick={() => setMode("login")}>
            登录
          </button>
          <button className={mode === "register" ? "primary" : ""} onClick={() => setMode("register")}>
            注册
          </button>
        </div>

        <div className="auth-form">
          <input placeholder="账号" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "register" && (
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {roleEntries.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          )}
          <button className="primary auth-submit" onClick={submit}>
            {mode === "register" ? "注册并登录" : "登录"}
          </button>
          {notice && <p className="small auth-notice">{notice}</p>}
        </div>
      </div>
    </div>
  );
}

export default RoleGate;
