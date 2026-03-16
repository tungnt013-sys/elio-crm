"use client";

import { useEffect, useState } from "react";

type PriceRow = {
  id: string;
  gradeLevel: string;
  price: number;
};

export function PricingSettings() {
  const [rows, setRows] = useState<PriceRow[]>([]);

  async function load() {
    const data = await fetch("/api/pricing").then((r) => r.json());
    setRows(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(gradeLevel: string, price: number) {
    await fetch("/api/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gradeLevel, price })
    });
    await load();
  }

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>Undergrad Pricing Config</h2>
      <p style={{ color: "var(--muted)" }}>Grad and PhD are always custom pricing.</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Grade</th>
            <th align="left">Price (USD)</th>
            <th align="left">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <EditablePriceRow key={row.id} row={row} onSave={save} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditablePriceRow({ row, onSave }: { row: PriceRow; onSave: (gradeLevel: string, price: number) => Promise<void> }) {
  const [value, setValue] = useState(String(row.price));

  return (
    <tr>
      <td>{row.gradeLevel}</td>
      <td>
        <input value={value} onChange={(e) => setValue(e.target.value)} style={{ width: 140 }} />
      </td>
      <td>
        <button onClick={() => void onSave(row.gradeLevel, Number(value))}>Save</button>
      </td>
    </tr>
  );
}
