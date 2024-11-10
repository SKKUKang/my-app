"use client";
import { useState } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [output, setOutput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 사용자 입력을 Next.js API로 보냄
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputValue }),
      });

      const data = await response.json();
      console.log("Received data:", data);
      setOutput(data.result); // 파이썬에서 반환한 결과
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>파이썬 처리 예시</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="입력해주세요"
        />
        <button type="submit">제출</button>
      </form>
      {output && (
        <div>
          <h2>결과:</h2>
          <p>{output}</p>
        </div>
      )}
    </div>
  );
}
