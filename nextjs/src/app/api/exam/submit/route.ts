import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createServerAdminClient();
  const { exam_id, candidate_id, answers } = await req.json();

  if (!exam_id || !candidate_id || !answers) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1. Fetch correct answers from DB (Server-side, secure)
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, correct_answer, points")
    .eq("exam_id", exam_id);

  if (qError || !questions) {
    return NextResponse.json({ error: "Failed to fetch questions for grading" }, { status: 500 });
  }

  // 2. Calculate score
  let totalScore = 0;
  let maxPossibleScore = 0;

  questions.forEach((q) => {
    const points = q.points || 1;
    // For automatic grading, we only count MCQ and True/False
    if (q.type !== 'essay') {
      maxPossibleScore += points;
      if (answers[q.id] === q.correct_answer) {
        totalScore += points;
      }
    } else {
      // Essays are saved but not automatically graded
      console.log(`Essay question ${q.id} received answer. Requires manual review.`);
    }
  });

  // 3. Save result
  const { error: resError } = await supabase
    .from("exam_results")
    .insert({
      exam_id,
      candidate_id,
      score: totalScore,
      max_score: maxPossibleScore,
    });

  if (resError) {
    return NextResponse.json({ error: "Failed to save exam results" }, { status: 500 });
  }

  // 4. Update candidate status
  await supabase
    .from("candidates")
    .update({ finished_at: new Date().toISOString() })
    .eq("id", candidate_id);

  return NextResponse.json({ score: totalScore, max_score: maxPossibleScore });
}
