"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Link, Clock } from "lucide-react";

const TimetableAnalyzer = () => {
  const [stage, _setStage] = useState('initial'); // 'initial', 'survey', 'result'
  const [urlInput, setUrlInput] = useState("");
  const [output, setOutput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 서버 응답 대기 상태
  const [surveyAnswers, setSurveyAnswers] = useState({
    satisfaction: '',
    difficulty: '',
    preference: ''
  });
  const [resultData, setResultData] = useState(null); // 설문 결과 및 분석 데이터

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!urlInput.startsWith("https://everytime.kr/@")) {
      alert("잘못된 URL입니다. 시간표 URL을 입력해주세요.");
      return;
    }

    _setStage('survey');
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setOutput(data.data);
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
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

    _setStage('survey');
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurveyChange = (question: string, value: string) => {
    setSurveyAnswers(prev => ({
      ...prev,
      [question]: value,
    }));
  };

  const handleSurveySubmit = async () => {
    setIsLoading(true);

    // 설문 데이터를 서버에 전송
    try {
      const response = await fetch("http://localhost:8000/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyAnswers })
      });

      const data = await response.json();
      if (data.status === "success") {
        // 설문 제출 후 결과를 가져옴
        const resultResponse = await fetch("http://localhost:8000/api/result");
        const resultData = await resultResponse.json();
        if (resultData.status === "success") {
          setResultData(resultData.data);  // 결과 데이터를 저장
          _setStage('result');  // 결과 화면으로 전환
        }
      } else {
        console.error("Survey submission failed:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
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
              <Button type="submit" className="w-full" disabled={!selectedFile}>
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
              <Button type="submit" className="w-full" disabled={!urlInput}>
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
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4">설문조사</h2>
        <p>설문조사를 완료하고 분석 결과를 확인하세요.</p>
      </div>

      {/* 설문 문제들 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">1. 당신의 수업을 어떻게 평가하시나요?</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="satisfaction"
                value="good"
                checked={surveyAnswers.satisfaction === 'good'}
                onChange={() => handleSurveyChange('satisfaction', 'good')}
                className="mr-2"
              />
              좋음
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="satisfaction"
                value="average"
                checked={surveyAnswers.satisfaction === 'average'}
                onChange={() => handleSurveyChange('satisfaction', 'average')}
                className="mr-2"
              />
              보통
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="satisfaction"
                value="bad"
                checked={surveyAnswers.satisfaction === 'bad'}
                onChange={() => handleSurveyChange('satisfaction', 'bad')}
                className="mr-2"
              />
              나쁨
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">2. 수업 난이도는 어떤가요?</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value="easy"
                checked={surveyAnswers.difficulty === 'easy'}
                onChange={() => handleSurveyChange('difficulty', 'easy')}
                className="mr-2"
              />
              쉬움
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value="medium"
                checked={surveyAnswers.difficulty === 'medium'}
                onChange={() => handleSurveyChange('difficulty', 'medium')}
                className="mr-2"
              />
              보통
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value="hard"
                checked={surveyAnswers.difficulty === 'hard'}
                onChange={() => handleSurveyChange('difficulty', 'hard')}
                className="mr-2"
              />
              어려움
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">3. 수업에서 어떤 것이 가장 중요하나요?</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="preference"
                value="content"
                checked={surveyAnswers.preference === 'content'}
                onChange={() => handleSurveyChange('preference', 'content')}
                className="mr-2"
              />
              내용
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="preference"
                value="interaction"
                checked={surveyAnswers.preference === 'interaction'}
                onChange={() => handleSurveyChange('preference', 'interaction')}
                className="mr-2"
              />
              상호작용
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="preference"
                value="assessment"
                checked={surveyAnswers.preference === 'assessment'}
                onChange={() => handleSurveyChange('preference', 'assessment')}
                className="mr-2"
              />
              평가
            </label>
          </div>
        </div>

        <Button onClick={handleSurveySubmit} className="w-full" disabled={isLoading}>
          설문 제출하기
        </Button>
      </div>
    </div>
  );

  const renderResultStage = () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4">분석 결과</h2>
        {resultData ? (
          <pre className="whitespace-pre-wrap">{JSON.stringify(resultData, null, 2)}</pre>
        ) : (
          <p>결과를 불러오는 중...</p>
        )}
      </div>
    </div>
  );

  if (stage === 'initial') return renderInitialStage();
  if (stage === 'survey') return renderSurveyStage();
  if (stage === 'result') return renderResultStage();

  return null;
};

export default TimetableAnalyzer;
