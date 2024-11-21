import { NextResponse } from "next/server";
import { spawn } from "child_process";
import formidable, { File } from "formidable";
import { Readable } from "stream"; // Use Node.js Readable stream

export const runtime = "nodejs"; // Use `nodejs` runtime instead of `edge`

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = formidable({ uploadDir: "./uploads", keepExtensions: true });

    return new Promise((resolve, reject) => {
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];

      // Function to read chunks from the ReadableStream and form the complete buffer
      function processText({ done, value }: ReadableStreamReadResult<Uint8Array>) {
        if (done) {
          const buffer = Buffer.concat(chunks);

          // Create a custom Readable stream that mimics IncomingMessage
          const stream = new Readable();
          stream.push(buffer); // Push the buffer to the stream
          stream.push(null); // Signal the end of the stream

          // Create an IncomingMessage-like object
          const incomingMessage = new Readable() as any;
          incomingMessage.push(buffer);
          incomingMessage.push(null);
          incomingMessage.headers = {
            "content-length": buffer.length.toString(),
            "content-type": contentType,
          };

          // Parse the form data with formidable
          form.parse(incomingMessage, (err, fields, files) => {
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

            // Run the Python script
            const python = spawn("python", ["python/ocr.py", filePath]);

            let result = "";
            let errorOutput = "";
            python.stdout.on("data", (data) => {
              const text = data.toString("utf-8");
              result += text;
            });

            python.stderr.on("data", (data) => {
              const text = data.toString("utf-8");
              errorOutput += text;
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
          return;
        }

        if (value) {
          chunks.push(value); // Collect the chunks
        }

        reader?.read().then(processText); // Continue reading the stream
      }

      reader?.read().then(processText); // Start reading from the stream
    });
  } else {
    // Handle URL case if not a file upload
    const { type, input } = await request.json();

    if (type === "url") {
      return new Promise((resolve, reject) => {
        const python = spawn("python", ["python/webcroll.py", input]);

        let result = "";
        let errorOutput = "";
        python.stdout.on("data", (data) => {
          const text = data.toString("utf-8");
          result += text;
        });

        python.stderr.on("data", (data) => {
          const text = data.toString("utf-8");
          errorOutput += text;
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
