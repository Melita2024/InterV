import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { getAdminDb } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
export const maxDuration = 60;

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const db = getAdminDb();
    const { text: questions } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
    The job role is ${role}.
    The job experience level is ${level}.
    The key skills, tools, or focus areas relevant to this role are: ${techstack}.
    The focus between behavioural and role-specific (technical) questions should lean towards: ${type}.
    The amount of questions required is: ${amount}.

    Tailor the questions specifically to the profession and field of "${role}". This may be ANY field, such as software engineering, nursing, marketing, teaching, finance, design, law, or sales. Use terminology, scenarios, and standards appropriate to that profession. Do NOT assume it is a tech role unless the role clearly indicates so.

    Please return only the questions, without any additional text.
    The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
    Return the questions formatted like this:
    ["Question 1", "Question 2", "Question 3"]

    Thank you! <3
`,
    });
    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
