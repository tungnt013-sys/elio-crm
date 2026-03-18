import ProposalGenerator from "@/features/proposal/ProposalGenerator";
import {
  MOCK_STUDENT,
  MOCK_PAST_CASES,
  MOCK_DIAGNOSIS,
  MOCK_PROJECTS,
  MOCK_DELIVERABLES,
  MOCK_PHASES,
  LOAD_MESSAGES,
} from "@/features/proposal/mock-data";

export default function ProposalPage() {
  // Break out of .main's 24px padding so the generator fills the full content area
  return (
    <div style={{ margin: "-24px", overflow: "hidden" }}>
      <ProposalGenerator
        student={MOCK_STUDENT}
        pastCases={MOCK_PAST_CASES}
        diagnosis={MOCK_DIAGNOSIS}
        projects={MOCK_PROJECTS}
        deliverables={MOCK_DELIVERABLES}
        phases={MOCK_PHASES}
        loadMessages={LOAD_MESSAGES}
      />
    </div>
  );
}
