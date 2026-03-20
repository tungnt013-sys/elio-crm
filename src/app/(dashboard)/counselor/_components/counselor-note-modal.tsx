"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { StudentDetail, Meeting, CounselorNote } from "@/lib/mock-data";
import { buildProposalSections, downloadProposalDocx, type ProposalSection } from "@/lib/generate-proposal";

// ── Mock AI generators ────────────────────────────────────────────────────────

type AISection = "keyNotes" | "strength" | "areaForImprovement" | "academicPlan" | "keyActivities" | "profileStrategy";

function mockAIContent(section: AISection, student: StudentDetail, currentKeyNotes: string): string {
  const name = student.fullName.split(" ").pop() ?? student.fullName;
  const info = student.studentInfo || "";
  const notes = currentKeyNotes || student.keyNotes || "";
  const school = student.school ?? student.level ?? "trường hiện tại";
  const issues = student.issues ?? [];

  switch (section) {
    case "keyNotes": {
      const base = info
        ? `${info}`
        : `${name} đang trong giai đoạn chuẩn bị hành trình vào đại học — một bước ngoặt lớn không chỉ về học thuật, mà còn về cách em nhìn nhận bản thân và tương lai.`;
      const extra =
        notes && notes !== info
          ? `\n\nĐiểm cần lưu ý thêm từ các buổi làm việc: ${notes}`
          : "";
      return `${base}${extra}`;
    }

    case "strength": {
      const positives: string[] = [];
      if (/compli|follow.*advi|does whatever/i.test(info))
        positives.push(
          `${name} có khả năng lắng nghe và tiếp thu rất tốt — điều này không phải ai cũng có. Trong một quá trình dài và nhiều lúc áp lực, tính cách này sẽ giúp em vượt qua những giai đoạn khó hơn nhiều bạn đồng trang lứa`
        );
      if (/GPA|grade|academic|IB|A-level/i.test(info))
        positives.push(
          "Nền tảng học thuật của em khá vững — đây là điều kiện cần thiết để tự tin nhắm đến những trường có yêu cầu cao"
        );
      if (/mentor|intern|research|project|hackathon|competition/i.test(info))
        positives.push(
          "Em đã bắt đầu tích lũy kinh nghiệm thực tế sớm hơn nhiều bạn đồng trang lứa — đây là lợi thế không nhỏ trong mắt hội đồng tuyển sinh"
        );
      if (/self.direct|independent|consistent|proactive/i.test(info))
        positives.push(
          "Em có tính tự giác và khả năng tự định hướng tốt — phẩm chất mà các trường đại học luôn tìm kiếm ở sinh viên của họ"
        );
      if (positives.length === 0)
        positives.push(
          `Sau thời gian làm việc cùng ${name}, mình nhận ra em có sự chân thành và nghiêm túc đáng trân trọng trong cách tiếp cận hành trình này`
        );
      if (positives.length < 2)
        positives.push(
          `Gia đình và ${name} phối hợp tốt với đội ngũ Elio — điều này tạo ra nền tảng tin tưởng để cùng nhau đi xa hơn`
        );

      return `Những điều mình trân trọng ở ${name} (${school}):\n\n${positives.map((p) => `• ${p}`).join("\n")}`;
    }

    case "areaForImprovement": {
      const areas: string[] = [];
      if (issues.length > 0) issues.forEach((issue) => areas.push(issue));
      if (/unresponsive|slow|deadline|delay/i.test(info))
        areas.push(
          `Tốc độ phản hồi và chủ động cập nhật tiến độ — khi em tự mình nhìn thấy được roadmap phía trước, việc duy trì momentum sẽ trở nên tự nhiên hơn nhiều`
        );
      if (/narrative|story|essay|why/i.test(notes + info) && areas.length < 3)
        areas.push(
          `Câu chuyện cá nhân trong bài luận — em chưa cần phải có câu trả lời ngay, nhưng cần bắt đầu tự hỏi: "Điều gì trong cuộc sống của mình thực sự có ý nghĩa với mình?"`
        );
      if (/speaking|IELTS|english|communication/i.test(notes + info))
        areas.push(
          `Tiếng Anh giao tiếp, đặc biệt Speaking — đây không chỉ là điểm thi, mà là kỹ năng em sẽ cần mỗi ngày khi học ở môi trường quốc tế`
        );
      if (areas.length === 0) {
        areas.push(
          `Quản lý thời gian và chủ động với deadline — không phải vì em chậm, mà vì giai đoạn nộp hồ sơ sẽ đòi hỏi rất nhiều năng lượng cùng lúc`
        );
        areas.push(
          `Câu hỏi "Why this school" — nghiên cứu sâu về từng trường để viết những lý do thực sự thuyết phục, không phải những gì ai cũng viết`
        );
      }

      return `Những khoảng trống ${name} và mình cần cùng nhau lấp đầy:\n\n${areas.map((a) => `• ${a}`).join("\n")}`;
    }

    case "academicPlan": {
      const ieltsMatch = notes.match(/IELTS[:\s]+([0-9.]+)/i);
      const satMatch = notes.match(/SAT[:\s]+([0-9]+)/i);
      const currentIELTS = ieltsMatch ? ieltsMatch[1] : null;
      const currentSAT = satMatch ? satMatch[1] : null;

      const ieltsLine = currentIELTS
        ? `• IELTS ${currentIELTS} — đang trên đúng hướng, mục tiêu ≥ 7.5. Nếu Speaking còn thấp hơn các band khác, đây là nơi cần tập trung trước.`
        : "• IELTS: chưa có điểm gốc — nên thi thử sớm để biết mình đang ở đâu, từ đó lên lịch ôn thực tế hơn. Mục tiêu: ≥ 7.5.";
      const satLine = currentSAT
        ? `• SAT ${currentSAT} — tiếp tục ôn đều, mục tiêu ≥ 1500. Ưu tiên Math và Evidence-Based Reading.`
        : "• SAT: chưa có điểm — đặt lịch thi lần đầu trong học kỳ tới. Mục tiêu: ≥ 1500.";

      return `Kế hoạch học thuật — ${name} (${school}):\n\nMình muốn cùng ${name} xây dựng một kế hoạch ôn luyện thực tế, không quá tải nhưng đủ để tiến bộ đều đặn:\n\n${ieltsLine}\n${satLine}\n• GPA: duy trì ổn định, đặc biệt ở những môn liên quan đến ngành em dự định theo đuổi — đây là tín hiệu rõ ràng nhất về academic fit với trường.\n\nGhi chú: Mình sẽ giới thiệu đối tác ôn luyện nếu ${name} cần hỗ trợ thêm ngoài giờ làm việc với Elio.`;
    }

    case "keyActivities": {
      const activities: string[] = [];
      if (/hackathon/i.test(info))
        activities.push(
          `Phát triển hackathon project thành sản phẩm có câu chuyện rõ ràng — cách tốt nhất để cho hội đồng tuyển sinh thấy ${name} không chỉ có ý tưởng mà còn biết biến ý tưởng thành hiện thực`
        );
      if (/intern/i.test(info))
        activities.push(
          "Hoàn thiện internship và ghi lại những gì em học được — không phải resume line, mà là chất liệu thực để viết bài luận"
        );
      if (/research/i.test(info))
        activities.push(
          "Tham gia Research 101 của Elio — cơ hội để em nghiên cứu đúng nghĩa và publish trên SPARK Academic Journal"
        );
      if (/mentor/i.test(info))
        activities.push(
          "Tận dụng mạng lưới mentor hiện tại — không chỉ để hỏi về ngành nghề, mà để hiểu mình có thực sự phù hợp với con đường đó không"
        );
      if (activities.length === 0) {
        activities.push(
          `Tham gia Research 101 của Elio — đây là cách tốt nhất để ${name} xây dựng credibility học thuật theo chiều sâu, không chỉ chiều rộng`
        );
        activities.push(
          "Chọn 1 dự án cá nhân gắn với điều em thực sự quan tâm — không phải để ghi vào hồ sơ, mà để hiểu bản thân mình hơn"
        );
        activities.push(
          "Tìm 1 cơ hội internship hoặc shadowing liên quan đến ngành — dù ngắn, dù nhỏ, cũng đủ để tạo góc nhìn thực tế"
        );
      }
      activities.push(
        "Duy trì ít nhất 1 hoạt động em làm liên tục qua nhiều năm — sự kiên định bao giờ cũng thuyết phục hơn danh sách dài mà thiếu chiều sâu"
      );

      return `Hoạt động mình đề xuất cho ${name}:\n\nMình không muốn ${name} chạy theo một checklist ngoại khóa. Mục tiêu thực sự là tìm 2–3 thứ em thực sự đầu tư, và để chúng kể câu chuyện về em một cách tự nhiên.\n\n${activities.map((a) => `• ${a}`).join("\n")}`;
    }

    case "profileStrategy": {
      const targetLine =
        /top [0-9]+/i.test(info) ? info.match(/targeting .+?\./i)?.[0] ?? "" : "";
      const majorLine =
        /wants? ([A-Z][a-z]+)/i.test(info)
          ? info.match(/wants? (.+?)[.,]/i)?.[1] ?? ""
          : "";

      return `Chiến lược hồ sơ tổng thể — ${name}:\n\nĐiều mình tin tưởng sau nhiều năm làm việc với học sinh: hồ sơ tốt nhất không phải là hồ sơ "hoàn hảo" theo công thức — mà là hồ sơ trung thực, nhất quán, và thể hiện đúng con người thật của ${name}.\n\nĐịnh hướng trường: ${targetLine || `Sẽ thảo luận cụ thể sau khi hiểu rõ mục tiêu và điều kiện tài chính của gia đình — danh sách tốt là danh sách phù hợp, không phải danh sách "nghe có vẻ uy tín"`}\nNgành dự định: ${majorLine || "Cần làm rõ thêm cùng nhau — đây là quyết định quan trọng, mình không muốn vội"}\n\nCác bước tiếp theo:\n• Brainstorm Common App essay: tìm câu chuyện thật của ${name} — không phải câu chuyện em nghĩ người ta muốn nghe.\n• Xin thư giới thiệu từ người thực sự hiểu em — không nhất thiết phải là thầy/cô dạy môn khó nhất.\n• Xây dựng danh sách 10–15 trường: Reach, Match, và Safety theo đúng nghĩa.\n\nGhi nhớ: Hành trình vào đại học chỉ là khởi đầu. Điều Elio thực sự hướng tới là ${name} bước vào năm nhất với sự tự tin và sự hiểu biết về bản thân — không chỉ với một offer letter.`;
    }
  }
}

