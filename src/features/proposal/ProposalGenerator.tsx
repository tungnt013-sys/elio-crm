"use client";

import { useState } from "react";
import type { Student, PastCase, Diagnosis, Project, Deliverable, Phase, LoadMessage } from "./types";
import styles from "./proposal.module.css";
import LeftPanel from "./components/LeftPanel";
import StepBar from "./components/StepBar";
import Loading from "./components/Loading";
import SetupScreen from "./components/SetupScreen";
import DiagnosisScreen from "./components/DiagnosisScreen";
import ProjectsScreen from "./components/ProjectsScreen";
import DeliverablesScreen from "./components/DeliverablesScreen";
import PreviewScreen from "./components/PreviewScreen";

export interface ProposalGeneratorProps {
  student: Student;
  pastCases: PastCase[];
  diagnosis: Diagnosis;
  projects: Project[];
  deliverables: Deliverable[];
  phases: Phase[];
  loadMessages: LoadMessage[];
}

export default function ProposalGenerator({
  student,
  pastCases,
  diagnosis,
  projects,
  deliverables,
  phases,
  loadMessages,
}: ProposalGeneratorProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lm, setLm] = useState<LoadMessage>({ msg: "", sub: "" });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const advance = (projectId?: string) => {
    if (projectId) setSelectedProjectId(projectId);
    setLm(loadMessages[step] ?? loadMessages[0]);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep((s) => s + 1);
    }, 2200);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const screens = [
    <SetupScreen key="setup" student={student} pastCases={pastCases} onNext={() => advance()} />,
    <DiagnosisScreen key="diag" diagnosis={diagnosis} onNext={() => advance()} />,
    <ProjectsScreen key="projects" projects={projects} onNext={(id) => advance(id)} />,
    <DeliverablesScreen key="delivs" deliverables={deliverables} phases={phases} onNext={() => advance()} />,
    <PreviewScreen key="preview" student={student} selectedProject={selectedProject} />,
  ];

  return (
    <div
      className={styles.root}
      style={{
        display: "flex",
        height: "calc(100vh - 48px)",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <LeftPanel student={student} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <StepBar step={step} />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? <Loading msg={lm.msg} sub={lm.sub} /> : screens[step]}
        </div>
      </div>
    </div>
  );
}
