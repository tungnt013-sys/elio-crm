import { PrismaClient, AutomationCondition, AutomationRecipientRole, ProgramType, StaffRole, Stage, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "tung@example.com" },
    update: { role: UserRole.ADMIN, isActive: true, name: "Tung Nguyen" },
    create: {
      email: "tung@example.com",
      name: "Tung Nguyen",
      role: UserRole.ADMIN,
      googleId: "seed-admin-google",
      isActive: true
    }
  });

  await prisma.staff.upsert({
    where: { email: "sales1@elio.edu.vn" },
    update: {},
    create: { name: "Sales One", email: "sales1@elio.edu.vn", role: StaffRole.SALES, active: true }
  });

  await prisma.staff.upsert({
    where: { email: "sales2@elio.edu.vn" },
    update: {},
    create: { name: "Sales Two", email: "sales2@elio.edu.vn", role: StaffRole.SALES, active: true }
  });

  await prisma.staff.upsert({
    where: { email: "counselor1@elio.edu.vn" },
    update: {},
    create: { name: "Counselor One", email: "counselor1@elio.edu.vn", role: StaffRole.COUNSELOR, active: true }
  });

  await prisma.staff.upsert({
    where: { email: "counselor2@elio.edu.vn" },
    update: {},
    create: { name: "Counselor Two", email: "counselor2@elio.edu.vn", role: StaffRole.COUNSELOR, active: true }
  });

  const priceMap = [
    { gradeLevel: "Lớp 12", price: 12000 },
    { gradeLevel: "Lớp 11", price: 19520 },
    { gradeLevel: "Lớp 10", price: 25820 },
    { gradeLevel: "Lớp 9", price: 27000 }
  ];

  for (const row of priceMap) {
    await prisma.pricingConfig.upsert({
      where: { gradeLevel_programType: { gradeLevel: row.gradeLevel, programType: ProgramType.UNDERGRAD } },
      update: { price: row.price, updatedById: admin.id, isActive: true },
      create: {
        gradeLevel: row.gradeLevel,
        programType: ProgramType.UNDERGRAD,
        price: row.price,
        updatedById: admin.id,
        isActive: true
      }
    });
  }

  await prisma.emailAutomationRule.create({
    data: {
      name: "Proposal overdue reminder",
      triggerStage: Stage.S6,
      delayHours: 24,
      condition: AutomationCondition.STILL_IN_STAGE,
      recipientRole: AutomationRecipientRole.ASSIGNED_COUNSELOR,
      ccEmails: ["admin@elio.edu.vn"],
      emailSubject: "[Elio CRM] Proposal overdue for {{student_name}}",
      emailBody: "Student {{student_name}} is still in {{stage_name}} for {{days_elapsed}} days.",
      isActive: true,
      createdById: admin.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
