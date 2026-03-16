import { NextRequest, NextResponse } from "next/server";
import { PicType, Relationship, StaffRole, Stage, SubmitterType } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { deriveProgramType } from "@/lib/program";
import { prisma } from "@/lib/prisma";

type FilloutPayload = {
  submissionId: string;
  submittedAt: string;
  answers: Record<string, string | null | undefined>;
};

function mapAnswer(payload: FilloutPayload, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload.answers[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

let rrIndex = 0;

async function pickSalesOwner() {
  const sales = await prisma.staff.findMany({
    where: { role: StaffRole.SALES, active: true },
    orderBy: { email: "asc" }
  });
  if (sales.length === 0) {
    throw new Error("No active sales staff");
  }
  const owner = sales[rrIndex % sales.length];
  rrIndex += 1;
  return owner;
}

export async function POST(req: NextRequest) {
  if (process.env.FILLTOUT_WEBHOOK_SECRET) {
    const token = req.headers.get("x-fillout-secret");
    if (token !== process.env.FILLTOUT_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }
  }

  const body = (await req.json()) as FilloutPayload;
  const gradeLevel = mapAnswer(body, ["Q", "grade_level", "Trình độ học vấn"]) ?? "Unknown";
  const programType = deriveProgramType(gradeLevel);

  const contact = await prisma.contact.create({
    data: {
      id: body.submissionId,
      createdAt: new Date(body.submittedAt),
      submitterType: (mapAnswer(body, ["C", "Bạn là?"])?.toLowerCase().includes("phụ huynh") ? SubmitterType.PARENT : SubmitterType.STUDENT),
      fullName: mapAnswer(body, ["H", "full_name"]) ?? "Unknown Student",
      email: mapAnswer(body, ["I", "email"]),
      phone: mapAnswer(body, ["J", "phone"]),
      address: mapAnswer(body, ["K"]),
      addressLine2: mapAnswer(body, ["L"]),
      city: mapAnswer(body, ["M"]),
      state: mapAnswer(body, ["N"]),
      zipCode: mapAnswer(body, ["O"]),
      country: mapAnswer(body, ["P"]),
      gradeLevel,
      gradeLevelOther: mapAnswer(body, ["R"]),
      school: mapAnswer(body, ["S"]),
      schoolCity: mapAnswer(body, ["T"]),
      gpaScale10: mapAnswer(body, ["U"]),
      specializedSubject: mapAnswer(body, ["V"]),
      gpaScale4: mapAnswer(body, ["W"]),
      currentMajor: mapAnswer(body, ["X"]),
      hasTakenTests: mapAnswer(body, ["Y"]),
      plansFutureTests: mapAnswer(body, ["Z"]),
      plannedTests: mapAnswer(body, ["AA"]),
      plannedTestsOther: mapAnswer(body, ["AB"]),
      hasResume: mapAnswer(body, ["AC"]),
      resumeUrl: mapAnswer(body, ["AD"]),
      extracurriculars: mapAnswer(body, ["AE"]),
      workExperience: mapAnswer(body, ["AF"]),
      targetCountries: mapAnswer(body, ["AG"]),
      preferredUsRegions: mapAnswer(body, ["AH"]),
      intendedMajor: mapAnswer(body, ["AI"]),
      whyMajor: mapAnswer(body, ["AJ"]),
      targetSchools: mapAnswer(body, ["AK"]),
      expectedStart: mapAnswer(body, ["AL"]),
      financialSources: mapAnswer(body, ["AM"]),
      budget: mapAnswer(body, ["AN"]),
      desiredServices: mapAnswer(body, ["AO"]),
      leadSource: mapAnswer(body, ["AP"]),
      specialRequests: mapAnswer(body, ["AQ"]),
      referralCode: mapAnswer(body, ["AR"]),
      testScoresRaw: mapAnswer(body, ["AS"]),
      programType
    }
  });

  const parentEmail = mapAnswer(body, ["E", "parent_email"]);
  const parent = await prisma.parent.create({
    data: {
      studentId: contact.id,
      fullName: mapAnswer(body, ["D", "parent_name"]) ?? "Unknown Parent",
      email: parentEmail,
      phone: mapAnswer(body, ["F", "parent_phone"]),
      relationship: mapAnswer(body, ["G", "relationship"])?.toLowerCase().includes("anh") ? Relationship.SIBLING : Relationship.PARENT
    }
  });

  const siblingMatch = parentEmail
    ? await prisma.parent.findFirst({
        where: {
          email: parentEmail,
          studentId: { not: contact.id }
        },
        select: { id: true, studentId: true }
      })
    : null;

  const owner = await pickSalesOwner();

  await prisma.pipelineStage.create({
    data: {
      studentId: contact.id,
      stage: Stage.S1,
      picType: PicType.SALES,
      assignedToId: owner.id,
      notes: siblingMatch ? `Sibling candidate with student ${siblingMatch.studentId}` : null
    }
  });

  if (parent.email) {
    await sendEmail({
      to: [parent.email],
      subject: "Elio Admissions Inquiry Received",
      html: `<p>Hi ${parent.fullName}, we received ${contact.fullName}'s inquiry. Our team will contact you shortly.</p>`
    });
  }

  return NextResponse.json({ ok: true, studentId: contact.id, siblingMatch: siblingMatch?.studentId ?? null });
}
