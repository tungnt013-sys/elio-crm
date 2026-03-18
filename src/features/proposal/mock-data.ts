import type { Student, PastCase, Diagnosis, Project, Deliverable, Phase, LoadMessage } from "./types";

export const MOCK_STUDENT: Student = {
  name: "Phạm Trung Hải",
  school: "Phổ thông Liên cấp Olympia",
  grade: "Lớp 11",
  counselor: "Nhữ An Lâm Đức",
  major: "Mechanical Engineering",
  targets: "Mỹ & Úc",
  gpa: "9.5 / 10",
  sat: "1400 → target 1500+",
  ielts: "7.5",
  budget: "~$50,000 total cost",
  activities: [
    "SEIA – Head of Finance",
    "MUN – member",
    "Musical – member",
    "CLB Công nghệ – member",
  ],
  notes: `Hải có nền tảng học thuật tốt nhưng profile ngoại khóa còn rời rạc, chưa có chiều sâu liên quan đến Engineering. SAT 1400 là điểm yếu lớn nhất nếu mục tiêu học bổng $50k+. Hải khá self-directed nhưng dễ mất động lực khi không có deadline cụ thể. Gia đình đang làm việc song song với Cristina Bain.`,
  referral: "IEG · Phụ huynh",
};

export const MOCK_PAST_CASES: PastCase[] = [
  { id: 1, label: "Trần Hoàng Việt — CS/Dev · Raffles Singapore", sim: 74 },
  { id: 2, label: "Dương Bảo Hân — Engineering · BVIS Lớp 9", sim: 69 },
  { id: 3, label: "Đặng Nguyên Vũ — Logistics/Data · Chuyên Sư Phạm", sim: 61 },
  { id: 4, label: "Phạm Minh Hiếu Châu — Business · Vinschool", sim: 53 },
];

export const MOCK_DIAGNOSIS: Diagnosis = {
  strengths: [
    "GPA 9.5 + IELTS 7.5 tạo nền học thuật vững — đủ điều kiện hầu hết trường US và Úc.",
    "Đang học Olympia — tín nhiệm cao với AOs Mỹ, AP track quen thuộc với các trường.",
    "Vai trò Head of Finance tại SEIA thể hiện cam kết và trách nhiệm đo được.",
    "Timeline còn 18 tháng — đủ thời gian xây dựng Signature Project có chiều sâu.",
  ],
  weaknesses: [
    "SAT 1400 tạo trần cứng cho merit scholarships trên $40k — rủi ro lớn nhất với target $50k.",
    "4 hoạt động nhưng không cái nào liên quan trực tiếp đến Mechanical Engineering.",
    "Chưa có deliverable cụ thể nào — tất cả ở mức tham gia, chưa tạo ra sản phẩm.",
    "Động lực không đều — cần milestone rõ ràng và check-in định kỳ.",
  ],
  narrative:
    "Một học sinh tư duy hệ thống — người quản lý tài chính cho sự kiện lớn nay muốn áp dụng cùng tư duy đó để thiết kế và tối ưu hóa các hệ thống vật lý trong Engineering.",
  risks: [
    "SAT phải đạt 1480+ trước T8/2026 — nếu không, chiến lược học bổng phải điều chỉnh toàn bộ.",
    "Cristina Bain đang dẫn reflection — cần biết chính xác phạm vi để tránh overlap narrative.",
    "Signature Project cần khởi động trước T6/2026 hoặc timeline Lớp 12 sẽ bị dồn nghiêm trọng.",
  ],
  gaps: [
    "Hải hứng thú phân ngành ME nào? (robotics, thermal, structural, manufacturing?)",
    "Gia đình có ngân sách cho hardware project (~2–5 triệu VND linh kiện) không?",
    "Phạm vi chính xác Cristina Bain đang phụ trách là gì?",
  ],
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: "a",
    src: "Past proposal",
    sc: "#7C3AED",
    sb: "#F5F3FF",
    name: "Air Quality Sentinel",
    concept:
      "Thiết kế và xây dựng thiết bị cảm biến đo CO₂/nhiệt/độ ẩm trong lớp học tại Olympia bằng Arduino. Dữ liệu phân tích qua dashboard và công bố thành báo cáo nghiên cứu về Environmental Engineering.",
    rationale:
      "Khai thác trực tiếp hứng thú hardware, phù hợp môi trường Olympia, và tạo deliverable portfolio rõ ràng — prototype + paper — trong vòng 10 tháng.",
    diff: "Medium",
    time: "6–8 giờ/tuần · 10 tháng",
    link: "ME trực tiếp — sensor systems & data analysis",
  },
  {
    id: "b",
    src: "Past proposal",
    sc: "#7C3AED",
    sb: "#F5F3FF",
    name: "Engineering Thinkers",
    concept:
      "Khởi xướng chương trình dạy tư duy kỹ thuật cơ bản cho học sinh lớp 6–8 tại Olympia, gắn với vai trò lãnh đạo CLB Công nghệ. Kết thúc bằng impact report và curriculum kit mở.",
    rationale:
      "Tận dụng vai trò sẵn có tại trường, không cần ngân sách lớn, và đặt Hải vào vị trí người tạo ra — phù hợp học sinh cần cấu trúc rõ để duy trì cam kết.",
    diff: "Medium",
    time: "4–5 giờ/tuần · 12 tháng",
    link: "ME gián tiếp — cần narrative bridge rõ trong bài luận",
  },
  {
    id: "c",
    src: "Web search",
    sc: "#0369A1",
    sb: "#F0F9FF",
    name: "Polygence Research Mentorship",
    concept:
      "Ghép cặp 1-1 với nghiên cứu sinh từ top US schools để thực hiện independent research 10 tuần, kết thúc bằng paper xuất bản trên Polygence Symposium of Rising Scholars.",
    rationale:
      "Bridge gap lớn nhất trong hồ sơ — chưa có research experience. Ít counselor VN biết đến; tạo signal học thuật mạnh mà activities hiện tại hoàn toàn thiếu.",
    diff: "High",
    time: "8–10 giờ/tuần · 10 tuần",
    link: "ME trực tiếp — topic được chọn trong field",
    prog: {
      name: "Polygence – Passion Project",
      url: "polygence.org",
      deadline: "Rolling enrollment",
      cost: "Need-based scholarship available",
    },
  },
];

