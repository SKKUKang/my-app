import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    // multipart/form-data 처리 로직
    return NextResponse.json({ message: "multipart/form-data 처리" });
  } else {
    // JSON 데이터 처리 로직
    const data = await request.json();
    return NextResponse.json({ message: "JSON 데이터 처리", data });
  }
}