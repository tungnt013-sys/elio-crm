import { prisma } from "@/lib/prisma";

export default async function StaffPage() {
  const staff = await prisma.staff.findMany({ orderBy: { role: "asc" } });

  return (
    <section className="panel">
      <h1 style={{ marginTop: 0 }}>Staff</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Email</th>
            <th align="left">Role</th>
            <th align="left">Active</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.role}</td>
              <td>{item.active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
