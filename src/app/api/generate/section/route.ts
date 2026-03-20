import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchSimilarFallback } from "@/lib/proposal-rag";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Bạn là tư vấn viên cấp cao tại Elio Education, viết nội dung cho proposal tư vấn du học gửi đến học sinh và gia đình.

GIỌNG VĂN: Chuyên gia khiêm tốn — ấm áp, cá nhân hóa, và thực sự quan tâm. Không phải báo cáo công ty. Viết như một người đã dành nhiều thời gian quan sát học sinh và muốn chia sẻ điều mình thực sự nhận thấy.

Điều cần nhớ khi viết: hành trình vào đại học không chỉ là một quy trình tuyển sinh — đó là lần đầu tiên một người trẻ tự định hướng cuộc đời mình, xa gia đình, xa những gì quen thuộc. Viết với nhận thức đó.

ĐỊNH DẠNG:
- Văn xuôi kết hợp danh sách có dấu chấm (•)
- Không dùng tiêu đề in đậm trong nội dung section (tiêu đề đã có sẵn ngoài)
- Viết bằng tiếng Việt hoàn toàn
- Độ dài: 200–350 từ mỗi section
- Không mở đầu bằng tên học sinh ngay câu đầu tiên`;

type SectionType = "section1" | "section2a" | "section2b";

function buildPrompt(
  sectionType: SectionType,
  fullName: string,
  studentInfo: string,
  issues: string[],
  school: string,
  keyNotes: string,
  intendedMajor: string,
): string {
  const name = fullName.split(" ").pop() ?? fullName;
  const issueList = issues.length > 0 ? issues.join("; ") : "chưa có ghi chú cụ thể";

  const context = `
Học sinh: ${fullName} (${name})
Trường: ${school || "chưa xác định"}
Ngành dự định: ${intendedMajor || "chưa xác định"}
Hồ sơ học sinh: ${studentInfo || "chưa có thông tin"}
Điểm cần cải thiện: ${issueList}
Ghi chú buổi làm việc: ${keyNotes || "chưa có ghi chú"}`.trim();

  if (sectionType === "section1") {
    return `${context}

Viết nội dung cho Section I: CHIẾN LƯỢC TỔNG THỂ của proposal cho ${fullName}.

Bao gồm:
1. Nhận xét cá nhân về điểm mạnh thực sự của ${name} (dựa trên thông tin trên — không bịa)
2. Những điểm cần tập trung phát triển (nếu có issues, dùng chúng; nếu không, đưa ra nhận định chung)
3. Chiến lược tổng thể của Elio cho hành trình này — phải phản ánh đúng con người của ${name}, không chỉ là template chung`;
  }

  if (sectionType === "section2a") {
    const ieltsMatch = (keyNotes + studentInfo).match(/IELTS[:\s]+([0-9.]+)/i);
    const satMatch = (keyNotes + studentInfo).match(/SAT[:\s]+([0-9]+)/i);
    const testContext = [
      ieltsMatch ? `IELTS hiện tại: ${ieltsMatch[1]}` : "IELTS: chưa có điểm",
      satMatch ? `SAT hiện tại: ${satMatch[1]}` : "SAT: chưa có điểm",
    ].join(", ");

    return `${context}
Tình trạng thi cử: ${testContext}

Viết nội dung cho Section II — LỚP 11: GIAI ĐOẠN XÂY NỀN VÀ TÌM TIẾNG NÓI RIÊNG cho ${fullName}.

Bao gồm 3 phần rõ ràng:
1. Học thuật & Chuẩn hóa — kế hoạch IELTS/SAT/GPA cụ thể dựa trên tình trạng hiện tại
2. Hoạt động trọng điểm — đề xuất 2–3 hoạt động phù hợp với profile (dựa trên studentInfo)
3. Hồ sơ & Danh sách trường — các bước chuẩn bị essay và chọn trường

Viết thực tế và cá nhân hóa cho ${name}, không viết chung chung.`;
  }

  // section2b
  return `${context}

Viết nội dung cho Section II — LỚP 12: GIAI ĐOẠN KẾT THÚC VÀ BƯỚC QUA NGƯỠNG CỬA cho ${fullName}.

Bao gồm 4 giai đoạn theo timeline:
1. Hoàn thiện & Nộp hồ sơ (Tháng 8–11) — EA/ED strategy
2. Nộp hồ sơ RD (Tháng 12–2)
3. Hậu xét tuyển & Quyết định (Tháng 1–5) — phỏng vấn, tài chính, chọn trường
4. Chuẩn bị hành trang (Tháng 5–8) — visa, pre-departure

Viết với giọng đồng hành — Elio sẽ ở đây cùng học sinh và gia đình qua từng bước.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sectionType, fullName, studentInfo, issues, school, keyNotes, intendedMajor } = body;

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
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    return NextResponse.json({ content: content.text });
  } catch (err) {
    console.error("[generate/section]", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
