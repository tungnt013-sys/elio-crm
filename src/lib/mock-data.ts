/**
 * Real CRM data — sourced from Elio Core CRM.xlsx + student roster HTML.
 * Used automatically when DATABASE_URL is not configured.
 */

import { Stage } from "@prisma/client";

export const IS_MOCK = !process.env.DATABASE_URL;

// ── Staff ─────────────────────────────────────────────────────
const SALES_HANG = { id: "staff-hang", name: "Hằng", email: "hang.nm@elio.education" };
const COUNSELOR_DUC = { id: "staff-duc", name: "Đức", email: "duc@elio.education" };
const COUNSELOR_PHUONG = { id: "staff-phuong", name: "Phương", email: "phuong@elio.education" };
const COUNSELOR_TUNG = { id: "staff-tung", name: "Tùng", email: "tung@elio.education" };

export const MOCK_STAFF = [SALES_HANG, COUNSELOR_DUC, COUNSELOR_PHUONG, COUNSELOR_TUNG];

// ── Date helpers ─────────────────────────────────────────────
const d = (s: string) => new Date(s).toISOString();

// ── Pipeline cards (from real CRM data) ──────────────────────
export const MOCK_PIPELINE: Record<Stage, unknown[]> = {
  S1: [],
  S2: [],
  S3: [],
  S4: [],
  S5: [
    {
      id: "ps-baodan", stage: "S5", enteredAt: d("2025-12-16"),
      student: { id: "c-baodan", fullName: "Bảo Đan", parents: [{ fullName: "chị Tâm" }] },
      assignedTo: SALES_HANG,
    },
  ],
  S6: [
    {
      id: "ps-khoinguyen", stage: "S6", enteredAt: d("2025-09-05"),
      student: { id: "c-khoinguyen", fullName: "Phạm Khôi Nguyên", parents: [{ fullName: "Phạm Phương Thuỷ" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-khang", stage: "S6", enteredAt: d("2025-12-01"),
      student: { id: "c-khang", fullName: "Khang", parents: [{ fullName: "anh Dân" }] },
      assignedTo: COUNSELOR_DUC,
    },
  ],
  S7: [],
  S8: [],
  S9: [
    {
      id: "ps-thinh", stage: "S9", enteredAt: d("2025-11-20"),
      student: { id: "c-thinh", fullName: "Nguyễn Trường Thịnh", parents: [{ fullName: "Nguyễn Bích Liên" }] },
      assignedTo: COUNSELOR_PHUONG,
    },
    {
      id: "ps-duydung", stage: "S9", enteredAt: d("2025-11-20"),
      student: { id: "c-duydung", fullName: "Duy Dũng", parents: [{ fullName: "Lê Anh Tú" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-ducminh", stage: "S9", enteredAt: d("2025-11-24"),
      student: { id: "c-ducminh", fullName: "Đức Minh", parents: [{ fullName: "anh Tùng" }] },
      assignedTo: COUNSELOR_DUC,
    },
  ],
  S10: [
    {
      id: "ps-hung", stage: "S10", enteredAt: d("2025-12-08"),
      student: { id: "c-hung", fullName: "Hùng", parents: [{ fullName: "Hằng Lê" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-thinh-won", stage: "S10", enteredAt: d("2025-11-10"),
      student: { id: "c-thinh", fullName: "Nguyễn Trường Thịnh", parents: [{ fullName: "Nguyễn Bích Liên" }] },
      assignedTo: COUNSELOR_PHUONG,
    },
    {
      id: "ps-duydung-won", stage: "S10", enteredAt: d("2025-10-08"),
      student: { id: "c-duydung", fullName: "Duy Dũng", parents: [{ fullName: "Lê Anh Tú" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-ducminh-won", stage: "S10", enteredAt: d("2025-12-18"),
      student: { id: "c-ducminh", fullName: "Đức Minh", parents: [{ fullName: "anh Tùng" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-triet-won", stage: "S10", enteredAt: d("2025-12-01"),
      student: { id: "c-triet", fullName: "Chiết", parents: [{ fullName: "anh Huynh" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-emma-won", stage: "S10", enteredAt: d("2025-11-21"),
      student: { id: "c-emma", fullName: "Mai Hương (Emma)", parents: [{ fullName: "chị Minh" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-haanh-won", stage: "S10", enteredAt: d("2025-12-22"),
      student: { id: "c-haanh", fullName: "Trần Hà Anh", parents: [{ fullName: "chị Hằng" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-danhtao-won", stage: "S10", enteredAt: d("2025-10-12"),
      student: { id: "c-danhtao", fullName: "Danh Tạo", parents: [{ fullName: "chị Ngân" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-nhatminh-won", stage: "S10", enteredAt: d("2025-12-04"),
      student: { id: "c-nhatminh", fullName: "Nhật Minh", parents: [{ fullName: "Luật sư" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-anhdoanh-won", stage: "S10", enteredAt: d("2025-10-10"),
      student: { id: "c-anhdoanh", fullName: "Anh Doanh", parents: [{ fullName: "Self-referral" }] },
      assignedTo: COUNSELOR_PHUONG,
    },
    {
      id: "ps-thutrang-won", stage: "S10", enteredAt: d("2025-10-20"),
      student: { id: "c-thutrang", fullName: "Thu Trang", parents: [{ fullName: "Mother" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-tuenhi-won", stage: "S10", enteredAt: d("2025-11-15"),
      student: { id: "c-tuenhi", fullName: "Tuệ Nhi", parents: [{ fullName: "Mother (HR)" }] },
      assignedTo: COUNSELOR_DUC,
    },
    {
      id: "ps-maihuong-won", stage: "S10", enteredAt: d("2025-12-10"),
      student: { id: "c-maihuong", fullName: "Mai Hương (EMA)", parents: [{ fullName: "Mother" }] },
      assignedTo: COUNSELOR_DUC,
    },
  ],
  S11: [], S12: [], S13: [],
};

// ── Detailed student roster (from HTML file) ─────────────────
export type StudentDetail = {
  id: string;
  fullName: string;
  level: "Graduate" | "UG · G11" | "UG · G9" | "Done";
  group: "grad" | "g11" | "g9" | "done";
  studentInfo: string;
  parentInfo: string;
  keyNotes: string;
  issues: string[];
  tags: string[];
  email?: string;
  phone?: string;
  school?: string;
  gradeLevel?: string;
  parents: { fullName: string; phone?: string; email?: string }[];
  assignedTo: string;
  contractCode?: string;
  paymentStatus?: string;
};

export const STUDENT_ROSTER: StudentDetail[] = [
  {
    id: "c-anhdoanh",
    fullName: "Anh Doanh",
    level: "Graduate",
    group: "grad",
    studentInfo: "Applied Jan 28 — now waiting for results. Found Tùng via Facebook.",
    parentInfo: "No parent info mentioned. He's an adult self-referral.",
    keyNotes: "Service essentially complete. Phương was main contact. Follow-up call needed to check satisfaction.",
    issues: [],
    tags: ["follow-up call needed"],
    parents: [{ fullName: "Self-referral" }],
    assignedTo: "Phương",
  },
  {
    id: "c-thinh",
    fullName: "Trường Thịnh",
    level: "Graduate",
    group: "grad",
    studentInfo: "Senior at American University (USA). Business/Finance. Targeting Master in data analytics, financial analytics, or risk analysis. Applied NYU, Northeastern. Has green card — no visa concern.",
    parentInfo: "Mother referred via Thu Trang's mom. Mother is very involved; Phương messages into family group chat when Thịnh is unresponsive.",
    keyNotes: "Chronically unresponsive — only reacts when mom is looped in. Northeastern submitted; other apps in progress. Phương is primary handler.",
    issues: ["Chronically unresponsive"],
    tags: [],
    email: "thinhnguyen773@protonmail.com",
    school: "American University",
    gradeLevel: "Cử nhân",
    parents: [{ fullName: "Nguyễn Bích Liên", phone: "0983270270", email: "truongthinh@noemail" }],
    assignedTo: "Phương",
    contractCode: "20112025-03/HĐTVDH-ELIO",
    paymentStatus: "Đã thanh toán đợt 1",
  },
  {
    id: "c-thutrang",
    fullName: "Thu Trang",
    level: "Graduate",
    group: "grad",
    studentInfo: "CS background → tried nursing for visa stability → back to CS. Has STEM OPT. Admitted to Boston University already. Considering deferring to apply CMU (stronger CS) in 2027. Will prep GRE.",
    parentInfo: "Mother extremely fond of Elio team. Mother of Trường Thịnh was referred through her. Older brother (same year as Phương & An) is 'a bit lost' — Đức building rapport with him.",
    keyNotes: "No urgent issue. Decision: BU this year vs. wait for CMU-tier in 2027. Brother is a future potential client. Heritage student — feedback call still worthwhile.",
    issues: [],
    tags: [],
    parents: [{ fullName: "Mother" }],
    assignedTo: "Đức",
  },
  {
    id: "c-tuenhi",
    fullName: "Tuệ Nhi",
    level: "Graduate",
    group: "grad",
    studentInfo: "Studied at BIS (UK international school), IB 45/45. Currently on gap year in Vietnam. Interested in university administration + higher ed management → PhD path. Inspired by thầy Hiếu. Dislikes classroom teaching; prefers working with university students.",
    parentInfo: "Father: government (nhà nước). Mother: HR at a private company. Very wealthy. Referred by Hùng's mother (close friends). Mother calls Đức frequently; talks at length. Younger brother (G9) attempting Griffin scholarship.",
    keyNotes: "Discipline & commitment gaps — referred into jobs, not self-driven yet. Lost about specific path. Contract runs to 2027. Mom very happy with self-discovery progress but worried about follow-through. Monthly check-in meetings ongoing.",
    issues: ["Discipline & commitment gaps"],
    tags: [],
    parents: [{ fullName: "Mother (HR)" }],
    assignedTo: "Đức",
  },
  {
    id: "c-emma",
    fullName: "Emma",
    level: "UG · G11",
    group: "g11",
    studentInfo: "Psychology focus: animal rights from a psychological lens. Moderate academic profile. Taking AP at school, studying ECT. Targeting UC system (not elite reach).",
    parentInfo: "Mother: chị Minh (contact via Messenger). Expectations calibrated — no pressure for top-tier schools.",
    keyNotes: "PhD mentor: Phúc (UC San Diego, Psychology) — strong match. Build one meaningful extracurricular + continue research paper. Both deliverables needed before application season.",
    issues: [],
    tags: ["To do"],
    parents: [{ fullName: "chị Minh" }],
    assignedTo: "Đức",
    contractCode: "21112025 - 01/HĐTVDH-ELIO",
  },
  {
    id: "c-duydung",
    fullName: "Duy Dũng",
    level: "UG · G11",
    group: "g11",
    studentInfo: "Wants CS. Targeting top 30–50 universities. Very compliant — does whatever is advised without question. Stephen (Hiếu's ex-student, studying CS in USA) mentoring him on hackathons for tech portfolio.",
    parentInfo: "Father: director at a subsidiary of Đào Trung Hải's family company. Trung Hải (anh Hải, Boston) referred him to Phương. Family follows Hiếu's ecosystem. Parents never push back on recommendations.",
    keyNotes: "IELTS: 7.5 overall but Speaking stuck at 6.0 (needs 7.0). Needs tech internship ASAP — early contacts haven't replied yet. SAT is current priority; IELTS speaking coaching needed before retake in summer.",
    issues: ["Needs tech internship ASAP"],
    tags: [],
    parents: [{ fullName: "Lê Anh Tú", phone: "0972635794" }],
    assignedTo: "Đức",
    contractCode: "20112025 - 02/HĐTVDH-ELIO",
    paymentStatus: "Đã thanh toán đợt 1",
  },
  {
    id: "c-danhtao",
    fullName: "Danh Tạo",
    level: "UG · G11",
    group: "g11",
    studentInfo: "IB student at Olympia. Not academically gifted enough to thrive in IB while managing extensive extracurriculars. Needs significant foundational habit-building.",
    parentInfo: "Mother: finance professional, assigned to Manila — flies Thu→Sat weekly. Father: runs own business, less involved. Mother is the key contact but Danh Tạo doesn't listen to her well. Both parents very high-earning.",
    keyNotes: "Academic performance + discipline. 4 months in, still building basics. Post-Tết: Đức will meet with family + Hiếu + Olympia team to realign expectations around realistic school targets. Assignment given over Tết to improve study habits.",
    issues: ["Academic performance + discipline"],
    tags: [],
    school: "The Olympia Schools",
    parents: [{ fullName: "chị Ngân", phone: "0941058388" }],
    assignedTo: "Đức",
    contractCode: "20112025 - 01/HĐTVDH-ELIO",
    paymentStatus: "Đã thanh toán đợt 1",
  },
  {
    id: "c-ducminh",
    fullName: "Đức Minh",
    level: "UG · G11",
    group: "g11",
    studentInfo: "Very strong academically — bio/chem interest, IB Extended Essay in biology (mini research). Competing in Conrad Challenge (NASA innovation competition). Curious and intellectually deep.",
    parentInfo: "Father: very attentive, messages/calls Đức frequently. Reacted strongly to SAT score. Extended family previously saw Đức Minh as the star student (especially vs. cousin Hà Anh).",
    keyNotes: "Overconfidence humbled — SAT 1480 vs. target 1550; scored lower than cousin Hà Anh. Conrad Challenge: first attempt, not expected to win but good learning. Research project underway with ĐHKHTN students via school connection. Now more focused.",
    issues: ["Overconfidence humbled"],
    tags: [],
    parents: [{ fullName: "anh Tùng", phone: "0983646428" }],
    assignedTo: "Đức",
    contractCode: "24112025-02/HĐTVDH-ELIO",
    paymentStatus: "Đã thanh toán đợt 1",
  },
  {
    id: "c-haanh",
    fullName: "Hà Anh",
    level: "UG · G11",
    group: "g11",
    studentInfo: "Strong SAT, studying IELTS, in Hiếu's essay class. Very reflective and intellectually curious. Interested in biochemistry → biotech engineering (primary); neuroscience (secondary). Runs an org supporting children with intellectual disabilities. Cousin of Đức Minh.",
    parentInfo: "Part of same extended family as Đức Minh. Father's side. No separate parent notes — family dynamic shared with Đức Minh's household.",
    keyNotes: "Find PhD advisor/research mentor in bio — biochem, biotech, or neuroscience. Tùng has Fulbright PhD contacts in bio in Vietnam. Research can be joint or independent, 3–5 months, $1,000 / ~10–15 hrs. She lacks research experience and competitive awards — both gaps to close.",
    issues: [],
    tags: ["Action item"],
    parents: [{ fullName: "chị Hằng", phone: "0904469677" }],
    assignedTo: "Đức",
    contractCode: "24112025-03/HĐTVDH-ELIO",
    paymentStatus: "Đã thanh toán đợt 1",
  },
  {
    id: "c-nhatminh",
    fullName: "Nhật Minh",
    level: "UG · G11",
    group: "g11",
    studentInfo: "All applications submitted. Now in interview prep phase. American Study handling outstanding paperwork (certificate of finance, etc.).",
    parentInfo: "Mother is a lawyer. Very involved and has high expectations — Đức feels he's done everything possible for this case.",
    keyNotes: "Final stretch. Outstanding: submit remaining documents, interview preparation. No major issues flagged. Feedback call with mother planned.",
    issues: [],
    tags: [],
    parents: [{ fullName: "Luật sư" }],
    assignedTo: "Đức",
  },
  {
    id: "c-triet",
    fullName: "Chiết",
    level: "UG · G9",
    group: "g9",
    studentInfo: "Grade 9. #1 in grade 8 cohort. Finance + entrepreneurship track. Socially smart, sweet-natured. Project: 'Fund Bunch' / $1 subscription model for local micro-charities (student voting mechanic). Applying to Wharton summer camp + G9/10 competitions.",
    parentInfo: "Father (anh Huynh): Hiếu's close friend; helped structure contract to give father more leverage in divorce proceedings. Mother: PhD in biology, lives in Australia — Elio is aligned with father's side, so mother's bio expertise is not being leveraged.",
    keyNotes: "Easiest current case — pure character development phase. G9 officially started Jan 2025. Đức has strong rapport built. Rapport with father very strong. Father cannot pay by card — needs alternative payment method.",
    issues: [],
    tags: ["Contract note"],
    parents: [{ fullName: "anh Huynh" }],
    assignedTo: "Đức",
    contractCode: "01122025 - 01/HĐTVDH-ELIO",
  },
  {
    id: "c-maihuong",
    fullName: "Mai Hương (EMA)",
    level: "UG · G9",
    group: "g9",
    studentInfo: "Grade 9. Service not yet started — no onboarding completed.",
    parentInfo: "Mother has not yet confirmed or responded. Largest single ticket size in current pipeline (~near 1 billion VND). Family is wealthy; low urgency on their end because it's G9.",
    keyNotes: "Deal at risk — not closed. Followed up nearly every week with no reply. Đức considering calling mother directly. G9 families move slowly but ticket size demands urgency.",
    issues: ["Deal at risk — not closed"],
    tags: [],
    parents: [{ fullName: "Mother" }],
    assignedTo: "Đức",
  },
  {
    id: "c-hung",
    fullName: "Hùng",
    level: "Done",
    group: "done",
    studentInfo: "Service complete (Souyou shop / study abroad consulting). Parents converted a multi-floor home into a community public library as Hùng's long-term project — foregone rental income as investment in his profile.",
    parentInfo: "Mother: extremely wealthy, close friends with Tuệ Nhi's mother (mutual referral relationship). Both mothers stylish, high-net-worth. Mother is very aware of son's privilege and wants community projects to balance it.",
    keyNotes: "Send post-service survey, then follow-up call. Strong referral source — mother already referred Tuệ Nhi's family. Maintain relationship carefully.",
    issues: [],
    tags: [],
    email: "hung@gmail.com",
    gradeLevel: "Lớp 9",
    school: "TH, Dwight",
    parents: [{ fullName: "Hằng Lê", email: "hang@gmail.com", phone: "0903275189" }],
    assignedTo: "Đức",
  },
];

// ── Contracts (from Tracking hợp đồng sheet) ────────────────
export const MOCK_CONTRACTS = [
  {
    id: "con-01", contractCode: "20112025-03/HĐTVDH-ELIO", status: "ACTIVE",
    student: { fullName: "Nguyễn Trường Thịnh" },
    payments: [{ amount: 50000000, currency: "VND", date: "20/11", note: "Đợt 1" }, { amount: 50000000, currency: "VND", date: "26/12", note: "Đợt 2" }],
    shippingAddress: "15K6 Khu đô thị Ciputra, Phường Phú Thượng",
    recipient: "chị Liên", recipientPhone: "0983270270",
  },
  {
    id: "con-02", contractCode: "20112025 - 02/HĐTVDH-ELIO", status: "ACTIVE",
    student: { fullName: "Duy Dũng" },
    payments: [{ amount: 199465500, currency: "VND", date: "8/10", note: "Đặt cọc" }, { amount: 186824580, currency: "VND", date: "26/11", note: "Đợt 2" }],
    shippingAddress: "Tầng 2 tòa nhà Báo Nông thôn ngày nay - Lô E2",
    recipient: "Lê Anh Tú", recipientPhone: "0972635794",
  },
  {
    id: "con-03", contractCode: "24112025-02/HĐTVDH-ELIO", status: "ACTIVE",
    student: { fullName: "Đức Minh" },
    payments: [{ amount: 0, currency: "VND", date: "18/12", note: "Đợt 1" }],
    shippingAddress: "Số 89/292, Thôn Cống Thôn, Xã Phù Đổng",
    recipient: "anh Tùng", recipientPhone: "0983646428",
  },
  {
    id: "con-04", contractCode: "01122025 - 01/HĐTVDH-ELIO", status: "SENT",
    student: { fullName: "Chiết" },
    payments: [],
    shippingAddress: "ở SG, anh Đức gửi sau",
  },
  {
    id: "con-05", contractCode: "21112025 - 01/HĐTVDH-ELIO", status: "SENT",
    student: { fullName: "Mai Hương (Emma)" },
    payments: [],
    shippingAddress: "ở SG, anh Đức gửi sau",
  },
  {
    id: "con-06", contractCode: "24112025-03/HĐTVDH-ELIO", status: "ACTIVE",
    student: { fullName: "Trần Hà Anh" },
    payments: [{ amount: 0, currency: "VND", date: "22/12", note: "Đợt 1" }],
    shippingAddress: "Park 5 KĐT Times City, Hà Nội",
    recipient: "chị Hằng", recipientPhone: "0904469677",
  },
  {
    id: "con-07", contractCode: "20112025 - 01/HĐTVDH-ELIO", status: "ACTIVE",
    student: { fullName: "Danh Tạo" },
    payments: [{ amount: 0, currency: "VND", date: "12/10", note: "Đợt 1" }],
    shippingAddress: "C22-BT7 Khu đô thị Việt Hưng, phường Việt Hưng",
    recipient: "chị Ngân", recipientPhone: "0941058388",
  },
  {
    id: "con-08", contractCode: "04122025 - 01/HĐTVDH-ELIO", status: "ACTIVE",
    student: { fullName: "Nhật Minh" },
    payments: [{ amount: 0, currency: "VND", date: "4/12", note: "Đợt 1" }],
  },
];

// ── Full lead data (from Excel Data sheet — all 114 rows summarized) ─
export type LeadRecord = {
  id: string;
  submissionTime: string;
  submitter: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  city?: string;
  country: string;
  gradeLevel: string;
  school: string;
  desiredField?: string;
  desiredSchools?: string;
  referralSource?: string;
  leadStatus: string;
  firstContact?: string;
  lastContact?: string;
  salesNotes?: string;
  consultantNotes?: string;
  proposalLink?: string;
};

// Top leads from real data — Won + Active pipeline
export const MOCK_LEADS: LeadRecord[] = [
  {
    id: "lead-01", submissionTime: "2025-08-11", submitter: "Phụ huynh",
    parentName: "Hằng Lê", parentEmail: "hang@gmail.com", parentPhone: "84903275189",
    studentName: "Hùng", studentEmail: "hung@gmail.com", studentPhone: "84000000000",
    city: "Hà Nội", country: "Vietnam", gradeLevel: "Lớp 9", school: "TH, Dwight",
    leadStatus: "S10 - Closed – Won", firstContact: "2025-08-11", lastContact: "2025-11-10",
    salesNotes: "14/11: meeting strategy workshop\n10/11: Nhắn chốt lịch meeting strategy workshop",
  },
  {
    id: "lead-02", submissionTime: "2025-08-11", submitter: "Học sinh",
    parentName: "Nguyễn Bích Liên", parentEmail: "truongthinh@noemail", parentPhone: "84983270270",
    studentName: "Nguyễn Trường Thịnh", studentEmail: "thinhnguyen773@protonmail.com", studentPhone: "19298326815",
    country: "United States", gradeLevel: "Cử nhân", school: "American University",
    leadStatus: "S10 - Closed – Won", firstContact: "2025-08-11", lastContact: "2025-09-12",
    salesNotes: "Case này nộp thạc sĩ để Anh Đức và Phương xử lý",
  },
  {
    id: "lead-03", submissionTime: "2025-08-21", submitter: "Phụ huynh",
    parentName: "Phạm Phương Thuỷ", parentEmail: "xitrum1906@gmail.com", parentPhone: "84962826868",
    studentName: "Phạm Khôi Nguyên", studentEmail: "khoinguyenpham1704@gmail.com", studentPhone: "84962826868",
    city: "Hà Nội", country: "Vietnam", gradeLevel: "Lớp 9", school: "BVIS",
    leadStatus: "S6 - Proposal Pending",
    salesNotes: "S5: 5/9",
  },
  {
    id: "lead-04", submissionTime: "2025-09-11", submitter: "Phụ huynh",
    parentName: "Ngân", parentEmail: "luongthanhngan@gmail.com", parentPhone: "84941058388",
    studentName: "Danh Tạo", studentEmail: "danhtao@gmail.com", studentPhone: "84000000000",
    city: "Hà Nội", country: "Vietnam", gradeLevel: "Lớp 11", school: "The Olympia Schools",
    leadStatus: "S10 - Closed – Won", firstContact: "2025-09-11", lastContact: "2025-10-12",
  },
  {
    id: "lead-05", submissionTime: "2025-10-01", submitter: "Phụ huynh",
    parentName: "anh Tùng", parentEmail: "tung@gmail.com", parentPhone: "84983646428",
    studentName: "Đức Minh", studentEmail: "ducminh@gmail.com", studentPhone: "84000000000",
    city: "Hà Nội", country: "Vietnam", gradeLevel: "Lớp 11", school: "IB School",
    leadStatus: "S10 - Closed – Won",
  },
  {
    id: "lead-06", submissionTime: "2025-10-15", submitter: "Phụ huynh",
    parentName: "chị Hằng", parentEmail: "hang2@gmail.com", parentPhone: "84904469677",
    studentName: "Trần Hà Anh", studentEmail: "haanh@gmail.com", studentPhone: "84000000000",
    city: "Hà Nội", country: "Vietnam", gradeLevel: "Lớp 11", school: "IB School",
    leadStatus: "S10 - Closed – Won",
  },
  {
    id: "lead-07", submissionTime: "2025-11-01", submitter: "Phụ huynh",
    parentName: "chị Minh", parentEmail: "minh@gmail.com", parentPhone: "84000000000",
    studentName: "Emma", studentEmail: "emma@gmail.com", studentPhone: "84000000000",
    country: "Vietnam", gradeLevel: "Lớp 11", school: "International School",
    leadStatus: "S10 - Closed – Won",
  },
];

// ── Student detail for student page ──────────────────────────
export const MOCK_STUDENTS: Record<string, unknown> = {};
STUDENT_ROSTER.forEach((s) => {
  MOCK_STUDENTS[s.id] = {
    id: s.id,
    fullName: s.fullName,
    email: s.email,
    phone: s.phone,
    gradeLevel: s.gradeLevel,
    school: s.school,
    parents: s.parents,
    pipelineStages: [{ stage: "S10" }],
  };
});

// ── Activities ───────────────────────────────────────────────
export const MOCK_ACTIVITIES: Record<string, unknown[]> = {};
export const MOCK_MEETINGS: Record<string, unknown[]> = {};
export const MOCK_PROPOSALS: Record<string, unknown[]> = {};

// ── Search ──────────────────────────────────────────────────
export const MOCK_SEARCH_POOL = STUDENT_ROSTER.map((s) => ({
  id: s.id,
  fullName: s.fullName,
  email: s.email || "",
  parentName: s.parents[0]?.fullName || "",
  parentPhone: s.parents[0]?.phone || "",
  currentStage: "S10",
}));

// ── Lead stats for dashboard ────────────────────────────────
export const LEAD_STATS = {
  total: 114,
  won: 13,
  lostNotFit: 52,
  lostNoContact: 28,
  warmLead: 15,
  proposalSent: 3,
  proposalPending: 2,
  appointmentScheduled: 1,
};
