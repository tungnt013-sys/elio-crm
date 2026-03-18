export interface Student {
  name: string;
  school: string;
  grade: string;
  counselor: string;
  major: string;
  targets: string;
  gpa: string;
  sat: string;
  ielts: string;
  budget: string;
  activities: string[];
  notes: string;
  referral: string;
}

export interface PastCase {
  id: number;
  label: string;
  sim: number;
}

export interface Diagnosis {
  strengths: string[];
  weaknesses: string[];
  narrative: string;
  risks: string[];
  gaps: string[];
}

export interface ProjectProgram {
  name: string;
  url: string;
  deadline: string;
  cost: string;
}

export interface Project {
  id: string;
  src: string;
  sc: string;
  sb: string;
  name: string;
  concept: string;
  rationale: string;
  diff: string;
  time: string;
  link: string;
  prog?: ProjectProgram;
}

export interface Deliverable {
  label: string;
  type: string;
  spec: string;
  vis: string;
  due: string;
}

export interface Phase {
  period: string;
  focus: string;
  ms: string;
}

export interface LoadMessage {
  msg: string;
  sub: string;
}
