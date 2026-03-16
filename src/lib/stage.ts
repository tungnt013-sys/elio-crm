import { Stage } from "@prisma/client";

export const OPEN_STAGES: Stage[] = [Stage.S1, Stage.S2, Stage.S3, Stage.S4, Stage.S5, Stage.S6, Stage.S7, Stage.S8, Stage.S9];
export const CLOSED_STAGES: Stage[] = [Stage.S10, Stage.S11, Stage.S12, Stage.S13];

export const LOSS_STAGES = new Set<Stage>([Stage.S11, Stage.S12, Stage.S13]);

export function stageLabel(stage: Stage): string {
  return {
    S1: "New Lead",
    S2: "Contact Made",
    S3: "SQL",
    S4: "Appointment Pending",
    S5: "Appointment Scheduled",
    S6: "Proposal Pending",
    S7: "Quote Pending",
    S8: "Quote Ready",
    S9: "Proposal Sent",
    S10: "Closed Won",
    S11: "Lost - Not fit",
    S12: "Lost - No contact",
    S13: "Lost - Warm"
  }[stage];
}
