import { ROLE } from "../constants/task";

function InteractionFeed({ items }) {
  return (
    <div className="card stack">
      <h3>跨角色互动记录</h3>
      {!items.length && <p className="small">暂无互动记录</p>}
      {items
        .slice()
        .reverse()
        .map((item) => (
          <div key={item.id} className="qa">
            <p>
              <b>{ROLE[item.role] || item.role}</b> · {item.action}
            </p>
            <p className="small">{item.message}</p>
            <p className="small">{item.time}</p>
          </div>
        ))}
    </div>
  );
}

export default InteractionFeed;
