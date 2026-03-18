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
export const MOCK_ACTIVITIES: Record<string, unknown[]> = {
  // ── Duy Dũng (G11, CS track) ──────────────────────────────
  "c-duydung": [
    { id: "a-dd-01", type: "CALL", direction: "outbound", content: "Gọi bố Anh Tú — trao đổi lộ trình SAT + IELTS Speaking. Bố đồng ý lịch ôn SAT 3 buổi/tuần, IELTS retake tháng 7.", createdAt: d("2026-03-15T10:30:00"), staff: { name: "Đức" } },
    { id: "a-dd-02", type: "EMAIL", direction: "outbound", content: "Gửi danh sách hackathon mùa hè 2026 cho Dũng. Đề xuất HackMIT hoặc TreeHacks nếu được nhận.", createdAt: d("2026-03-12T14:00:00"), staff: { name: "Đức" } },
    { id: "a-dd-03", type: "NOTE", direction: "outbound", content: "Stephen (mentor) báo Dũng đã hoàn thành project React portfolio. Code clean, có deploy trên Vercel. Cần thêm 1 project backend.", createdAt: d("2026-03-08T09:00:00"), staff: { name: "Đức" } },
    { id: "a-dd-04", type: "ZALO", direction: "inbound", content: "Bố nhắn hỏi về chi phí SAT tutoring riêng. Đã giải thích gói đã bao gồm.", createdAt: d("2026-03-01T16:20:00"), staff: { name: "Hằng" } },
    { id: "a-dd-05", type: "MEETING", direction: "outbound", content: "[Meeting] Monthly check-in: SAT diagnostic 1380, target 1500+. IELTS Speaking drill plan.", createdAt: d("2026-02-20T15:00:00"), staff: { name: "Đức" } },
    { id: "a-dd-06", type: "CALL", direction: "outbound", content: "Gọi Dũng nhắc nộp bài essay practice #3. Dũng nói sẽ nộp cuối tuần.", createdAt: d("2026-02-10T11:00:00"), staff: { name: "Đức" } },
    { id: "a-dd-07", type: "EMAIL", direction: "outbound", content: "Gửi danh sách internship contacts — 3 công ty tech ở HN. Chờ phản hồi từ CTO của TechViet.", createdAt: d("2026-01-25T10:00:00"), staff: { name: "Đức" } },
    { id: "a-dd-08", type: "NOTE", direction: "outbound", content: "Internship outreach: 5 emails sent, 0 replies yet. Sẽ follow up tuần sau. Backup plan: volunteer teaching code.", createdAt: d("2026-01-15T09:30:00"), staff: { name: "Đức" } },
  ],
  // ── Đức Minh (G11, bio/chem, Conrad Challenge) ─────────────
  "c-ducminh": [
    { id: "a-dm-01", type: "CALL", direction: "outbound", content: "Gọi bố anh Tùng — update SAT retake plan. Bố muốn con đạt 1550. Đã giải thích realistic target 1520-1540.", createdAt: d("2026-03-14T09:00:00"), staff: { name: "Đức" } },
    { id: "a-dm-02", type: "NOTE", direction: "outbound", content: "Conrad Challenge submission deadline T4. Team đã nộp video + slide deck. Kết quả tháng 5.", createdAt: d("2026-03-10T14:00:00"), staff: { name: "Đức" } },
    { id: "a-dm-03", type: "MEETING", direction: "outbound", content: "[Meeting] Research project review — đang viết literature review với mentor từ ĐHKHTN. Progress 60%.", createdAt: d("2026-03-01T10:00:00"), staff: { name: "Đức" } },
    { id: "a-dm-04", type: "ZALO", direction: "inbound", content: "Đức Minh gửi draft Extended Essay (Biology) — 3200 words. Cần review trước thứ 6.", createdAt: d("2026-02-18T20:15:00"), staff: { name: "Đức" } },
    { id: "a-dm-05", type: "EMAIL", direction: "outbound", content: "Gửi feedback chi tiết Extended Essay — structure OK, cần strengthen methodology section.", createdAt: d("2026-02-20T11:00:00"), staff: { name: "Đức" } },
    { id: "a-dm-06", type: "CALL", direction: "outbound", content: "Check-in SAT practice test #4: 1500. Math 790, R&W 710. Cần focus Reading.", createdAt: d("2026-02-05T16:00:00"), staff: { name: "Đức" } },
  ],
  // ── Hà Anh (G11, biochem/neuro, cousin of Đức Minh) ────────
  "c-haanh": [
    { id: "a-ha-01", type: "MEETING", direction: "outbound", content: "[Meeting] Research mentor matching — shortlisted 2 Fulbright PhDs in biochem (Dr. Linh, Dr. Huy). Hà Anh prefers neuroscience angle.", createdAt: d("2026-03-13T14:00:00"), staff: { name: "Đức" } },
    { id: "a-ha-02", type: "NOTE", direction: "outbound", content: "Hà Anh's disability outreach org — 30 volunteers, 4 monthly events. Strong narrative for application essays.", createdAt: d("2026-03-05T09:00:00"), staff: { name: "Đức" } },
    { id: "a-ha-03", type: "CALL", direction: "outbound", content: "Gọi mẹ chị Hằng — update lộ trình. Mẹ rất hài lòng, muốn biết thêm về research timeline. Giải thích 3-5 tháng.", createdAt: d("2026-02-25T10:30:00"), staff: { name: "Đức" } },
    { id: "a-ha-04", type: "EMAIL", direction: "outbound", content: "Gửi research proposal template + instructions cho Hà Anh. Deadline nộp draft: 15/3.", createdAt: d("2026-02-15T13:00:00"), staff: { name: "Đức" } },
    { id: "a-ha-05", type: "ZALO", direction: "inbound", content: "Hà Anh hỏi có nên thi AP Biology tháng 5 không. Đã khuyên nên thi — boost profile.", createdAt: d("2026-02-01T19:00:00"), staff: { name: "Đức" } },
  ],
  // ── Emma (G11, Psychology) ─────────────────────────────────
  "c-emma": [
    { id: "a-em-01", type: "MEETING", direction: "outbound", content: "[Meeting] Mentor intro: Phúc (UC San Diego, Psychology PhD). Matched on animal rights research angle. First session scheduled 20/3.", createdAt: d("2026-03-10T10:00:00"), staff: { name: "Đức" } },
    { id: "a-em-02", type: "ZALO", direction: "outbound", content: "Nhắn mẹ chị Minh (Messenger) — confirm lịch meeting tháng 3. Mẹ OK.", createdAt: d("2026-03-02T08:30:00"), staff: { name: "Đức" } },
    { id: "a-em-03", type: "NOTE", direction: "outbound", content: "Emma cần 1 extracurricular mạnh trước application season. Đề xuất: animal welfare volunteer program hoặc research paper.", createdAt: d("2026-02-20T14:00:00"), staff: { name: "Đức" } },
    { id: "a-em-04", type: "EMAIL", direction: "outbound", content: "Gửi UC system requirements + timeline cho Emma. Nhấn mạnh: UC apps due Nov, cần finalize school list by Aug.", createdAt: d("2026-02-05T11:00:00"), staff: { name: "Đức" } },
  ],
  // ── Danh Tạo (G11, Olympia, discipline issues) ─────────────
  "c-danhtao": [
    { id: "a-dt-01", type: "MEETING", direction: "outbound", content: "[Meeting] Post-Tết family meeting với bố mẹ + Hiếu. Realigned expectations — target top 50-80, not top 30. Bố đồng ý.", createdAt: d("2026-02-28T09:00:00"), staff: { name: "Đức" } },
    { id: "a-dt-02", type: "CALL", direction: "outbound", content: "Gọi mẹ chị Ngân (đang ở Manila) — báo cáo tuần. Danh Tạo vẫn chưa nộp assignment đúng hạn 2/4 tuần.", createdAt: d("2026-03-12T17:00:00"), staff: { name: "Đức" } },
    { id: "a-dt-03", type: "NOTE", direction: "outbound", content: "Meeting Olympia teachers: IB predicted grades at risk. Math HL dropping. Cần tutoring bổ sung.", createdAt: d("2026-03-05T10:00:00"), staff: { name: "Đức" } },
    { id: "a-dt-04", type: "ZALO", direction: "inbound", content: "Danh Tạo nhắn xin gia hạn bài tập study habits. Đã cho thêm 3 ngày nhưng cảnh báo đây là lần cuối.", createdAt: d("2026-02-20T21:00:00"), staff: { name: "Đức" } },
    { id: "a-dt-05", type: "CALL", direction: "outbound", content: "Gọi bố — trao đổi phương án tutoring IB Math HL. Bố sẽ arrange tutor riêng, cần Elio coordinate lịch.", createdAt: d("2026-02-10T10:00:00"), staff: { name: "Đức" } },
  ],
  // ── Trường Thịnh (Grad, Master apps) ───────────────────────
  "c-thinh": [
    { id: "a-tt-01", type: "EMAIL", direction: "outbound", content: "Gửi update: Northeastern đã submitted. NYU SPS — essay revision #2 done, submitting this week.", createdAt: d("2026-03-14T09:00:00"), staff: { name: "Phương" } },
    { id: "a-tt-02", type: "ZALO", direction: "outbound", content: "Nhắn nhóm chat gia đình (có mẹ) — nhắc Thịnh gửi official transcript. Không trả lời.", createdAt: d("2026-03-08T10:00:00"), staff: { name: "Phương" } },
    { id: "a-tt-03", type: "CALL", direction: "outbound", content: "Gọi mẹ chị Liên — mẹ sẽ nhắc con gửi transcript. Mẹ apologize vì con unresponsive.", createdAt: d("2026-03-10T11:30:00"), staff: { name: "Phương" } },
    { id: "a-tt-04", type: "NOTE", direction: "outbound", content: "Thịnh nộp transcript sau khi mẹ nhắc. Pattern: only responds when mom intervenes. Flag for future communications.", createdAt: d("2026-03-11T14:00:00"), staff: { name: "Phương" } },
    { id: "a-tt-05", type: "MEETING", direction: "outbound", content: "[Meeting] App status review: Northeastern ✓, NYU in progress, Columbia considering. Interview prep next month.", createdAt: d("2026-02-15T15:00:00"), staff: { name: "Phương" } },
  ],
  // ── Chiết (G9, Fund Bunch project) ─────────────────────────
  "c-triet": [
    { id: "a-ch-01", type: "MEETING", direction: "outbound", content: "[Meeting] Monthly session — Fund Bunch project update. 12 subscribers, 3 local charities onboarded. Preparing pitch for school assembly.", createdAt: d("2026-03-08T10:00:00"), staff: { name: "Đức" } },
    { id: "a-ch-02", type: "CALL", direction: "outbound", content: "Gọi bố anh Huynh — update tiến độ. Bố rất vui, hỏi về Wharton summer camp application timeline (deadline April).", createdAt: d("2026-03-01T09:00:00"), staff: { name: "Đức" } },
    { id: "a-ch-03", type: "NOTE", direction: "outbound", content: "Chiết viết draft Wharton summer camp essay — topic: micro-philanthropy. Quality surprising cho G9. Minor edits needed.", createdAt: d("2026-02-25T14:00:00"), staff: { name: "Đức" } },
    { id: "a-ch-04", type: "ZALO", direction: "inbound", content: "Bố gửi ảnh Chiết presenting Fund Bunch ở school — rất tự tin. Bố cảm ơn team.", createdAt: d("2026-02-15T18:00:00"), staff: { name: "Đức" } },
  ],
  // ── Nhật Minh (G11, all apps submitted) ────────────────────
  "c-nhatminh": [
    { id: "a-nm-01", type: "MEETING", direction: "outbound", content: "[Meeting] Interview prep session #1 — mock interview for Babson. Nhật Minh confident nhưng cần practice 'Why this school' answers.", createdAt: d("2026-03-11T14:00:00"), staff: { name: "Đức" } },
    { id: "a-nm-02", type: "CALL", direction: "outbound", content: "Gọi mẹ (luật sư) — confirm tất cả documents đã submitted. Còn thiếu certificate of finance từ 1 trường.", createdAt: d("2026-03-05T10:00:00"), staff: { name: "Đức" } },
    { id: "a-nm-03", type: "EMAIL", direction: "outbound", content: "Gửi interview prep guide + common questions cho Nhật Minh. Scheduled mock interview #2 for 18/3.", createdAt: d("2026-03-06T11:00:00"), staff: { name: "Đức" } },
  ],
  // ── Khôi Nguyên (G9, BVIS, S6 — proposal pending) ─────────
  "c-khoinguyen": [
    { id: "a-kn-01", type: "CALL", direction: "outbound", content: "Gọi mẹ Phương Thuỷ — follow up proposal đã gửi tháng 9. Mẹ nói đang cân nhắc, sẽ quyết định sau Tết.", createdAt: d("2026-03-15T10:00:00"), staff: { name: "Hằng" } },
    { id: "a-kn-02", type: "ZALO", direction: "outbound", content: "Nhắn mẹ nhắc lịch meeting tư vấn miễn phí. Mẹ confirm thứ 7 tuần sau.", createdAt: d("2026-03-01T09:00:00"), staff: { name: "Hằng" } },
    { id: "a-kn-03", type: "NOTE", direction: "outbound", content: "Gia đình high-income, con học BVIS. Mẹ concerned về cost vs value. Cần demo track record rõ ràng hơn trong meeting.", createdAt: d("2026-02-20T11:00:00"), staff: { name: "Hằng" } },
  ],
  // ── Bảo Đan (S5 — appointment scheduled) ───────────────────
  "c-baodan": [
    { id: "a-bd-01", type: "CALL", direction: "outbound", content: "Gọi mẹ chị Tâm — sắp xếp lịch meeting tư vấn với counselor. Confirm 20/3 lúc 10h sáng.", createdAt: d("2026-03-16T09:00:00"), staff: { name: "Hằng" } },
    { id: "a-bd-02", type: "ZALO", direction: "outbound", content: "Gửi brochure dịch vụ + case studies cho mẹ đọc trước meeting.", createdAt: d("2026-03-14T14:00:00"), staff: { name: "Hằng" } },
  ],
  // ── Hùng (Done — post-service) ─────────────────────────────
  "c-hung": [
    { id: "a-h-01", type: "CALL", direction: "outbound", content: "Follow-up call — mẹ Hằng Lê rất hài lòng. Thư viện community library đã khai trương. Mẹ muốn giới thiệu thêm bạn.", createdAt: d("2026-03-10T10:00:00"), staff: { name: "Đức" } },
    { id: "a-h-02", type: "NOTE", direction: "outbound", content: "Sent post-service survey. Mẹ responded: 5/5 satisfaction. Potential referral source — đã giới thiệu Tuệ Nhi.", createdAt: d("2026-02-20T09:00:00"), staff: { name: "Đức" } },
  ],
};

