import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchSimilarFallback } from "@/lib/proposal-rag";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Bạn là tư vấn viên cấp cao tại Elio Education, viết nội dung cho proposal tư vấn du học gửi đến học sinh và gia đình.

GIỌNG VĂN: Chuyên gia khiêm tốn — ấm áp, cá nhân hóa, và thực sự quan tâm. Không phải báo cáo công ty. Viết như một người đã dành nhiều thời gian quan sát học sinh và muốn chia sẻ điều mình thực sự nhận thấy.

Điều cần nhớ khi viết: hành trình vào đại học không chỉ là một quy trình tuyển sinh — đó là lần đầu tiên một người trẻ tự định hướng cuộc đời mình, xa gia đình, xa những gì quen thuộc. Viết với nhận thức đó.

ĐỊNH DẠNG:
- CHỈ viết nội dung body của section. TUYỆT ĐỐI KHÔNG bao gồm: tên công ty (ELIO EDUCATION), tiêu đề proposal, thông tin học sinh (Học sinh, Trường, Ngành), đường kẻ (---), hoặc bất kỳ header/metadata nào. Những phần đó đã có sẵn bên ngoài.
- Không dùng dấu # để tạo heading. Dùng số thứ tự (1. 2. 3.) cho các phần nhỏ.
- Không dùng em dash (—). Dùng dấu chấm hoặc dấu phẩy thay thế.
- Văn xuôi kết hợp danh sách có dấu chấm (•)
- Viết bằng tiếng Việt hoàn toàn
- Độ dài: TUYỆT ĐỐI không quá 130 từ mỗi section. Ngắn gọn, súc tích, đúng trọng tâm. Mỗi bullet không quá 1.5 dòng.
- Không mở đầu bằng tên học sinh ngay câu đầu tiên
- KHÔNG lặp lại tiêu đề section (I., II., III.) ở đầu nội dung`;

type SectionType = "section1" | "section2" | "section3";

function buildPrompt(
  sectionType: SectionType,
  fullName: string,
  studentInfo: string,
  issues: string[],
  school: string,
  keyNotes: string,
  intendedMajor: string,
  targetSchools: string,
  currentGrade: string,
): string {
  const name = fullName.split(" ").pop() ?? fullName;
  const issueList = issues.length > 0 ? issues.join("; ") : "chưa có ghi chú cụ thể";
  const grade = parseInt(currentGrade) || 11;

  const context = `
Học sinh: ${fullName} (${name})
Trường: ${school || "chưa xác định"}
Ngành dự định: ${intendedMajor || "chưa xác định"}
Hồ sơ học sinh: ${studentInfo || "chưa có thông tin"}
Điểm cần cải thiện: ${issueList}
Ghi chú buổi làm việc: ${keyNotes || "chưa có ghi chú"}
Lớp hiện tại: ${grade}`.trim();

  if (sectionType === "section1") {
    return `${context}

Viết nội dung cho Section I: CHIẾN LƯỢC TỔNG THỂ của proposal cho ${fullName}.

