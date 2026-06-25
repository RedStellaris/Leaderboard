import { C } from "../../config.js";

const medal = ["🥇", "🥈", "🥉"];

export function Rank({ n }) {
  if (n <= 3) return <span style={{ fontSize: "1rem" }}>{medal[n - 1]}</span>;
  return <span style={{ color: C.soft, fontSize: "0.82rem", fontWeight: 600 }}>P{n}</span>;
}