// ── Meetings ─────────────────────────────────────────────────
export const MOCK_MEETINGS: Record<string, unknown[]> = {
  "c-duydung": [
    {
      id: "m-dd-01", title: "Monthly Check-in — SAT + Portfolio", meetingDate: d("2026-03-15T15:00:00"),
      content: "Reviewed SAT diagnostic: 1380 (Math 740, R&W 640). Target: 1500+ by June.\n\nIELTS Speaking still at 6.0 — need dedicated coaching. Will arrange 2x/week speaking drills.\n\nStephen (mentor) confirmed Dũng's React portfolio is deployed. Next: build a Node.js backend project.\n\nNext Steps:\n- Register for SAT June sitting\n- IELTS Speaking coach — start by March 25\n- Begin backend project with Stephen by April 1\n- Follow up on tech internship contacts (3 pending)",
    },
    {
      id: "m-dd-02", title: "Internship Strategy Session", meetingDate: d("2026-02-20T15:00:00"),
      content: "Discussed internship strategy. Dũng needs tech internship for summer 2026.\n\nSent 5 cold emails to CTOs — 0 replies so far. Backup: volunteer teaching code at local NGO.\n\nNext Steps:\n- Follow up on 5 emails by Feb 28\n- Draft LinkedIn profile by March 5\n- Research NGO volunteer coding opportunities",
    },
  ],
  "c-ducminh": [
    {
      id: "m-dm-01", title: "Research Project + Conrad Challenge", meetingDate: d("2026-03-01T10:00:00"),
      content: "Research project with ĐHKHTN mentor: literature review 60% done. Target completion: April 15.\n\nConrad Challenge: video + slide deck submitted. Team of 4 students. Results in May.\n\nExtended Essay (Biology): 3200 words draft submitted. Structure OK but methodology section needs strengthening.\n\nNext Steps:\n- Complete literature review by April 15\n- Revise Extended Essay methodology section by March 20\n- SAT retake scheduled for May — practice tests every 2 weeks\n- Start college list research (bio/chem programs)",
    },
  ],
  "c-haanh": [
    {
      id: "m-ha-01", title: "Research Mentor Matching", meetingDate: d("2026-03-13T14:00:00"),
      content: "Shortlisted 2 Fulbright PhD candidates for research mentorship:\n- Dr. Linh (biochemistry, VNU) — available April\n- Dr. Huy (neuroscience, ĐHBK) — available May\n\nHà Anh prefers neuroscience angle for research. Will do initial call with Dr. Huy next week.\n\nDisability outreach org: 30 volunteers, 4 monthly events. Strong essay material.\n\nNext Steps:\n- Intro call with Dr. Huy — schedule by March 20\n- Submit research proposal draft by March 30\n- Register for AP Biology exam (May)\n- Start college essay brainstorming — disability org narrative",
    },
  ],
  "c-danhtao": [
    {
      id: "m-dt-01", title: "Family Realignment Meeting", meetingDate: d("2026-02-28T09:00:00"),
      content: "Present: Danh Tạo, bố, mẹ (video call from Manila), Hiếu, Đức.\n\nKey outcomes:\n- Realistic school target: top 50-80 (not top 30). Parents agreed.\n- IB predicted grades at risk — Math HL needs immediate tutoring.\n- Danh Tạo committed to daily study log shared via Zalo group.\n- Bố will arrange private Math HL tutor, Elio coordinates schedule.\n\nNext Steps:\n- Math HL tutor arranged by March 10\n- Daily study log starts March 1\n- Monthly progress meeting with Olympia teachers\n- Reassess school list in May based on IB predicted grades",
    },
  ],
  "c-thinh": [
    {
      id: "m-tt-01", title: "Application Status Review", meetingDate: d("2026-02-15T15:00:00"),
      content: "Northeastern: submitted ✓\nNYU SPS: essay revision #2 done, submitting this week.\nColumbia: still considering — need to finalize by March 1.\n\nInterview prep: scheduled for April. Will do 3 mock interviews.\n\nCommunication pattern: Thịnh only responds when mẹ intervenes. Going forward, always cc mẹ on important deadlines.\n\nNext Steps:\n- Submit NYU SPS application by Feb 22\n- Decide on Columbia by March 1\n- Start interview prep materials — send guide by March 5\n- Schedule mock interview #1 for April 1",
    },
  ],
  "c-triet": [
    {
      id: "m-ch-01", title: "Monthly Development Session", meetingDate: d("2026-03-08T10:00:00"),
      content: "Fund Bunch project update: 12 subscribers, 3 local charities onboarded. Planning school assembly pitch.\n\nWharton summer camp: essay draft on micro-philanthropy — quality impressive for G9. Minor edits:\n- Tighten intro paragraph\n- Add specific impact numbers\n- Conclude with future vision\n\nNext Steps:\n- Finalize Wharton essay by March 15\n- Submit Wharton application by April deadline\n- Fund Bunch: target 25 subscribers by May\n- Prepare school assembly presentation",
    },
  ],
  "c-nhatminh": [
    {
      id: "m-nm-01", title: "Interview Prep #1", meetingDate: d("2026-03-11T14:00:00"),
      content: "Mock interview for Babson College. Nhật Minh spoke confidently but:\n- 'Why Babson' answer was generic — needs school-specific research\n- Needs stronger examples for leadership question\n- Timing good: answered within 2 min per question\n\nAll applications submitted. Outstanding: certificate of finance from 1 school.\n\nNext Steps:\n- Research Babson programs deeply — rewrite 'Why Babson'\n- Prepare 3 STAR-format stories for behavioral questions\n- Mock interview #2 on March 18\n- Follow up on missing certificate of finance",
    },
  ],
  "c-emma": [
    {
      id: "m-em-01", title: "Mentor Introduction + Planning", meetingDate: d("2026-03-10T10:00:00"),
      content: "Introduced Emma to PhD mentor Phúc (UC San Diego, Psychology). Strong match on animal rights research angle.\n\nFirst mentoring session scheduled for March 20. Plan:\n- Month 1-2: literature review on animal cognition\n- Month 3-4: design small survey study\n- Month 5: write up findings\n\nExtracurricular gap: needs 1 strong activity before application season. Options:\n1. Animal welfare volunteer program (SPCA Vietnam)\n2. Research paper with Phúc\n\nNext Steps:\n- First session with Phúc on March 20\n- Research SPCA Vietnam volunteer program\n- Finalize UC school list by April\n- Start Common App essay brainstorming",
    },
  ],
};

