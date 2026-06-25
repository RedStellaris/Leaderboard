import { C } from "../../config.js";

export function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.accent : "transparent",
      border: `1px solid ${active ? C.accent : C.border}`,
      color: active ? "#fff" : C.soft,
      padding: "6px 16px", borderRadius: 20, cursor: "pointer",
      fontSize: "0.8rem", fontWeight: active ? 600 : 400,
    }}>{children}</button>
  );
}

export function HeaderBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: `1px solid ${C.border}`,
      color: C.soft, padding: "8px 14px", borderRadius: 8,
      cursor: "pointer", fontSize: "0.8rem",
      display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
    }}>{children}</button>
  );
}
