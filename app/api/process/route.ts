import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(request: Request) {
  const { input } = await request.json();

  return new Promise((resolve, reject) => {
    // 파이썬 스크립트 실행
    const python = spawn("python", ["python/webcroll.py", input]);

    let result = "";
    python.stdout.on("data", (data) => {
      result += data.toString('utf-8');
    });

    python.stderr.on("data", (data) => {
      console.error("stderr: ", data.toString());
    });

    python.on("close", (code) => {
      if (code === 0) {
        // 파이썬 처리 결과를 반환
        resolve(
          NextResponse.json({ result: result.trim() }, { status: 200 })
        );
      } else {
        reject(NextResponse.json({ error: "파이썬 실행 오류" }, { status: 500 }));
      }
    });
  });
}