// ── Proposals ────────────────────────────────────────────────
export const MOCK_PROPOSALS: Record<string, unknown[]> = {
  "c-duydung": [
    { id: "p-dd-01", proposalUrl: "https://docs.google.com/document/d/1a2b3c-duydung", quoteAmount: 386290080, quoteCurrency: "VND", isCustomQuote: false, sentAt: d("2025-10-05T10:00:00") },
  ],
  "c-ducminh": [
    { id: "p-dm-01", proposalUrl: "https://docs.google.com/document/d/1a2b3c-ducminh", quoteAmount: 258200000, quoteCurrency: "VND", isCustomQuote: false, sentAt: d("2025-11-20T09:00:00") },
  ],
  "c-haanh": [
    { id: "p-ha-01", proposalUrl: "https://docs.google.com/document/d/1a2b3c-haanh", quoteAmount: 258200000, quoteCurrency: "VND", isCustomQuote: false, sentAt: d("2025-12-18T14:00:00") },
  ],
  "c-danhtao": [
    { id: "p-dt-01", proposalUrl: "https://docs.google.com/document/d/1a2b3c-danhtao", quoteAmount: 258200000, quoteCurrency: "VND", isCustomQuote: false, sentAt: d("2025-09-25T11:00:00") },
  ],
  "c-emma": [
    { id: "p-em-01", proposalUrl: "https://docs.google.com/document/d/1a2b3c-emma", quoteAmount: 195200000, quoteCurrency: "VND", isCustomQuote: false, sentAt: d("2025-11-18T09:00:00") },
  ],
  "c-thinh": [
    { id: "p-tt-01", proposalUrl: "https://docs.google.com/document/d/1a2b3c-thinh", quoteAmount: 100000000, quoteCurrency: "VND", isCustomQuote: true, sentAt: d("2025-11-15T10:00:00") },
  ],
  "c-triet": [
    { id: "p-ch-01", proposalUrl: "https://docs.google.com/document/d/1a2b3c-triet", quoteAmount: 270000000, quoteCurrency: "VND", isCustomQuote: false, sentAt: d("2025-11-28T09:00:00") },
  ],
  "c-nhatminh": [
    { id: "p-nm-01", proposalUrl: "https://docs.google.com/document/d/1a2b3c-nhatminh", quoteAmount: 195200000, quoteCurrency: "VND", isCustomQuote: false, sentAt: d("2025-12-01T10:00:00") },
  ],
  "c-khoinguyen": [
    { id: "p-kn-01", proposalUrl: "https://docs.google.com/document/d/1a2b3c-khoinguyen", quoteAmount: 270000000, quoteCurrency: "VND", isCustomQuote: false, sentAt: d("2025-09-10T14:00:00") },
  ],
};

