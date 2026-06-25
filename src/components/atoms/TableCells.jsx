import { C } from "../../config.js";

export function rowBg(pilote, myPilot, i) {
  if (myPilot && pilote === myPilot) return "#C4123020";
  return i % 2 === 0 ? C.row : C.rowAlt;
}

export function rowBorder(pilote, myPilot) {
  return myPilot && pilote === myPilot
    ? `3px solid ${C.accent}`
    : "3px solid transparent";
}

export function Th({ children, right, center, display }) {
  const fs = display ? "0.8rem" : "0.68rem";
  return (
    <th style={{
      padding: "9px 12px",
      textAlign: right ? "right" : center ? "center" : "left",
      fontSize: fs, fontWeight: 700, letterSpacing: "0.1em",
      color: C.soft, textTransform: "uppercase",
      background: C.card, borderBottom: `1px solid ${C.border}`,
    }}>{children}</th>
  );
}

export function STh({ children, sortKey, sortConfig, onSort, right, center, display }) {
  const isActive = sortConfig.key === sortKey;
  const arrow    = isActive ? (sortConfig.dir === "asc" ? " ↑" : " ↓") : " ·";
  const fs       = display ? "0.8rem" : "0.68rem";
  return (
    <th onClick={() => onSort(sortKey)} style={{
      padding: "9px 12px",
      textAlign: right ? "right" : center ? "center" : "left",
      fontSize: fs, fontWeight: 700, letterSpacing: "0.1em",
      color: isActive ? C.text : C.soft, textTransform: "uppercase",
      background: C.card, borderBottom: `1px solid ${C.border}`,
      cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
    }}>
      {children}<span style={{ opacity: 0.5 }}>{arrow}</span>
    </th>
  );
}

export function Td({ children, right, center, mono, bold, dim, gold, display }) {
  const fs = display ? "1.05rem" : "0.875rem";
  const pd = display ? "14px 14px" : "11px 12px";
  return (
    <td style={{
      padding: pd,
      textAlign: center ? "center" : right ? "right" : "left",
      fontFamily: mono ? "'Courier New',monospace" : "inherit",
      fontWeight: bold ? 600 : 400, fontSize: fs,
      color: gold ? C.gold : dim ? C.soft : C.text,
      borderBottom: `1px solid ${C.border}22`,
    }}>{children}</td>
  );
}
