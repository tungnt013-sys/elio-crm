import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AutomationsPage() {
  const rules = await prisma.emailAutomationRule.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ marginTop: 0 }}>Email Automations</h1>
        <Link href="/admin/automations/new">Create Rule</Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Stage</th>
            <th align="left">Delay</th>
            <th align="left">Status</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td><Link href={`/admin/automations/${rule.id}`}>{rule.name}</Link></td>
              <td>{rule.triggerStage}</td>
              <td>{rule.delayHours}h</td>
              <td>{rule.isActive ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
