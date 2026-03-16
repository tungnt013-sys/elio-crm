import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail(input: { to: string[]; subject: string; html: string; cc?: string[] }) {
  if (!resend) {
    console.log("[email:dry-run]", input);
    return { id: "dry-run" };
  }

  return resend.emails.send({
    from: "Elio CRM <noreply@elio.edu.vn>",
    to: input.to,
    cc: input.cc,
    subject: input.subject,
    html: input.html
  });
}
