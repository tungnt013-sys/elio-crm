import { notFound } from "next/navigation";
import { EmailRuleForm } from "@/components/email-rule-form";
import { prisma } from "@/lib/prisma";

export default async function AutomationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rule = id === "new" ? null : await prisma.emailAutomationRule.findUnique({ where: { id } });
  if (id !== "new" && !rule) {
    notFound();
  }

  return (
    <section className="panel">
      <h1 style={{ marginTop: 0 }}>{id === "new" ? "Create Rule" : "Edit Rule"}</h1>
      <EmailRuleForm initial={rule ?? undefined} />
    </section>
  );
}
