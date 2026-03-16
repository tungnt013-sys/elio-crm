import type { UserRole } from "@/lib/roles";
import type { SessionUser } from "@/types";

type Action = "read" | "write" | "move" | "upload";

type Resource =
  | "students_all"
  | "student_detail"
  | "pipeline"
  | "meeting_notes"
  | "activity_logs"
  | "milestones"
  | "tasks"
  | "documents"
  | "email_rules"
  | "contracts"
  | "pricing"
  | "staff";

const MATRIX: Record<Resource, Partial<Record<UserRole, Action[]>>> = {
  students_all: {
    ADMIN: ["read"],
    SALES: ["read"],
    SALES_VIEW: ["read"],
    COUNSELOR: ["read"],
  },
  student_detail: {
    ADMIN: ["read"],
    SALES: ["read"],
    SALES_VIEW: ["read"],
    COUNSELOR: ["read"],
  },
  pipeline: {
    ADMIN: ["read", "move"],
    SALES: ["read", "move"],
    SALES_VIEW: ["read"],
    COUNSELOR: ["read"],
  },
  meeting_notes: {
    ADMIN: ["read"],
    SALES: ["read"],
    COUNSELOR: ["read", "write"],
  },
  activity_logs: {
    ADMIN: ["read", "write"],
    SALES: ["read", "write"],
    COUNSELOR: ["read", "write"],
  },
  milestones: {
    ADMIN: ["read", "write"],
    SALES: ["read"],
    COUNSELOR: ["read", "write"],
  },
  tasks: {
    ADMIN: ["read"],
    SALES: ["read"],
    COUNSELOR: ["read", "write"],
  },
  documents: {
    ADMIN: ["read", "upload"],
    SALES: ["read", "upload"],
    COUNSELOR: ["read", "upload"],
  },
  email_rules: {
    ADMIN: ["read", "write"],
    SALES: ["read"],
    COUNSELOR: ["read"],
  },
  contracts: {
    ADMIN: ["read", "write"],
    SALES: ["read", "write"],
    SALES_VIEW: ["read"],
    COUNSELOR: ["read"],
  },
  pricing: {
    ADMIN: ["read", "write"],
  },
  staff: {
    ADMIN: ["read", "write"],
  },
};

export function canAccess(role: UserRole, resource: Resource, action: Action) {
  return (MATRIX[resource][role] ?? []).includes(action);
}

export function requireRole(user: SessionUser | null, allowedRoles: UserRole[]) {
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}
