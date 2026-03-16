import { prisma } from "@/lib/prisma";

export default async function AutomationLogPage() {
  const jobs = await prisma.scheduledEmailJob.findMany({
    include: { student: true, rule: true },
    orderBy: { scheduledFor: "desc" },
    take: 200
  });

  return (
    <section className="panel">
      <h1 style={{ marginTop: 0 }}>Automation Job Log</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Rule</th>
            <th align="left">Student</th>
            <th align="left">When</th>
            <th align="left">Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.rule.name}</td>
              <td>{job.student.fullName}</td>
              <td>{new Date(job.scheduledFor).toLocaleString()}</td>
              <td>{job.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