// ── Seed touchpoints (localStorage fallback for student detail page) ─────
export const SEED_TOUCHPOINTS: Record<string, { id: string; date: string; type: string; with: string; summary: string; addedBy: string }[]> = {
  "c-duydung": [
    { id: "tp-dd-01", date: "2026-03-15", type: "call", with: "parent", summary: "Gọi bố Anh Tú — trao đổi lộ trình SAT + IELTS Speaking. Bố đồng ý lịch ôn SAT 3 buổi/tuần, IELTS retake tháng 7.", addedBy: "Đức" },
    { id: "tp-dd-02", date: "2026-03-12", type: "email", with: "student", summary: "Gửi danh sách hackathon mùa hè 2026. Đề xuất HackMIT hoặc TreeHacks.", addedBy: "Đức" },
    { id: "tp-dd-03", date: "2026-03-08", type: "note", with: "student", summary: "Stephen (mentor) báo Dũng hoàn thành React portfolio. Deploy Vercel. Cần thêm 1 project backend.", addedBy: "Đức" },
    { id: "tp-dd-04", date: "2026-03-01", type: "message", with: "parent", summary: "Bố nhắn hỏi chi phí SAT tutoring riêng. Đã giải thích gói đã bao gồm.", addedBy: "Hằng" },
    { id: "tp-dd-05", date: "2026-02-20", type: "meeting", with: "student", summary: "Monthly check-in: SAT diagnostic 1380, target 1500+. IELTS Speaking drill plan.", addedBy: "Đức" },
    { id: "tp-dd-06", date: "2026-02-10", type: "call", with: "student", summary: "Nhắc nộp essay practice #3. Dũng nói sẽ nộp cuối tuần.", addedBy: "Đức" },
    { id: "tp-dd-07", date: "2026-01-25", type: "email", with: "student", summary: "Gửi danh sách internship contacts — 3 công ty tech ở HN.", addedBy: "Đức" },
  ],
  "c-ducminh": [
    { id: "tp-dm-01", date: "2026-03-14", type: "call", with: "parent", summary: "Gọi bố anh Tùng — update SAT retake plan. Bố muốn con 1550. Realistic target 1520-1540.", addedBy: "Đức" },
    { id: "tp-dm-02", date: "2026-03-10", type: "note", with: "student", summary: "Conrad Challenge submission deadline T4. Team đã nộp video + slide deck. Kết quả tháng 5.", addedBy: "Đức" },
    { id: "tp-dm-03", date: "2026-03-01", type: "meeting", with: "student", summary: "Research project review — literature review với mentor ĐHKHTN. Progress 60%.", addedBy: "Đức" },
    { id: "tp-dm-04", date: "2026-02-18", type: "message", with: "student", summary: "Đức Minh gửi draft Extended Essay (Biology) — 3200 words. Cần review trước thứ 6.", addedBy: "Đức" },
    { id: "tp-dm-05", date: "2026-02-05", type: "call", with: "student", summary: "SAT practice test #4: 1500. Math 790, R&W 710. Focus Reading.", addedBy: "Đức" },
  ],
  "c-haanh": [
    { id: "tp-ha-01", date: "2026-03-13", type: "meeting", with: "student", summary: "Research mentor matching — shortlisted 2 Fulbright PhDs in biochem. Hà Anh prefers neuroscience.", addedBy: "Đức" },
    { id: "tp-ha-02", date: "2026-03-05", type: "note", with: "student", summary: "Disability outreach org — 30 volunteers, 4 monthly events. Strong narrative for essays.", addedBy: "Đức" },
    { id: "tp-ha-03", date: "2026-02-25", type: "call", with: "parent", summary: "Gọi mẹ chị Hằng — update lộ trình. Mẹ rất hài lòng.", addedBy: "Đức" },
    { id: "tp-ha-04", date: "2026-02-15", type: "email", with: "student", summary: "Gửi research proposal template + instructions. Deadline nộp draft: 15/3.", addedBy: "Đức" },
  ],
  "c-emma": [
    { id: "tp-em-01", date: "2026-03-10", type: "meeting", with: "student", summary: "Mentor intro: Phúc (UC San Diego, Psychology PhD). Animal rights research. First session 20/3.", addedBy: "Đức" },
    { id: "tp-em-02", date: "2026-03-02", type: "message", with: "parent", summary: "Nhắn mẹ chị Minh — confirm lịch meeting tháng 3. Mẹ OK.", addedBy: "Đức" },
    { id: "tp-em-03", date: "2026-02-20", type: "note", with: "student", summary: "Cần 1 extracurricular mạnh trước application season. Animal welfare volunteer hoặc research paper.", addedBy: "Đức" },
  ],
  "c-danhtao": [
    { id: "tp-dt-01", date: "2026-02-28", type: "meeting", with: "both", summary: "Family meeting với bố mẹ + Hiếu. Realistic target: top 50-80. Bố đồng ý.", addedBy: "Đức" },
    { id: "tp-dt-02", date: "2026-03-12", type: "call", with: "parent", summary: "Gọi mẹ chị Ngân (Manila) — Danh Tạo chưa nộp assignment đúng hạn 2/4 tuần.", addedBy: "Đức" },
    { id: "tp-dt-03", date: "2026-03-05", type: "note", with: "student", summary: "Meeting Olympia teachers: IB predicted grades at risk. Math HL dropping.", addedBy: "Đức" },
    { id: "tp-dt-04", date: "2026-02-20", type: "message", with: "student", summary: "Danh Tạo xin gia hạn bài tập. Cho thêm 3 ngày, cảnh báo lần cuối.", addedBy: "Đức" },
    { id: "tp-dt-05", date: "2026-02-10", type: "call", with: "parent", summary: "Gọi bố — tutoring IB Math HL. Bố sẽ arrange tutor riêng.", addedBy: "Đức" },
  ],
  "c-thinh": [
    { id: "tp-tt-01", date: "2026-03-14", type: "email", with: "student", summary: "Northeastern submitted. NYU SPS essay revision #2 done, submitting this week.", addedBy: "Phương" },
    { id: "tp-tt-02", date: "2026-03-10", type: "call", with: "parent", summary: "Gọi mẹ chị Liên — mẹ sẽ nhắc con gửi transcript.", addedBy: "Phương" },
    { id: "tp-tt-03", date: "2026-03-11", type: "note", with: "student", summary: "Pattern: only responds when mẹ intervenes. Always cc mẹ on deadlines.", addedBy: "Phương" },
    { id: "tp-tt-04", date: "2026-02-15", type: "meeting", with: "student", summary: "App status: Northeastern ✓, NYU in progress, Columbia considering.", addedBy: "Phương" },
  ],
  "c-triet": [
    { id: "tp-ch-01", date: "2026-03-08", type: "meeting", with: "student", summary: "Fund Bunch update: 12 subscribers, 3 charities onboarded. School assembly pitch.", addedBy: "Đức" },
    { id: "tp-ch-02", date: "2026-03-01", type: "call", with: "parent", summary: "Bố anh Huynh — update tiến độ. Hỏi Wharton summer camp timeline.", addedBy: "Đức" },
    { id: "tp-ch-03", date: "2026-02-25", type: "note", with: "student", summary: "Wharton essay draft on micro-philanthropy. Quality surprising cho G9.", addedBy: "Đức" },
  ],
  "c-nhatminh": [
    { id: "tp-nm-01", date: "2026-03-11", type: "meeting", with: "student", summary: "Mock interview #1 for Babson. Confident nhưng cần practice 'Why this school'.", addedBy: "Đức" },
    { id: "tp-nm-02", date: "2026-03-05", type: "call", with: "parent", summary: "Mẹ luật sư — tất cả documents submitted. Còn thiếu certificate of finance.", addedBy: "Đức" },
  ],
  "c-khoinguyen": [
    { id: "tp-kn-01", date: "2026-03-15", type: "call", with: "parent", summary: "Follow up proposal — mẹ Phương Thuỷ đang cân nhắc.", addedBy: "Hằng" },
    { id: "tp-kn-02", date: "2026-03-01", type: "message", with: "parent", summary: "Nhắn mẹ nhắc lịch meeting tư vấn miễn phí. Confirm thứ 7 tuần sau.", addedBy: "Hằng" },
  ],
  "c-hung": [
    { id: "tp-h-01", date: "2026-03-10", type: "call", with: "parent", summary: "Mẹ Hằng Lê rất hài lòng. Thư viện khai trương. Muốn giới thiệu thêm bạn.", addedBy: "Đức" },
    { id: "tp-h-02", date: "2026-02-20", type: "note", with: "parent", summary: "Post-service survey: 5/5 satisfaction. Đã giới thiệu Tuệ Nhi.", addedBy: "Đức" },
  ],
  "c-tuenhi": [
    { id: "tp-tn-01", date: "2026-03-12", type: "meeting", with: "student", summary: "Monthly check-in — self-discovery progress good. Explored university admin career path.", addedBy: "Đức" },
    { id: "tp-tn-02", date: "2026-03-01", type: "call", with: "parent", summary: "Mẹ gọi Đức — worried about follow-through. Đức reassured.", addedBy: "Đức" },
  ],
};