Bao gồm 3 phần con, dùng số thứ tự. Mỗi phần TỐI ĐA 2 đến 3 câu hoặc 2 bullet:
1. Điểm mạnh. 1 câu quan sát, sau đó 2 bullet ngắn.
2. Những điểm có thể Phát triển. 2 bullet ngắn, thực tế.
3. Định hướng. 2 đến 3 câu nêu chiến lược tổng thể, không liệt kê dài.`;
  }

  if (sectionType === "section2") {
    const ieltsMatch = (keyNotes + studentInfo).match(/IELTS[:\s]+([0-9.]+)/i);
    const satMatch = (keyNotes + studentInfo).match(/SAT[:\s]+([0-9]+)/i);
    const testContext = [
      ieltsMatch ? `IELTS hiện tại: ${ieltsMatch[1]}` : "IELTS: chưa có điểm",
      satMatch ? `SAT hiện tại: ${satMatch[1]}` : "SAT: chưa có điểm",
    ].join(", ");

    const gradeSections: string[] = [];
    let sectionNum = 1;

    if (grade <= 10) {
      gradeSections.push(`${sectionNum}. Lớp 10: Khám phá và Xây nền. Xác định hướng ngành, bắt đầu ôn tiếng Anh, tham gia 1 đến 2 hoạt động ngoại khóa có chiều sâu, duy trì GPA.`);
      sectionNum++;
    }
    if (grade <= 11) {
      gradeSections.push(`${sectionNum}. Lớp 11: Xây nền và Tìm tiếng nói riêng. Bao gồm: Học thuật & Chuẩn hóa (IELTS/SAT/GPA), Hoạt động trọng điểm (2 đến 3 hoạt động), Hồ sơ & Danh sách trường.`);
      sectionNum++;
    }
    gradeSections.push(`${sectionNum}. Lớp 12: Hoàn thiện và Bước qua ngưỡng cửa. Timeline: Tháng 8 đến 11 nộp EA/ED, Tháng 12 đến 2 nộp RD, Tháng 1 đến 4 hậu xét tuyển, Tháng 4 đến 5 quyết định, Tháng 5 đến 8 chuẩn bị.`);

    return `${context}
Tình trạng thi cử: ${testContext}

Viết nội dung cho Section II: LỘ TRÌNH THEO NĂM HỌC cho ${fullName}.

Học sinh hiện đang lớp ${grade}. Viết lộ trình từ lớp hiện tại đến hết lớp 12.

Bao gồm các phần con:
${gradeSections.join("\n")}

Mỗi giai đoạn tối đa 3 bullet cực ngắn (1 dòng mỗi bullet). Không giải thích dài dòng.`;
  }

  // section3
  return `${context}
Mục tiêu trường: ${targetSchools || "chưa xác định"}

Viết nội dung cho Section III: GỢI Ý CÁC TRƯỜNG PHÙ HỢP cho ${fullName}.

Bao gồm:
1. 1 câu giải thích logic chọn trường.
2. Chia thành 3 nhóm: Reach (3 trường), Match (3 trường), Safety (2 trường). Mỗi trường chỉ ghi tên, không giải thích dài.
3. 1 câu ghi chú cuối.

Nếu có thông tin về mục tiêu trường, tham khảo. Nếu không, đưa ra gợi ý dựa trên ngành và profile.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sectionType, fullName, studentInfo, issues, school, keyNotes, intendedMajor, targetSchools, currentGrade } = body;

  if (!sectionType || !fullName) {
    return NextResponse.json({ error: "sectionType and fullName are required" }, { status: 400 });
  }

  try {
    let prompt = buildPrompt(
      sectionType as SectionType,
      fullName,
      studentInfo ?? "",
      issues ?? [],
      school ?? "",
      keyNotes ?? "",
      intendedMajor ?? "",
      targetSchools ?? "",
      currentGrade ?? "11",
    );

    // Inject a corpus example as few-shot context if available
    try {
      const examples = await searchSimilarFallback(sectionType as SectionType, 1);
      if (examples.length > 0) {
        prompt += `\n\nVí dụ từ proposal đã được duyệt (dùng làm tham khảo giọng văn và cấu trúc — không copy nội dung):\n---\n${examples[0].content}\n---`;
      }
    } catch {
      // Corpus empty or unavailable — continue without example
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    // Strip any accidental headers/metadata the model may have included
    let text = content.text;
    const headerPatterns = [
      /^#+ .*ELIO.*$/m,
      /^ELIO EDUCATION$/m,
      /^Lộ trình Ứng tuyển.*$/m,
      /^Học sinh:.*$/m,
      /^Trường:.*$/m,
      /^Ngành dự định:.*$/m,
      /^Cố vấn phụ trách:.*$/m,
      /^Năm sinh:.*$/m,
      /^---+$/m,
    ];
    for (const pat of headerPatterns) {
      text = text.replace(pat, "");
    }
    // Remove leading blank lines
    text = text.replace(/^\n+/, "").trim();

    return NextResponse.json({ content: text });
  } catch (err) {
    console.error("[generate/section]", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
