import { ProgramType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getDefaultPrice(gradeLevel: string, programType: ProgramType) {
  if (programType !== ProgramType.UNDERGRAD) {
    return null;
  }

  const price = await prisma.pricingConfig.findFirst({
    where: {
      gradeLevel,
      programType: ProgramType.UNDERGRAD,
      isActive: true
    }
  });

  return price?.price ?? null;
}
