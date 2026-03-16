export type UserRole = "ADMIN" | "COUNSELOR" | "SALES" | "SALES_VIEW" | "PENDING" | "PARENT" | "STUDENT";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  COUNSELOR: "Counselor",
  SALES: "Sales",
  SALES_VIEW: "Sales (View Only)",
  PENDING: "Pending",
  PARENT: "Parent",
  STUDENT: "Student",
};

export const ALL_ROLES: UserRole[] = ["ADMIN", "COUNSELOR", "SALES", "SALES_VIEW"];
