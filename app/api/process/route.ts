import { NextResponse } from "next/server";
import { spawn } from "child_process";
import formidable, { File } from "formidable";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = formidable({ keepExtensions: true });

    return new Promise<Response>((resolve) => {
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];

      function processText({ done, value }: ReadableStreamReadResult<Uint8Array>) {
        if (done) {
          const buffer = Buffer.concat(chunks);

          const stream = new Readable();
          stream.push(buffer);
          stream.push(null);

          const incomingMessage = new Readable() as any;
          incomingMessage.push(buffer);
          incomingMessage.push(null);
          incomingMessage.headers = {
            "content-length": buffer.length.toString(),
            "content-type": contentType,
          };

          form.parse(incomingMessage, (err, fields, files) => {
            if (err) {
              resolve(
                NextResponse.json(
                  { error: "File upload error" },
                  { status: 500 }
                )
              );
              return;
            }

            const file = files.file?.[0] as File;
            if (!file) {
              resolve(
                NextResponse.json(
                  { error: "No file uploaded" },
                  { status: 400 }
                )
              );
              return;
            }

            const fs = require("fs");
            const fileBuffer = fs.readFileSync(file.filepath);

            const python = spawn("python", ["python/ocr.py"]);
            python.stdin.write(fileBuffer);
            python.stdin.end();

            let result = "";
            let errorOutput = "";

            python.stdout.on("data", (data) => {
              result += data.toString("utf-8");
            });

            python.stderr.on("data", (data) => {
              errorOutput += data.toString("utf-8");
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
                resolve(
                  NextResponse.json(
                    {
                      error: "Python script execution error",
                      details: errorOutput,
                    },
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
    const { type, input } = await request.json();

    if (type === "url") {
      return new Promise<Response>((resolve) => {
        const python = spawn("python", ["python/webcroll.py", input]);

        let result = "";
        let errorOutput = "";

        python.stdout.on("data", (data) => {
          result += data.toString("utf-8");
        });

        python.stderr.on("data", (data) => {
          errorOutput += data.toString("utf-8");
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
            resolve(
              NextResponse.json(
                {
                  error: "Python script execution error",
                  details: errorOutput,
                },
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
