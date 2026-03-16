import { ProgramType, Stage } from "@prisma/client";
import type { UserRole } from "@/lib/roles";

export type SearchStudentResult = {
  id: string;
  fullName: string;
  email: string | null;
  parentName: string | null;
  parentPhone: string | null;
  currentStage: Stage | null;
  programType: ProgramType;
  school: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  staffId?: string | null;
  contactId?: string | null;
  parentId?: string | null;
};
