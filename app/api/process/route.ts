import { NextResponse } from "next/server";
import { spawn } from "child_process";
import formidable, { File } from "formidable";
import { Readable } from "stream";

export const runtime = "nodejs"; // `edge` 대신 `nodejs`로 설정

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = formidable({ uploadDir: "./uploads", keepExtensions: true });

    return new Promise((resolve, reject) => {
      // Next.js Request 객체를 ReadableStream에서 Buffer로 변환
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];

      function processText({ done, value }: ReadableStreamReadResult<Uint8Array>) {
        if (done) {
          // 모든 데이터를 읽은 후 버퍼를 생성하고, 스트림으로 변환하여 formidable에 전달
          const buffer = Buffer.concat(chunks);
          const stream = new Readable();
          stream.push(buffer);
          stream.push(null); // 스트림 종료

          // Headers 설정
          stream.headers = {
            'content-length': buffer.length.toString(), // content-length 명시적으로 설정
            'content-type': contentType, // 기존의 content-type 유지
          };

          form.parse(stream, (err, fields, files) => {
            if (err) {
              reject(
                NextResponse.json({ error: "File upload error" }, { status: 500 })
              );
              return;
            }

            const file = files.file?.[0] as File;
            if (!file) {
              reject(
                NextResponse.json({ error: "No file uploaded" }, { status: 400 })
              );
              return;
            }

            const filePath = file.filepath;

            // 파이썬 스크립트 실행
            const python = spawn("python", ["python/ocr.py", filePath]);

            let result = "";
            let errorOutput = "";
            python.stdout.on("data", (data) => {
              const text = data.toString("utf-8");
              result += text;
              console.log("Python stdout data:", text);
            });

            python.stderr.on("data", (data) => {
              const text = data.toString("utf-8");
              errorOutput += text;
              console.error("Python stderr:", text);
            });

            python.on("close", (code) => {
              if (code === 0) {
                resolve(
                  NextResponse.json(
                    { result: result.trim() },
                    { status: 200 }
                  )
                );
              } else {
                reject(
                  NextResponse.json(
                    { error: "Python script execution error", details: errorOutput },
                    { status: 500 }
                  )
                );
              }
            });
          });
          return;
        }
        if (value) {
          chunks.push(value);
        }
        reader?.read().then(processText);
      }

      reader?.read().then(processText);
    });
  } else {
    // URL 처리
    const { type, input } = await request.json();

    if (type === "url") {
      return new Promise((resolve, reject) => {
        const python = spawn("python", ["python/webcroll.py", input]);

        let result = "";
        let errorOutput = "";
        python.stdout.on("data", (data) => {
          const text = data.toString("utf-8");
          result += text;
          console.log("Python stdout data:", text);
        });

        python.stderr.on("data", (data) => {
          const text = data.toString("utf-8");
          errorOutput += text;
          console.error("Python stderr:", text);
        });

        python.on("close", (code) => {
          if (code === 0) {
            resolve(
              NextResponse.json({ result: result.trim() }, { status: 200 })
            );
          } else {
            reject(
              NextResponse.json(
                { error: "Python script execution error", details: errorOutput },
                { status: 500 }
              )
            );
          }
        });
      });
    } else {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 }
      );
    }
  }
}