// ── Seed game plans ──────────────────────────────────────────
export const SEED_GAME_PLANS: Record<string, { keyNotes: string; items: { id: string; item: string; deadline: string; byWho: string[]; done: boolean }[]; flags: string[] }> = {
  "c-duydung": {
    keyNotes: "Duy Dũng is targeting CS and Engineering programs at universities in Singapore (NUS, NTU) and select US schools. His academic profile is strong (top 5% class rank, Math olympiad participation) but his extracurricular portfolio lacks any professional or technical experience beyond academics — critical for CS applications at his target schools. We identified a summer internship at a local tech company as the highest-impact next step. IELTS Speaking (6.0) is below his 7.0 target, so retake is planned for July with 2x/week drill coaching. SAT diagnostic at 1380, targeting 1500+ by June.",
    items: [
      { id: "gp-dd-01", item: "Register for SAT June sitting", deadline: "2026-04-01", byWho: ["Student"], done: false },
      { id: "gp-dd-02", item: "Start IELTS Speaking coaching (2x/week)", deadline: "2026-03-25", byWho: ["Elio"], done: false },
      { id: "gp-dd-03", item: "Begin backend project with mentor Stephen", deadline: "2026-04-01", byWho: ["Student"], done: false },
      { id: "gp-dd-04", item: "Follow up on 3 tech internship contacts", deadline: "2026-03-20", byWho: ["Đức"], done: false },
      { id: "gp-dd-05", item: "Complete React portfolio (deployed on Vercel)", deadline: "2026-03-08", byWho: ["Student"], done: true },
    ],
    flags: ["Needs tech internship ASAP"],
  },
  "c-ducminh": {
    keyNotes: "Đức Minh is one of the strongest academic profiles — IB Extended Essay in biology, Conrad Challenge participant, research with ĐHKHTN mentor. SAT at 1500 (Math 790, R&W 710), targeting 1520-1540 on retake. Overconfidence humbled after SAT score came below cousin Hà Anh's — now more focused.",
    items: [
      { id: "gp-dm-01", item: "Complete literature review for research project", deadline: "2026-04-15", byWho: ["Student"], done: false },
      { id: "gp-dm-02", item: "Revise Extended Essay methodology section", deadline: "2026-03-20", byWho: ["Student"], done: false },
      { id: "gp-dm-03", item: "SAT retake practice tests (every 2 weeks)", deadline: "2026-03-15", byWho: ["Đức"], done: true },
      { id: "gp-dm-04", item: "Start college list research (bio/chem programs)", deadline: "2026-04-01", byWho: ["Đức"], done: false },
    ],
    flags: [],
  },
  "c-haanh": {
    keyNotes: "Strong SAT, studying IELTS. Focus on biochemistry/biotech/neuroscience. Runs volunteer org supporting children with intellectual disabilities (30 volunteers). Lacks research experience and competitive awards — both gaps to close. Tùng has Fulbright PhD contacts for 3-5 month research ($1,000, 10-15 hrs/week).",
    items: [
      { id: "gp-ha-01", item: "Intro call with Dr. Huy (neuroscience mentor)", deadline: "2026-03-20", byWho: ["Đức"], done: false },
      { id: "gp-ha-02", item: "Submit research proposal draft", deadline: "2026-03-30", byWho: ["Student"], done: false },
      { id: "gp-ha-03", item: "Register for AP Biology exam", deadline: "2026-03-15", byWho: ["Student"], done: true },
      { id: "gp-ha-04", item: "Start college essay brainstorming", deadline: "2026-04-15", byWho: ["Đức"], done: false },
    ],
    flags: [],
  },
  "c-danhtao": {
    keyNotes: "IB at Olympia. Not academically gifted enough to thrive in IB with extracurriculars — needs habit-building. Predicted grades at risk, Math HL dropping. Family meeting realigned expectations to top 50-80. Mother in Manila weekly, father runs business. Both high-earning.",
    items: [
      { id: "gp-dt-01", item: "Arrange private Math HL tutor", deadline: "2026-03-10", byWho: ["Parent"], done: true },
      { id: "gp-dt-02", item: "Daily study log via Zalo group", deadline: "2026-03-01", byWho: ["Student"], done: false },
      { id: "gp-dt-03", item: "Monthly progress meeting with Olympia teachers", deadline: "2026-04-05", byWho: ["Đức"], done: false },
      { id: "gp-dt-04", item: "Reassess school list based on IB predicted grades", deadline: "2026-05-15", byWho: ["Đức"], done: false },
    ],
    flags: ["Academic performance + discipline"],
  },
  "c-triet": {
    keyNotes: "Grade 9, #1 in cohort. Finance + entrepreneurship. Fund Bunch: $1 subscription model for micro-charities. Applying to Wharton summer camp. Easiest case — pure character development. Strong rapport with father.",
    items: [
      { id: "gp-ch-01", item: "Finalize Wharton summer camp essay", deadline: "2026-03-15", byWho: ["Student"], done: false },
      { id: "gp-ch-02", item: "Submit Wharton application", deadline: "2026-04-15", byWho: ["Đức"], done: false },
      { id: "gp-ch-03", item: "Fund Bunch: target 25 subscribers", deadline: "2026-05-01", byWho: ["Student"], done: false },
    ],
    flags: [],
  },
};

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
