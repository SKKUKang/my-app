import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(request: Request) {
  const { input } = await request.json();

  return new Promise((resolve, reject) => {
    // 파이썬 스크립트 실행
    console.log("Python script is starting with input:", input); // 입력 값 확인 로그

    const python = spawn("python", ["python/webcroll.py", input]);

    let result = "";
    python.stdout.on("data", (data) => {
      const text = data.toString("utf-8");
      result += text;
      console.log("Python stdout data:", text); // Python stdout 로그
    });

    python.stderr.on("data", (data) => {
      console.error("Python stderr:", data.toString("utf-8")); // Python 에러 로그
    });

    python.on("close", (code) => {
      console.log("Python script closed with code:", code); // Python 종료 코드 로그
      if (code === 0) {
        resolve(
          new NextResponse(JSON.stringify({ result: result.trim() }), {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          })
        );
      } else {
        reject(
          new NextResponse(
            JSON.stringify({ error: "Python script execution error" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json; charset=utf-8" },
            }
          )
        );
      }
    });
  });
}
