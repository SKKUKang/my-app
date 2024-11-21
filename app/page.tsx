"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Link, Share2, Download, Clock } from "lucide-react";

const TimetableAnalyzer = () => {
  const [stage, setStage] = useState('initial'); // initial, survey, result
  const [progress, setProgress] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [output, setOutput] = useState("");

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: urlInput }),
      });

      const data = await response.json();
      setOutput(data.result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const renderInitialStage = () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">나의 시간표 분석하기</h1>
        <p className="text-lg text-gray-600">당신의 시간표를 업로드하고 AI 분석을 받아보세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">이미지 업로드</h2>
            <p className="text-gray-600 text-center">시간표 이미지를 직접 업로드해주세요</p>
            <Button className="w-full">
              이미지 선택하기
            </Button>
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

  const renderSurveyStage = () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Progress value={progress} className="w-full" />
        <p className="text-center mt-2 text-sm text-gray-600">분석 진행 중...</p>
      </div>

      <Card className="p-6">
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">몇 가지 질문에 답해주세요</h2>
          {/* 설문 문항들은 실제 로직에 따라 추가될 예정 */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              선택지 1
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              선택지 2
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              선택지 3
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResultStage = () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardContent className="p-6 text-center">
          <h2 className="text-3xl font-bold mb-2">당신의 시간표 점수는</h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">85점</div>
          <p className="text-gray-600">상위 15%의 우수한 시간표입니다!</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">분석 결과</h3>
            <div className="space-y-4">
              <p className="text-gray-600">✓ 과목 배치가 효율적입니다</p>
              <p className="text-gray-600">✓ 공강 시간이 적절합니다</p>
              <p className="text-gray-600">✓ 학습 난이도가 잘 분산되어 있습니다</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button className="w-full flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>결과 이미지 저장</span>
          </Button>
          <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>카카오톡으로 공유하기</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {stage === 'initial' && renderInitialStage()}
      {stage === 'survey' && renderSurveyStage()}
      {stage === 'result' && renderResultStage()}
      {output && (
        <div className="w-full max-w-4xl mx-auto p-6">
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <h2 className="text-3xl font-bold mb-2">분석 결과</h2>
              <p className="text-gray-600">{output}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TimetableAnalyzer;