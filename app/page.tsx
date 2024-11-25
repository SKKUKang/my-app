"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Link, Share2, Download, Clock } from "lucide-react";

const TimetableAnalyzer = () => {
  const [stage, _setStage] = useState('initial'); // initial, survey, result
  const [progress, _setProgress] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [output, setOutput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }), // 수정된 부분
      });

      const data = await response.json();
      if (data.status === "success") {
        setOutput(data.data);
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/process", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.status === "success") {
        setOutput(data.data);
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const renderInitialStage = () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">나의 시간표 분석하기</h1>
        <p className="text-lg text-gray-600">당신의 시간표를 업로드하고 분석을 받아보세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">이미지 업로드</h2>
            <p className="text-gray-600 text-center">시간표 이미지를 직접 업로드해주세요</p>
            <form onSubmit={handleFileSubmit} className="w-full">
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded mb-4"
              />
              <Button type="submit" className="w-full">
                이미지 업로드하기
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Link className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">URL 입력</h2>
            <p className="text-gray-600 text-center">시간표 이미지 URL을 입력해주세요</p>
            <form onSubmit={handleUrlSubmit} className="w-full">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="URL 입력"
                className="w-full p-2 border rounded mb-4"
              />
              <Button type="submit" className="w-full">
                URL 입력하기
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6 bg-blue-50">
        <CardContent className="flex items-center space-x-4">
          <Clock className="w-6 h-6 text-blue-600" />
          <p className="text-sm text-blue-600">분석에는 약 1-2분이 소요됩니다</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {stage === 'initial' && renderInitialStage()}
      {output && (
  <div className="w-full max-w-4xl mx-auto p-6">
    <Card className="mb-8">
      <CardContent className="p-6 text-center">
        <h2 className="text-3xl font-bold mb-2">분석 결과</h2>
        {Array.isArray(output) && output.length > 0 ? (
          <div className="space-y-4 text-left">
            {output.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <p><strong>요일:</strong> {item[0]}</p>
                <p><strong>과목명:</strong> {item[1]}</p>
                <p><strong>시작 시간:</strong> {item[2]}</p>
                <p><strong>종료 시간:</strong> {item[3]}</p>
                <p><strong>강의실:</strong> {item[4]}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No classes found</p>
        )}
      </CardContent>
    </Card>
  </div>
)}



    </div>
  );
};

export default TimetableAnalyzer;