// ── Pure proposal section generators ─────────────────────────────────────────

function genSection1(fullName: string, info: string, issues: string[]): string {
  const name = fullName.split(" ").pop() ?? fullName;
  const strengths: string[] = [];
  if (/top 5%|top5%|rank/i.test(info))
    strengths.push(`Học lực của ${name} nằm trong nhóm dẫn đầu — đây là tín hiệu rõ ràng về năng lực và sự nghiêm túc`);
  if (/olympiad|competition|award|prize/i.test(info))
    strengths.push("Có thành tích nổi bật trong các kỳ thi học thuật — điểm cộng đáng kể trong mắt hội đồng tuyển sinh");
  if (/compli|receptive|follow/i.test(info))
    strengths.push(`${name} lắng nghe và tiếp thu tốt — trong một hành trình dài và nhiều thử thách, đây là phẩm chất thực sự quý giá`);
  if (/GPA|IB|A-level|academic/i.test(info))
    strengths.push("Nền tảng học thuật vững chắc, có khả năng duy trì phong độ ổn định qua nhiều giai đoạn");
  if (strengths.length === 0)
    strengths.push(`${name} mang đến cho quá trình này sự chân thành và cam kết đáng tin cậy — điều mà không thể dạy được`);

  let content = `Sau thời gian đồng hành cùng ${name}, Elio nhận thấy những điểm mạnh thực sự của em:\n\n${strengths.map(s => `• ${s}`).join("\n")}\n\n`;
  if (issues.length > 0) {
    content += `Đồng thời, để hành trình này đạt kết quả tốt nhất, có một số điểm chúng ta cần cùng nhau tập trung:\n\n${issues.map(i => `• ${i}`).join("\n")}\n\n`;
  }
  content += `CHIẾN LƯỢC CỦA ELIO CHO ${fullName.toUpperCase()}:\n\nElio tin rằng con đường vào một trường đại học tốt không chỉ là một quy trình tuyển sinh — đó là hành trình để ${name} khám phá bản thân, xây dựng chính kiến, và chuẩn bị bước ra thế giới với đủ tự tin.\n\nPhương pháp của chúng tôi là xây dựng hồ sơ có chiều sâu và nhất quán: chọn 2–3 hoạt động ${name} thực sự đam mê, đầu tư bài bản, và kết nối tất cả thành một câu chuyện trung thực — câu chuyện mà hội đồng tuyển sinh sẽ nhớ mãi sau khi đọc xong.\n\nMục tiêu cuối cùng: ${name} bước vào đại học với sự tự tin rằng mình được nhận vào vì chính mình — không phải vì một phiên bản được tô vẽ để vừa lòng hội đồng.`;
  return content;
}

