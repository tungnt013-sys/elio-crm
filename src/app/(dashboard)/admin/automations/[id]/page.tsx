import { redirect } from "next/navigation";

// All editing is now inline on the automations list page
export default function AutomationDetailPage() {
  redirect("/admin/automations");
}