export const MOCK_DELIVERABLES: Deliverable[] = [
  {
    label: "Arduino-based prototype",
    type: "Prototype",
    spec: "01 thiết bị đo CO₂/nhiệt/độ ẩm, hoạt động được",
    vis: "External",
    due: "T9/2026",
  },
  {
    label: "Research dashboard",
    type: "Digital",
    spec: "Web dashboard dữ liệu thực đo, public URL",
    vis: "External",
    due: "T10/2026",
  },
  {
    label: "Báo cáo nghiên cứu",
    type: "Report",
    spec: "~15 trang, dữ liệu Olympia, phân tích kết quả",
    vis: "Internal",
    due: "T11/2026",
  },
  {
    label: "Bài luận học thuật",
    type: "Paper",
    spec: "3,000 từ, chuẩn APA, Environmental Sensor Systems",
    vis: "External",
    due: "T12/2026",
  },
];

export const MOCK_PHASES: Phase[] = [
  {
    period: "T3–T5/2026",
    focus: "Nghiên cứu lý thuyết, chọn sensors, thiết kế sơ đồ mạch",
    ms: "Sơ đồ thiết kế hoàn chỉnh",
  },
  {
    period: "T6–T8/2026",
    focus: "Build prototype, thu thập dữ liệu thực tế tại Olympia",
    ms: "Working prototype + raw data",
  },
  {
    period: "T9–T10/2026",
    focus: "Phân tích dữ liệu, build dashboard, refine prototype",
    ms: "Dashboard + refined device",
  },
  {
    period: "T11–T12/2026",
    focus: "Viết báo cáo và bài luận học thuật",
    ms: "Báo cáo + paper nộp tạp chí",
  },
];

export const LOAD_MESSAGES: LoadMessage[] = [
  { msg: "Analyzing student profile…", sub: "Cross-referencing notes with CRM data" },
  { msg: "Searching past proposals & web…", sub: "Running 2 parallel searches" },
  { msg: "Generating deliverables…", sub: "Calibrating timeline and output specs" },
  { msg: "Assembling proposal…", sub: "Injecting sections and boilerplate" },
];