function genSection2a(fullName: string, info: string, school: string, keyNotes: string): string {
  const name = fullName.split(" ").pop() ?? fullName;
  const ieltsMatch = (keyNotes + info).match(/IELTS[:\s]+([0-9.]+)/i);
  const satMatch = (keyNotes + info).match(/SAT[:\s]+([0-9]+)/i);
  const ielts = ieltsMatch
    ? `IELTS ${ieltsMatch[1]} — đang trên đúng hướng, mục tiêu ≥ 7.5. Nếu Speaking còn thấp hơn các band khác, đó là nơi cần tập trung đầu tiên`
    : "IELTS: chưa có điểm gốc — ưu tiên thi thử trong học kỳ này để biết mình đang ở đâu. Mục tiêu: ≥ 7.5";
  const sat = satMatch
    ? `SAT ${satMatch[1]} — tiếp tục ôn đều 2–3 buổi/tuần, mục tiêu ≥ 1500`
    : "SAT: chưa có điểm — đặt lịch thi lần đầu, không cần vội nhưng không nên để quá muộn. Mục tiêu: ≥ 1500";
  const acts: string[] = [];
  if (/hackathon/i.test(info))
    acts.push(`Hoàn thiện hackathon project thành sản phẩm có câu chuyện rõ ràng — đây sẽ là một trong những điểm nhấn mạnh nhất trong hồ sơ của ${name}`);
  if (/intern/i.test(info))
    acts.push("Kết thúc internship và viết reflection thật thành thật — những gì em học được, những gì khiến em bất ngờ, và điều đó thay đổi cái nhìn của em về ngành như thế nào");
  if (/research/i.test(info))
    acts.push("Tham gia Research 101 của Elio — cơ hội để em trải nghiệm nghiên cứu thực và publish bài trên SPARK Academic Journal");
  if (acts.length === 0) {
    acts.push(`Tham gia Research 101 của Elio — xây dựng credibility học thuật theo chiều sâu, không chỉ chiều rộng`);
    acts.push(`Tìm 1 dự án cá nhân ${name} thực sự muốn làm — không phải để ghi vào CV, mà để có thứ thực sự để kể trong bài luận`);
  }
  acts.push("Duy trì ít nhất 1 hoạt động em đã bắt đầu và cam kết với nó — sự kiên định có giá trị hơn nhiều so với việc thử nhiều thứ rồi bỏ");
  const sc = school || "trường hiện tại";
  return `LỚP 11 — GIAI ĐOẠN XÂY NỀN VÀ TÌM TIẾNG NÓI RIÊNG\n\nĐây là năm quan trọng nhất — không phải vì nó quyết định tất cả, mà vì những gì ${name} xây dựng trong năm này sẽ trở thành nguyên liệu cho toàn bộ hồ sơ.\n\n1. Học thuật & Chuẩn hóa — ${name} (${sc})\n• ${ielts}.\n• ${sat}.\n• GPA: tiếp tục duy trì, đặc biệt ở những môn liên quan đến ngành em dự định — đây là tín hiệu rõ ràng nhất về academic fit với trường.\n\n2. Hoạt động trọng điểm\n${acts.map(a => `• ${a}`).join("\n")}\n\n3. Hồ sơ & Danh sách trường\n• Bắt đầu brainstorm Common App essay — chưa cần viết, chỉ cần hỏi: "Câu chuyện nào của mình thực sự là của mình?"\n• Liên hệ 2 giáo viên thân thiết để xin thư giới thiệu — người hiểu em, không nhất thiết là người dạy môn khó nhất.\n• Phác thảo danh sách 10–15 trường cùng counselor: Reach (4–5), Match (4–5), Safety (2–3).`;
}

function genSection2b(): string {
  return `LỚP 12 — GIAI ĐOẠN KẾT THÚC VÀ BƯỚC QUA NGƯỠNG CỬA\n\nNếu Lớp 11 là xây nền, thì Lớp 12 là lúc toàn bộ công trình được hoàn thiện. Elio sẽ đồng hành sát nhất trong giai đoạn này — để học sinh và gia đình không cảm thấy một mình.\n\n1. Hoàn thiện & Nộp hồ sơ (Tháng 8–11)\n• Tháng 8: Rà soát tổng thể — bài luận, resume, bảng điểm, thư giới thiệu. Mọi thứ phải nhất quán và kể cùng một câu chuyện.\n• Tháng 9: Hoàn thiện bài luận chính và supplemental essays. Mỗi bài là cơ hội để hội đồng thấy một góc khác của học sinh — đừng lặp lại những gì đã có trong resume.\n• Tháng 11: Nộp EA/ED cho các trường ưu tiên — và thở. Đây là cột mốc quan trọng nhất của cả hành trình.\n\n2. Nộp hồ sơ RD (Tháng 12–2)\n• Tháng 12: Cập nhật bảng điểm kỳ I — một số trường rất để ý đến xu hướng điểm số cuối cấp.\n• Tháng 1–2: Nộp các trường RD còn lại. Elio sẽ theo dõi cùng và xử lý bất kỳ yêu cầu bổ sung nào từ phía trường.\n\n3. Hậu xét tuyển & Quyết định (Tháng 1–5)\n• Phỏng vấn: Elio tổ chức mock interview 2–3 lần — không phải để "luyện câu trả lời đúng", mà để học sinh tự tin kể câu chuyện của mình bằng tiếng Anh.\n• Hồ sơ tài chính: hỗ trợ điền CSS Profile, FAFSA, ISFAA — các hạn chót khác nhau theo từng trường, Elio sẽ nhắc và hướng dẫn từng bước.\n• Phân tích offer: so sánh học bổng, gói hỗ trợ tài chính, và các yếu tố phi tài chính — quyết định chọn trường là quyết định của cả gia đình, không chỉ là con số.\n\n4. Chuẩn bị hành trang (Tháng 5–8)\n• Hướng dẫn chứng minh tài chính, phỏng vấn visa, và các thủ tục nhập học.\n• Workshop Pre-Departure của Elio: không chỉ về văn hóa Mỹ — mà về cách sống tự lập, quản lý tiền, và giữ kết nối với gia đình từ xa.\n• Đăng ký ký túc xá, student portal, và lịch học kỳ đầu — để ngày đầu tiên bước vào khuôn viên trường, học sinh đã biết mình đang ở đâu và cần làm gì.`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface NoteState {
  birthYear: string;
  school: string;
  intendedMajor: string;
  targetSchools: string;
  servicePeriod: string;
  keyNotes: string;
  strength: string;
  areaForImprovement: string;
  academicPlan: string;
  keyActivities: string;
  profileStrategy: string;
}

const ALL_FIELDS: (keyof NoteState)[] = [
  "birthYear", "school", "intendedMajor", "targetSchools", "servicePeriod",
  "keyNotes", "strength", "areaForImprovement",
  "academicPlan", "keyActivities", "profileStrategy",
];

const TEXTAREA_FIELDS: AISection[] = [
  "keyNotes", "strength", "areaForImprovement",
  "academicPlan", "keyActivities", "profileStrategy",
];

interface Props {
  student: StudentDetail;
  meeting: Meeting;
  initialKeyNotes?: string;
  initialNote?: Partial<CounselorNote>;
  onSave: (note: CounselorNote, updatedKeyNotes: string) => void;
  onClose: () => void;
}

// ── NoteSection ───────────────────────────────────────────────────────────────

function NoteSection({ label, value, onChange, placeholder, generating, onGenerate, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  generating: boolean; onGenerate: () => void; rows?: number;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink-3)", textTransform: "uppercase" }}>{label}</span>
        <button
          onClick={onGenerate} disabled={generating}
          style={{
            display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
            padding: "3px 10px", borderRadius: 6, border: "none",
            background: generating ? "var(--bg-2)" : "var(--accent-soft)",
            color: generating ? "var(--ink-3)" : "var(--accent)",
            cursor: generating ? "not-allowed" : "pointer", transition: "background 120ms, color 120ms",
          }}
          onMouseEnter={(e) => { if (!generating) { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "var(--bg)"; } }}
          onMouseLeave={(e) => { if (!generating) { e.currentTarget.style.background = "var(--accent-soft)"; e.currentTarget.style.color = "var(--accent)"; } }}
        >
          {generating ? <><SpinIcon /> Generating…</> : <><StarIcon /> Generate</>}
        </button>
      </div>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        rows={rows} className="field"
        style={{ width: "100%", resize: "vertical", fontSize: 13, lineHeight: 1.6, fontFamily: "inherit" }}
      />
    </div>
  );
}

function SpinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" style={{ animation: "cnm-spin 0.9s linear infinite" }}>
      <circle cx="5" cy="5" r="3.8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 6" fill="none" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
      <path d="M4.5 0.5L5.4 2.85L7.9 3.05L6.0 4.75L6.6 7.25L4.5 6.0L2.4 7.25L3.0 4.75L1.1 3.05L3.6 2.85L4.5 0.5Z" />
    </svg>
  );
}

// ── Proposal Preview ──────────────────────────────────────────────────────────

function ProposalPreview({ sections, onChange, onDownload, onBack, downloading, onGenerateSection, generatingSection, onFinalize, finalizing }: {
  sections: ProposalSection[];
  onChange: (id: string, content: string) => void;
  onDownload: () => void;
  onBack: () => void;
  downloading: boolean;
  onGenerateSection: (aiKey: "section1" | "section2a" | "section2b", sectionId: string) => void;
  generatingSection: string | null;
  onFinalize: () => void;
  finalizing: boolean;
}) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [bodyFontSize, setBodyFontSize] = useState(11);

  // ── Inline format helpers ─────────────────────────────────────────────────
  const applyInlineFormat = (type: "bold" | "italic" | "underline") => {
    const el = activeSectionId
      ? (document.querySelector(`textarea[data-sid="${activeSectionId}"]`) as HTMLTextAreaElement | null)
      : null;
    if (!el) return;
    const { selectionStart: ss, selectionEnd: se, value } = el;
    const selected = value.slice(ss, se);
    if (!selected) return;
    const markers = { bold: "**", italic: "*", underline: "_" };
    const m = markers[type];
    const newVal = value.slice(0, ss) + m + selected + m + value.slice(se);
    onChange(activeSectionId!, newVal);
  };

  const updateTableCell = (sectionId: string, rowIdx: number, colIdx: number, value: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section?.tableData) return;
    const newData = section.tableData.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => (ci === colIdx ? value : cell)) : [...row]
    );
    onChange(sectionId, JSON.stringify(newData));
  };

  // ── Light-mode paper palette (always white regardless of app dark mode) ──────
  const p = {
    bg:       "#E4E4E4",
    surface:  "#FFFFFF",
    ink:      "#1A1A1A",
    inkMed:   "#4A5568",
    inkLight: "#8A96A3",
    line:     "#E8ECF0",
    brand:    "#173F36",
    rowAlt:   "#F4F8F6",
    rule:     "#C8D4CE",
  };

  // ── Per-page splitting ────────────────────────────────────────────────────
  const pages: ProposalSection[][] = [];
  let cur: ProposalSection[] = [];
  sections.forEach((s) => {
    if (s.type === "page-break") { pages.push(cur); cur = []; }
    else cur.push(s);
  });
  if (cur.length > 0) pages.push(cur);

  // ── Letterhead ────────────────────────────────────────────────────────────
  const Letterhead = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, marginBottom: 24, borderBottom: `1px solid ${p.line}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/elio-logo.png" alt="Elio Education" style={{ height: 18, width: "auto" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/elio-icon.png" alt="" style={{ height: 22, width: 22, opacity: 0.7 }} />
    </div>
  );

  // ── Per-page footer ───────────────────────────────────────────────────────
  const PaperFooter = ({ page }: { page: number }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 36, paddingTop: 10, borderTop: `1px solid ${p.rule}` }}>
      <span style={{ fontSize: 9.5, fontStyle: "italic", color: p.inkLight, letterSpacing: "0.02em" }}>Một điểm đến, mọi bước đồng hành</span>
      <span style={{ fontSize: 9.5, color: p.inkLight }}>{page}</span>
    </div>
  );

  // ── Inline markdown parser ────────────────────────────────────────────────
  const parseInline = (text: string): React.ReactNode => {
    const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(_{1}(.+?)_{1})/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = re.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      if (match[1]) parts.push(<strong key={key++}>{match[2]}</strong>);
      else if (match[3]) parts.push(<em key={key++}>{match[4]}</em>);
      else if (match[5]) parts.push(<u key={key++}>{match[6]}</u>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length === 0 ? text : parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  // ── Rich-text body renderer ───────────────────────────────────────────────
  const bodyFont = "'Be Vietnam Pro', sans-serif";
  const renderBodyContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} style={{ height: 8 }} />;
      if (/^─{4,}/.test(trimmed)) return (
        <div key={i} style={{ borderTop: `1px solid ${p.rule}`, margin: "10px 0" }} />
      );
      // Numbered sub-heading: "1. Tiêu đề", "2. Nội dung"  →  Heading 2: 11px Medium
      if (/^\d+\.\s+\S/.test(trimmed)) return (
        <div key={i} style={{ fontSize: 11, fontWeight: 500, fontFamily: bodyFont, color: p.ink, marginTop: 14, marginBottom: 3, lineHeight: 1.4 }}>{parseInline(line)}</div>
      );
      // Short all-caps-ish line (section banner like "LỚP 11 – TĂNG TỐC…")  →  Heading 2: 11px Medium
      const hasLower = /[a-zàáâãèéêìíòóôõùúăđĩũơư]/.test(trimmed);
      if (!hasLower && trimmed.length < 70 && !trimmed.startsWith("•")) return (
        <div key={i} style={{ fontSize: 11, fontWeight: 500, fontFamily: bodyFont, color: p.inkMed, marginTop: 16, marginBottom: 4, letterSpacing: "0.04em" }}>{line}</div>
      );
      // Bullet  →  Body: bodyFontSize Regular
      if (trimmed.startsWith("• ")) return (
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 3, alignItems: "flex-start" }}>
          <span style={{ color: p.brand, fontSize: bodyFontSize, lineHeight: 1.65, flexShrink: 0 }}>•</span>
          <span style={{ fontSize: bodyFontSize, lineHeight: 1.65, color: p.ink, fontFamily: bodyFont, fontWeight: 400 }}>{parseInline(trimmed.slice(2))}</span>
        </div>
      );
      return <p key={i} style={{ fontSize: bodyFontSize, lineHeight: 1.65, color: p.ink, margin: "0 0 5px", fontFamily: bodyFont, fontWeight: 400 }}>{parseInline(line)}</p>;
    });
  };

  // ── Section renderer ──────────────────────────────────────────────────────
  const renderSection = (s: ProposalSection) => {
    if (s.type === "divider") return (
      <div key={s.id} style={{ borderTop: `1px solid ${p.line}`, margin: "18px 0 20px" }} />
    );

    if (s.type === "title") return (
      <div key={s.id} style={{ fontSize: 24, fontWeight: 800, color: p.brand, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4, marginTop: 8, lineHeight: 1.2 }}>
        {s.content}
      </div>
    );

    if (s.type === "subtitle") {
      if (s.editable && activeSectionId === s.id) {
        return (
          <input
            key={s.id}
            autoFocus
            value={s.content}
            onChange={(e) => onChange(s.id, e.target.value)}
            onBlur={() => setActiveSectionId(null)}
            style={{ fontSize: 20, fontWeight: 700, color: p.brand, marginBottom: 20, fontFamily: "'Be Vietnam Pro', sans-serif", border: `1.5px solid ${p.brand}`, borderRadius: 4, padding: "4px 8px", background: "transparent", outline: "none", width: "100%" }}
          />
        );
      }
      return (
        <div key={s.id} onClick={() => s.editable && setActiveSectionId(s.id)} style={{ fontSize: 20, fontWeight: 700, color: p.brand, marginBottom: 20, fontFamily: "'Be Vietnam Pro', sans-serif", cursor: s.editable ? "text" : "default", lineHeight: 1.25 }}>
          {s.content}
        </div>
      );
    }

    if (s.type === "info") {
      const ci = s.content.indexOf(":");
      const label = ci >= 0 ? s.content.slice(0, ci + 1) : "";
      const value = ci >= 0 ? s.content.slice(ci + 1) : s.content;
      return (
        <div key={s.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0 12px", marginBottom: 7, alignItems: "baseline" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: p.inkLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label.replace(":", "")}</span>
          {s.editable ? (
            <input value={s.content.slice(ci + 1).trimStart()} onChange={(e) => onChange(s.id, `${label} ${e.target.value}`)}
              style={{ fontSize: 14, border: "none", borderBottom: `1px solid ${p.line}`, padding: "2px 0", background: "transparent", color: p.ink, outline: "none", fontFamily: "inherit", width: "100%" }} />
          ) : (
            <span style={{ fontSize: 14, color: p.ink }}>{value}</span>
          )}
        </div>
      );
    }

    if (s.type === "h2") return (
      <div key={s.id} style={{ marginBottom: 16, marginTop: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 500, fontFamily: "'Be Vietnam Pro', sans-serif", color: p.brand, lineHeight: 1.2, marginBottom: 10 }}>
          {s.content.replace(/^[IVX]+\.\s*/i, "")}
        </div>
        <div style={{ height: 1, background: p.brand, opacity: 0.2 }} />
      </div>
    );

    // ── Editable body with AI generate button ─────────────────────────────
    if (s.type === "body" && s.editable && s.aiKey) {
      const isGen = generatingSection === s.id;
      const isActive = activeSectionId === s.id;

      if (isActive || isGen) {
        return (
          <div key={s.id} style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
            <textarea
              data-sid={s.id}
              value={s.content}
              onChange={(e) => onChange(s.id, e.target.value)}
              onFocus={() => setActiveSectionId(s.id)}
              autoFocus={isActive}
              style={{
                flex: 1, width: "100%", minHeight: 540, fontSize: bodyFontSize, lineHeight: 1.85,
                fontFamily: "'Be Vietnam Pro', sans-serif", resize: "none",
                border: `1.5px solid ${p.brand}`, borderRadius: 4,
                padding: "14px 16px", paddingBottom: 44,
                background: isGen ? "#FAFCFB" : "transparent",
                color: isGen ? p.inkLight : p.ink, outline: "none",
              }}
            />
            <button
              onClick={() => onGenerateSection(s.aiKey!, s.id)} disabled={isGen}
              style={{
                position: "absolute", bottom: 10, right: 10,
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 10.5, fontWeight: 600, padding: "4px 10px",
                borderRadius: 5, border: `1px solid ${isGen ? p.line : p.brand}`,
                background: isGen ? p.surface : p.brand,
                color: isGen ? p.inkLight : "#fff",
                cursor: isGen ? "not-allowed" : "pointer",
              }}
            >
              {isGen ? <><SpinIcon /> Generating…</> : <><StarIcon /> Generate with AI</>}
            </button>
          </div>
        );
      }

      // ── Read mode: rendered rich text, click to edit ─────────────────────
      return (
        <div
          key={s.id}
          onClick={() => setActiveSectionId(s.id)}
          style={{ flex: 1, cursor: "text", position: "relative", minHeight: 480, paddingBottom: 40 }}
        >
          {renderBodyContent(s.content)}
          <button
            onClick={(e) => { e.stopPropagation(); onGenerateSection(s.aiKey!, s.id); }}
            style={{
              position: "absolute", bottom: 4, right: 0,
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 10.5, fontWeight: 600, padding: "4px 10px",
              borderRadius: 5, border: `1px solid ${p.brand}`,
              background: "transparent", color: p.brand,
              cursor: "pointer",
            }}
          >
            <StarIcon /> Generate with AI
          </button>
        </div>
      );
    }

    if (s.type === "body") return (
      <div key={s.id} style={{ marginBottom: 12 }}>{renderBodyContent(s.content)}</div>
    );

    if (s.type === "closing") {
      const isActive = activeSectionId === s.id;
      if (s.editable && isActive) {
        return (
          <textarea
            key={s.id}
            data-sid={s.id}
            value={s.content}
            onChange={(e) => onChange(s.id, e.target.value)}
            onFocus={() => setActiveSectionId(s.id)}
            autoFocus
            style={{
              width: "100%", minHeight: 320, fontSize: bodyFontSize, lineHeight: 1.85,
              fontFamily: "'Be Vietnam Pro', sans-serif", resize: "none",
              border: `1.5px solid ${p.brand}`, borderRadius: 4,
              padding: "14px 16px", background: "transparent", color: p.ink, outline: "none",
            }}
          />
        );
      }
      return (
        <div key={s.id} onClick={() => s.editable && setActiveSectionId(s.id)} style={{ padding: "8px 0", cursor: s.editable ? "text" : "default" }}>
          {renderBodyContent(s.content)}
        </div>
      );
    }

    if (s.type === "table" && s.tableData) return (
      <table key={s.id} style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, marginBottom: 10, marginTop: 4 }}>
        <thead>
          <tr>{s.tableData[0].map((cell, ci) => (
            <th key={ci} style={{ background: p.brand, color: "#fff", padding: "6px 10px", textAlign: "left", fontWeight: 600, fontSize: 9.5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {cell}
            </th>
          ))}</tr>
        </thead>
        <tbody>
          {s.tableData.slice(1).map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 1 ? p.rowAlt : "transparent" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "5px 10px", borderBottom: `1px solid ${p.line}`, color: ci === 0 ? p.ink : p.inkMed, fontWeight: ci === 0 ? 600 : 400 }}>
                  {s.editable ? (
                    <input value={cell} onChange={(e) => updateTableCell(s.id, ri + 1, ci, e.target.value)}
                      style={{ width: "100%", fontSize: 10.5, border: "none", background: "transparent", padding: 0, outline: "none", color: "inherit", fontFamily: "inherit", fontWeight: "inherit" }} />
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );

    return null;
  };

  // ── Sidebar toolbar ────────────────────────────────────────────────────────
  const SidebarBtn = ({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) => (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
        background: "none", border: `1px solid ${p.line}`, borderRadius: 6,
        color: activeSectionId ? p.inkMed : p.inkLight,
        cursor: activeSectionId ? "pointer" : "not-allowed",
        fontSize: 13, fontWeight: 700, transition: "all 120ms",
      }}
      onMouseEnter={(e) => { if (activeSectionId) { e.currentTarget.style.background = p.brand; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = p.brand; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = activeSectionId ? p.inkMed : p.inkLight; e.currentTarget.style.borderColor = p.line; }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", background: p.bg }}>
      {/* ── Pages area ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px 48px" }}>
        {pages.map((pageSections, pi) => (
          <div key={pi} style={{
            width: 620, minHeight: 877,
            margin: "0 auto 28px",
            background: p.surface, borderRadius: 2,
            padding: "44px 56px 40px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07)",
            color: p.ink,
            display: "flex", flexDirection: "column",
          }}>
            <Letterhead />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {pageSections.map(renderSection)}
            </div>
            <PaperFooter page={pi + 1} />
          </div>
        ))}

        {/* Sticky action bar */}
        <div style={{ position: "sticky", bottom: 0, padding: "14px 0 0", display: "flex", justifyContent: "center", gap: 10 }}>
          <button className="btn btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>← Back</button>
          <button className="btn btn-ghost" onClick={onDownload} disabled={downloading}
            style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: downloading ? "not-allowed" : "pointer" }}>
            {downloading ? <><SpinIcon /> Generating…</> : "Download .docx"}
          </button>
          <button className="btn" onClick={onFinalize} disabled={finalizing || downloading}
            style={{ fontSize: 13, fontWeight: 700, background: finalizing ? "var(--bg-2)" : "var(--accent)", color: finalizing ? "var(--ink-3)" : "var(--bg)", border: "none", display: "flex", alignItems: "center", gap: 6, cursor: (finalizing || downloading) ? "not-allowed" : "pointer" }}>
            {finalizing ? <><SpinIcon /> Saving…</> : "✓ Finalize & Save"}
          </button>
        </div>
      </div>

      {/* ── Formatting sidebar ── */}
      <div style={{
        width: 52, flexShrink: 0,
        borderLeft: `1px solid ${p.line}`,
        background: p.surface,
        display: "flex", flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        gap: 8,
      }}>
        {/* Bold */}
        <SidebarBtn title="Bold (wraps selection with **)" onClick={() => applyInlineFormat("bold")}>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em" }}>B</span>
        </SidebarBtn>

        {/* Italic */}
        <SidebarBtn title="Italic (wraps selection with *)" onClick={() => applyInlineFormat("italic")}>
          <span style={{ fontStyle: "italic", fontSize: 14 }}>I</span>
        </SidebarBtn>

        {/* Underline */}
        <SidebarBtn title="Underline (wraps selection with _)" onClick={() => applyInlineFormat("underline")}>
          <span style={{ textDecoration: "underline", fontSize: 14 }}>U</span>
        </SidebarBtn>

        <div style={{ height: 1, background: p.line, width: 30, margin: "4px 0" }} />

        {/* Font size decrease */}
        <SidebarBtn title="Decrease font size" onClick={() => setBodyFontSize(s => Math.max(9, s - 1))}>
          <span style={{ fontSize: 11, fontWeight: 600 }}>A−</span>
        </SidebarBtn>

        {/* Font size increase */}
        <SidebarBtn title="Increase font size" onClick={() => setBodyFontSize(s => Math.min(16, s + 1))}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>A+</span>
        </SidebarBtn>

        <div style={{ flex: 1 }} />
        {/* Active indicator */}
        <div style={{ width: 6, height: 6, borderRadius: 99, background: activeSectionId ? p.brand : p.line, margin: "0 auto" }} title={activeSectionId ? "Section active" : "Click a text area to activate"} />
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function CounselorNoteModal({ student, meeting, initialKeyNotes, initialNote, onSave, onClose }: Props) {
  const [note, setNote] = useState<NoteState>({
    birthYear: initialNote?.birthYear ?? "",
    school: initialNote?.school ?? student.school ?? "",
    intendedMajor: initialNote?.intendedMajor ?? "",
    targetSchools: initialNote?.targetSchools ?? "",
    servicePeriod: initialNote?.servicePeriod ?? "",
    keyNotes: initialNote?.keyNotes ?? initialKeyNotes ?? student.keyNotes ?? "",
    strength: initialNote?.strength ?? "",
    areaForImprovement: initialNote?.areaForImprovement ?? "",
    academicPlan: initialNote?.academicPlan ?? "",
    keyActivities: initialNote?.keyActivities ?? "",
    profileStrategy: initialNote?.profileStrategy ?? "",
  });

  const [generating, setGenerating] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [proposalSections, setProposalSections] = useState<ProposalSection[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const setField = (field: keyof NoteState) => (value: string) =>
    setNote((prev) => ({ ...prev, [field]: value }));

  const generate = (section: AISection) => {
    if (generating) return;
    setGenerating(section);
    setTimeout(() => {
      const content = mockAIContent(section, student, note.keyNotes);
      setNote((prev) => ({ ...prev, [section]: content }));
      setGenerating(null);
    }, 1800);
  };

  const filledCount = ALL_FIELDS.filter((f) => note[f].trim().length > 0).length;
  const allFilled = filledCount === ALL_FIELDS.length;

  const buildFull = useCallback((): CounselorNote => ({
    meetingId: meeting.id,
    studentId: meeting.studentId,
    ...note,
    report: "",
    updatedAt: new Date().toISOString(),
  }), [meeting, note]);

  const handleSave = () => { onSave(buildFull(), note.keyNotes); };

  // ── Build section1 and section2 text from note fields ─────────────────────
  const buildSection1 = (n: NoteState) => [
    n.strength ? `Điểm mạnh:\n${n.strength}` : "",
    n.areaForImprovement ? `\nĐiểm cần phát triển:\n${n.areaForImprovement}` : "",
    n.keyNotes ? `\nTổng quan:\n${n.keyNotes}` : "",
  ].filter(Boolean).join("").trim()
    || `Phương pháp Elio: Xây dựng hồ sơ có chiều sâu, gắn kết tất cả hoạt động và bài luận vào một narrative nhất quán.\n\nMục tiêu: Hồ sơ thuyết phục cả về học thuật, cá nhân, và tầm nhìn nghề nghiệp — giúp tăng cơ hội vào trường mục tiêu và học bổng.`;

  const buildSection2a = (n: NoteState) => [
    "LỚP 11 – TĂNG TỐC VÀ HOÀN THIỆN\n\n",
    n.academicPlan   ? `1. Học thuật & Chuẩn hóa\n${n.academicPlan}\n`   : "1. Học thuật & Chuẩn hóa\nXây dựng kế hoạch ôn luyện SAT/IELTS phù hợp, duy trì GPA ổn định.\n",
    n.keyActivities  ? `\n2. Hoạt động trọng điểm\n${n.keyActivities}\n`  : "\n2. Hoạt động trọng điểm\nTriển khai dự án cá nhân và tham gia các hoạt động ngoại khóa có chiều sâu.\n",
    n.profileStrategy ? `\n3. Hồ sơ & Chọn trường\n${n.profileStrategy}` : "\n3. Hồ sơ & Chọn trường\nXây dựng danh sách trường và bắt đầu brainstorm bài luận.",
  ].join("").trim();

  const buildSection2b = (_n: NoteState) => [
    "LỚP 12 – NỘP HỒ SƠ VÀ CHUẨN BỊ NHẬP HỌC\n\n",
    "1. Hoàn thiện & Nộp hồ sơ (Tháng 8–11)\nMục tiêu: Nộp EA/ED (tháng 10–11) và RD (tháng 1–2).\n\n• Tháng 8: Rà soát toàn bộ hồ sơ (bài luận, resume, bảng điểm, thư giới thiệu).\n• Tháng 9: Hoàn thiện và cập nhật luận chính + luận phụ với thông tin mới nhất.\n• Tháng 11: Nộp EA/ED cho các trường ưu tiên; theo dõi xác nhận từ trường.\n\n",
    "2. Nộp hồ sơ RD (Tháng 12–2)\n• Tháng 12: Cập nhật bảng điểm kỳ I, chuẩn bị bổ sung theo yêu cầu từng trường.\n• Tháng 1–2: Nộp RD; xác nhận phí nộp và theo dõi trạng thái hồ sơ.\n\n",
    "3. Hậu xét tuyển (Tháng 1–4)\n• Luyện phỏng vấn với mentor Elio (mock interview 2–3 lần).\n• Hoàn thiện hồ sơ tài chính (CSS Profile, ISFAA, FAFSA nếu cần).\n• Gửi bổ sung thành tích hoặc giải thưởng mới (update letter).\n\n",
    "4. Quyết định nhập học (Tháng 4–5)\n• Phân tích thư mời nhập học, gói hỗ trợ tài chính, học bổng.\n• Thảo luận học sinh – phụ huynh – counselor để chọn trường phù hợp nhất.\n\n",
    "5. Visa & Chuẩn bị hành trang (Tháng 5–8)\n• Hướng dẫn chứng minh tài chính, đặt lịch phỏng vấn visa, chuẩn bị hồ sơ.\n• Workshop Pre-Departure của Elio: văn hóa Mỹ, quản lý tài chính, an toàn và sức khỏe.\n• Đăng ký ký túc xá, kích hoạt student portal, đăng ký lớp học kỳ đầu.",
  ].join("").trim();

  // ── Claude API helper ──────────────────────────────────────────────────────
  const generateViaAPI = async (aiKey: "section1" | "section2a" | "section2b"): Promise<string> => {
    const res = await fetch("/api/generate/section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionType: aiKey,
        fullName: student.fullName,
        studentInfo: student.studentInfo || "",
        issues: student.issues ?? [],
        school: note.school || student.school || "",
        keyNotes: note.keyNotes,
        intendedMajor: note.intendedMajor,
      }),
    });
    if (!res.ok) throw new Error("Generation API failed");
    const data = await res.json();
    return data.content as string;
  };

  // ── In-preview AI section generators ──────────────────────────────────────
  const handleGenerateSection = async (aiKey: "section1" | "section2a" | "section2b", sectionId: string) => {
    if (generatingSection) return;
    setGeneratingSection(sectionId);
    try {
      const content = await generateViaAPI(aiKey);
      setProposalSections(prev => prev.map(s => s.id === sectionId ? { ...s, content } : s));
    } catch {
      // Fallback to mock if API fails
      let content = "";
      if (aiKey === "section1")  content = genSection1(student.fullName, student.studentInfo || "", student.issues ?? []);
      if (aiKey === "section2a") content = genSection2a(student.fullName, student.studentInfo || "", note.school || student.school || "", note.keyNotes);
      if (aiKey === "section2b") content = genSection2b();
      setProposalSections(prev => prev.map(s => s.id === sectionId ? { ...s, content } : s));
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleCreateProposal = async () => {
    onSave(buildFull(), note.keyNotes);
    // Show preview immediately with loading placeholders, then fill in AI content
    const placeholderSections = buildProposalSections({
      studentName: student.fullName,
      birthYear: note.birthYear,
      school: note.school,
      intendedMajor: note.intendedMajor,
      targetSchools: note.targetSchools,
      servicePeriod: note.servicePeriod,
      section1: "Đang tạo nội dung…",
      section2a: "Đang tạo nội dung…",
      section2b: "Đang tạo nội dung…",
    });
    setProposalSections(placeholderSections);
    setStep("preview");

    // Generate all three sections in parallel via Claude API
    const keys: ("section1" | "section2a" | "section2b")[] = ["section1", "section2a", "section2b"];
    await Promise.all(keys.map(async (aiKey) => {
      try {
        const content = await generateViaAPI(aiKey);
        setProposalSections(prev => prev.map(s => s.aiKey === aiKey ? { ...s, content } : s));
      } catch {
        const fallback =
          aiKey === "section1" ? genSection1(student.fullName, student.studentInfo || "", student.issues ?? []) :
          aiKey === "section2a" ? genSection2a(student.fullName, student.studentInfo || "", note.school || student.school || "", note.keyNotes) :
          genSection2b();
        setProposalSections(prev => prev.map(s => s.aiKey === aiKey ? { ...s, content: fallback } : s));
      }
    }));
  };

  const handleSectionChange = (id: string, content: string) => {
    setProposalSections((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        // Table data encoded as JSON
        if (s.type === "table" && content.startsWith("[")) {
          try {
            return { ...s, tableData: JSON.parse(content) };
          } catch { return s; }
        }
        return { ...s, content };
      })
    );
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadProposalDocx(proposalSections, student.fullName);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      // Extract the three AI-generated sections by aiKey
      const aiSections = (["section1", "section2a", "section2b"] as const).flatMap((key) => {
        const s = proposalSections.find((p) => p.aiKey === key);
        if (!s || !s.content.trim()) return [];
        return [{
          sectionType: key,
          content: s.content,
          metadata: {
            school: note.school || student.school,
            level: student.level,
            major: note.intendedMajor,
            studentName: student.fullName,
          },
        }];
      });

      if (aiSections.length > 0) {
        await fetch("/api/rag/index", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections: aiSections }),
        });
      }

      // Download the .docx after indexing
      await downloadProposalDocx(proposalSections, student.fullName);
    } catch (err) {
      console.error("Finalize failed:", err);
    } finally {
      setFinalizing(false);
    }
  };

  // Format meeting date/time
  const [datePart] = meeting.date.split("T");
  const meetingDateTime = new Date(`${datePart}T${meeting.time}:00`);
  const dateLabel = meetingDateTime.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
  const timeLabel = meetingDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (!mounted) return null;

  return createPortal(
    <>
      <style>{`@keyframes cnm-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          style={{
            background: "var(--surface)", borderRadius: 14,
            width: "100%", maxWidth: step === "preview" ? 840 : 660,
            maxHeight: "94vh", display: "flex", flexDirection: "column",
            boxShadow: "0 28px 64px rgba(0,0,0,0.28)", overflow: "hidden",
            transition: "max-width 300ms ease",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div style={{
            padding: "16px 24px 14px", borderBottom: "1px solid var(--line)",
            display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexShrink: 0,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
                {step === "preview" ? `Proposal — ${student.fullName}` : student.fullName}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{dateLabel} · {timeLabel}</span>
                <span style={{ color: "var(--line-strong)", fontSize: 12 }}>·</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "var(--bg-2)", color: "var(--ink-2)" }}>{meeting.counselorName}</span>
                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >Join Meeting ↗</a>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--ink-3)", flexShrink: 0, borderRadius: 6 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ── STEP: INPUT ── */}
          {step === "input" && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "grid", gap: 16 }}>
                {/* Profile fields */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 8 }}>
                    Student Info
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 3, display: "block" }}>Birth Year</label>
                      <input className="field" value={note.birthYear} onChange={(e) => setField("birthYear")(e.target.value)} placeholder="2009" style={{ width: "100%", fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 3, display: "block" }}>School</label>
                      <input className="field" value={note.school} onChange={(e) => setField("school")(e.target.value)} placeholder="The Olympia Schools" style={{ width: "100%", fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 3, display: "block" }}>Intended Major</label>
                      <input className="field" value={note.intendedMajor} onChange={(e) => setField("intendedMajor")(e.target.value)} placeholder="Economics / CS / Biology…" style={{ width: "100%", fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 3, display: "block" }}>Target Schools</label>
                      <input className="field" value={note.targetSchools} onChange={(e) => setField("targetSchools")(e.target.value)} placeholder="US universities, prefer West Coast…" style={{ width: "100%", fontSize: 13 }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 3, display: "block" }}>Service Period</label>
                    <input className="field" value={note.servicePeriod} onChange={(e) => setField("servicePeriod")(e.target.value)} placeholder="09/2025 – 08/2027" style={{ width: "100%", fontSize: 13 }} />
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "4px 0" }} />

                {/* Assessment fields */}
                <NoteSection label="Key Notes" value={note.keyNotes} onChange={setField("keyNotes")} placeholder="Student background — synced with game plan…" generating={generating === "keyNotes"} onGenerate={() => generate("keyNotes")} rows={3} />
                <NoteSection label="Strengths" value={note.strength} onChange={setField("strength")} placeholder="What is the student doing well?" generating={generating === "strength"} onGenerate={() => generate("strength")} rows={3} />
                <NoteSection label="Areas for Improvement" value={note.areaForImprovement} onChange={setField("areaForImprovement")} placeholder="What needs improvement before the next session?" generating={generating === "areaForImprovement"} onGenerate={() => generate("areaForImprovement")} rows={3} />

                <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "4px 0" }} />

                {/* Proposal content fields */}
                <NoteSection label="Academics & Test Prep" value={note.academicPlan} onChange={setField("academicPlan")} placeholder="GPA, SAT, IELTS targets + test schedule + current status…" generating={generating === "academicPlan"} onGenerate={() => generate("academicPlan")} rows={4} />
                <NoteSection label="Key Activities" value={note.keyActivities} onChange={setField("keyActivities")} placeholder="Personal projects, competitions, internships…" generating={generating === "keyActivities"} onGenerate={() => generate("keyActivities")} rows={4} />
                <NoteSection label="Profile & School Selection" value={note.profileStrategy} onChange={setField("profileStrategy")} placeholder="Essay strategy, recommendation letters, school list…" generating={generating === "profileStrategy"} onGenerate={() => generate("profileStrategy")} rows={4} />

                {/* Progress */}
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: allFilled ? "var(--success)" : "var(--ink-3)", fontWeight: 600 }}>
                    {filledCount} / {ALL_FIELDS.length} fields complete
                  </span>
                  {!allFilled && (
                    <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      Fill all fields to create proposal
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: "14px 24px", borderTop: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8,
                flexShrink: 0, background: "var(--bg-2)",
              }}>
                <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 13 }}>Cancel</button>
                <button className="btn" onClick={handleSave} style={{ fontSize: 13 }}>Save Notes</button>
                <button
                  className="btn"
                  onClick={handleCreateProposal}
                  disabled={!allFilled || !!generating}
                  style={{
                    fontSize: 13, fontWeight: 700,
                    background: !allFilled ? "var(--bg-2)" : "var(--accent)",
                    color: !allFilled ? "var(--ink-3)" : "var(--bg)",
                    border: "none", display: "flex", alignItems: "center", gap: 6,
                    cursor: !allFilled || generating ? "not-allowed" : "pointer",
                    opacity: !allFilled ? 0.5 : 1,
                  }}
                >
                  <StarIcon />
                  Create Proposal
                </button>
              </div>
            </>
          )}

          {/* ── STEP: PREVIEW ── */}
          {step === "preview" && (
            <ProposalPreview
              sections={proposalSections}
              onChange={handleSectionChange}
              onDownload={handleDownload}
              onBack={() => setStep("input")}
              downloading={downloading}
              onGenerateSection={handleGenerateSection}
              generatingSection={generatingSection}
              onFinalize={handleFinalize}
              finalizing={finalizing}
            />
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
