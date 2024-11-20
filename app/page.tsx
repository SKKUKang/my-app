"use client";
import { useState, useRef, useEffect } from "react";
import Head from "next/head"; // Next.js의 Head 컴포넌트 사용
import "./page.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [output, setOutput] = useState("");
  const uploadBoxRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputValue }),
      });

      const data = await response.json();
      console.log("Received data:", data);
      setOutput(data.result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const uploadBox = uploadBoxRef.current;
    const imageInput = imageInputRef.current;
    const imagePreview = imagePreviewRef.current;
    const previewImage = previewImageRef.current;

    if (!uploadBox || !imageInput || !imagePreview || !previewImage) return;

    const handleUploadBoxClick = () => {
      imageInput.click();
    };

    const handleImageInputChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        displayImagePreview(file);
      } else {
        imagePreview.style.display = "none";
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      uploadBox.style.backgroundColor = "#f0f8ff";
    };

    const handleDragLeave = () => {
      uploadBox.style.backgroundColor = "#ffffff";
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      uploadBox.style.backgroundColor = "#ffffff";

      const file = event.dataTransfer?.files[0];
      if (file) {
        displayImagePreview(file);
      }
    };

    const displayImagePreview = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target?.result as string;
        imagePreview.style.display = "block";
        changeUploadBoxStyle();
      };
      reader.readAsDataURL(file);
    };

    const changeUploadBoxStyle = () => {
      uploadBox.style.display = "block";
      uploadBox.style.justifyContent = "flex-start";
      uploadBox.style.alignItems = "stretch";
      uploadBox.querySelector("p")!.style.display = "none";
    };

    uploadBox.addEventListener("click", handleUploadBoxClick);
    imageInput.addEventListener("change", handleImageInputChange);
    uploadBox.addEventListener("dragover", handleDragOver);
    uploadBox.addEventListener("dragleave", handleDragLeave);
    uploadBox.addEventListener("drop", handleDrop);

    return () => {
      uploadBox.removeEventListener("click", handleUploadBoxClick);
      imageInput.removeEventListener("change", handleImageInputChange);
      uploadBox.removeEventListener("dragover", handleDragOver);
      uploadBox.removeEventListener("dragleave", handleDragLeave);
      uploadBox.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>이미지 업로드</title>
        <link rel="stylesheet" href="style.css" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>
      <nav className="navbar navbar-expand-lg navbar-light bg-white border p-3">
        <a className="navbar-brand ms-5 extra-margin" href="#">
          I Like GongGang
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link active" href="#">
                홈
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                기능
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="main-contents">
        <div className="outer-box">
          <div className="upload-box" id="upload-box" ref={uploadBoxRef}>
            <p>
              드래그 앤 드랍
              <br />
              또는 클릭을 통해
              <br />
              시간표 업로드
            </p>
            <input type="file" id="image-upload" accept="image/*" ref={imageInputRef} />
            <div className="image-preview" id="image-preview" ref={imagePreviewRef}>
              <h4>미리보기:</h4>
              <img id="preview-image" src="" alt="미리보기 이미지" ref={previewImageRef} />
            </div>
          </div>
        </div>
      </div>


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