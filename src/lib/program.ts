import { ProgramType } from "@prisma/client";

const UNDERGRAD_GRADES = new Set(["Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"]);
const GRAD_GRADES = ["Cử nhân", "Đại học", "Năm 1", "Năm 2", "Năm 3", "Năm 4"];

export function deriveProgramType(gradeLevel: string): ProgramType {
  const trimmed = gradeLevel.trim();
  if (UNDERGRAD_GRADES.has(trimmed)) {
    return ProgramType.UNDERGRAD;
  }
  if (GRAD_GRADES.some((value) => trimmed.includes(value))) {
    return ProgramType.GRAD;
  }
  if (trimmed.includes("Thạc sĩ")) {
    return ProgramType.PHD;
  }
  return ProgramType.GRAD;
}
