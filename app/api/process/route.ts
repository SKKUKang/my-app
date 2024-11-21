import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { Formidable, File } from "formidable";
import { IncomingMessage } from "http";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    // 이미지 업로드 처리
    const form = new Formidable({ uploadDir: "./uploads", keepExtensions: true });

    return new Promise((resolve, reject) => {
      // Next.js Request 객체를 IncomingMessage로 변환
      const req = request as unknown as IncomingMessage;

      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(
            new NextResponse(
              JSON.stringify({ error: "File upload error" }),
              {
                status: 500,
                headers: { "Content-Type": "application/json; charset=utf-8" },
              }
            )
          );
          return;
        }

        const file = files.file as File;
        const filePath = file.filepath;

        // 파이썬 스크립트 실행
        const python = spawn("python", ["python/ocr.py", filePath]);

        let result = "";
        python.stdout.on("data", (data) => {
          const text = data.toString("utf-8");
          result += text;
        });

        python.stderr.on("data", (data) => {
          console.error("Python stderr:", data.toString("utf-8"));
        });

        python.on("close", (code) => {
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
    });
  } else {
    // URL 처리
    const { type, input } = await request.json();

    if (type === "url") {
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
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Invalid request type" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }
  }
}