"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Upload, Link, Clock } from "lucide-react";
import SurveyQuestion from '@/components/ui/SurveyQuestion'; // 새로 만든 설문 컴포넌트

const TimetableAnalyzer = () => {
  const [stage, _setStage] = useState('initial'); // 'initial', 'survey', 'result'
  const [urlInput, setUrlInput] = useState("");
  const [output, setOutput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 서버 응답 대기 상태
  const [surveyAnswers, setSurveyAnswers] = useState<{ [key: string]: string }>({
    nickname:'',
    satisfaction: '',
    difficulty: '',
    preference: '',
  });
  const [resultData, setResultData] = useState<any>(); // 설문 결과 및 분석 데이터
  const [requestId] = useState(() => Math.random().toString(36).substring(2)); // 요청 ID 생성 (한 번만)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // 현재 질문의 인덱스
  const [nickname, setNickname] = useState(""); // 닉네임 상태 추가
  const surveyQuestions = [
    {
      question: "1. 당신의 수업을 어떻게 평가하시나요?",
      name: "satisfaction",
      options: ['좋음', '보통', '나쁨']
    },
    {
      question: "2. 수업 난이도는 어떤가요?",
      name: "difficulty",
      options: ['쉬움', '보통', '어려움']
    },
    {
      question: "3. 수업에서 어떤 것이 가장 중요하나요?",
      name: "preference",
      options: ['내용', '상호작용', '평가']
    }
  ];

  const backendUrl = "http://127.0.0.1:8080";
  //const backendUrl= "https://algo-timetable.du.r.appspot.com";

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.startsWith("https://everytime.kr/@")) {
      alert("잘못된 URL입니다. 시간표 URL을 입력해주세요.");
      return;
    }

    _setStage('survey');
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput, requestId }),
        mode: 'cors', // CORS 모드 설정
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
    formData.append("requestId", requestId);

    try {
      const response = await fetch(`${backendUrl}/api/process`, {
        method: "POST",
        body: formData,
        mode: 'cors', // CORS 모드 설정
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
    _setStage('waiting'); // 대기 페이지로 전환
  
    // 설문 데이터를 서버에 전송
    try {
      const response = await fetch(`${backendUrl}/api/survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyAnswers, requestId }),
          mode: 'cors', // CORS 모드 설정
      });
  
      const data = await response.json();
      if (data.status === "success") {
        // 설문 제출 후 결과를 가져옴
        const resultResponse = await fetch(`${backendUrl}/api/result?requestId=${requestId}`);
        const resultData = await resultResponse.json();
        if (resultData.status === "success") {
          setResultData(resultData.data);  // 결과 데이터를 저장
          _setStage('result');  // 결과 화면으로 전환
        }
      } else {
        console.error("Survey submission failed:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  
  const isSurveyComplete = () => {
    return Object.values(surveyAnswers).every(answer => answer !== '');
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSurveySubmit();
    }
  };

  const renderSurveyStage = () => {
    const currentQuestion = surveyQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === surveyQuestions.length - 1;
  
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-4">설문조사</h2>
          <p>설문조사를 완료하고 분석 결과를 확인하세요.</p>
        </div>
  
        {/* 닉네임 입력 */}
        {currentQuestionIndex === -1 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">닉네임을 입력해주세요</h3>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  const newNickname = e.target.value;
                  setNickname(newNickname);
                  setSurveyAnswers(prev => ({
                    ...prev,
                    nickname: newNickname,
                  }));
                }}
                className="w-full p-2 border rounded mb-4"
                placeholder="닉네임"
              />
            </div>
            <Button onClick={handleNextQuestion} className="w-full" disabled={!nickname}>
              다음
            </Button>
          </div>

        ) : (
          <div className="space-y-6">
            <SurveyQuestion
              question={currentQuestion.question}
              name={currentQuestion.name}
              options={currentQuestion.options}
              selectedValue={surveyAnswers[currentQuestion.name]}
              onChange={handleSurveyChange}
            />
            <Button onClick={handleNextQuestion} className="w-full" disabled={!surveyAnswers[currentQuestion.name]}>
              {isLastQuestion ? "제출" : "다음"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderWaitingStage = () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-blue-600 mb-4">잠시만 기다려 주세요</h2>
        <div className="flex justify-center items-center mb-4">
          {/* 로딩 아이콘 추가 */}
          <div className="w-10 h-10 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
        </div>
        <p className="text-xl text-gray-600 mb-6">서버에서 결과를 처리하는 중입니다...</p>
        <p className="text-lg text-gray-500">약 30초 정도 소요될 수 있습니다.</p>
        <p className="text-sm text-gray-400">잠시 후 결과를 확인할 수 있습니다. 너무 오래 기다리시면 새로 고침해 주세요.</p>
      </div>
    </div>
  );
  

  const renderResultStage = () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4"><span className="text-blue-600">{nickname}</span>님의 시간표 분석 결과</h2>
        {resultData ? (
          <>
          <p className="text-blue-600 text-2xl">당신의 시간표 점수는 ? {resultData.etc[0]}점</p>
          <p className="text-gray-500 mb-6">다른 사람들은 평균적으로 50점을 기록했어요. </p>
           {/* 점수 표시하는 부분 */}

          <p className="text-red-600">고득점 시간표 시간대 추천!</p>
          <p className="text-red-600 mb-6">{resultData.etc[1][0]}요일 {(resultData.etc[1][1]-resultData.etc[1][1]%100)/100}시{resultData.etc[1][1]%100}분 ~ {(resultData.etc[1][2]-resultData.etc[1][2]%100)/100}시 {resultData.etc[1][2]%100}분</p>
          {/* 추천하는 시간표가 있는 부분 */}
          <p></p>
          <p className="text-green-600">당신의 시간표 유형은?</p>
          <p className="text-green-900 font-bold">{resultData.etc[2]}</p>
          <p className="text-green-600">당신의 시간표 유형에 대한 설명 어쩌구 저쩌구</p>
          <img src={`/${resultData.etc[2]}.png`} alt="시간표 유형 이미지"  className="max-w-xs mx-auto mb-6" />
          <p></p>

          {/* 시간표 유형을 표시하는 부분 */}
          <p className="text-blue-600">시간표 분석 결과</p>
            {resultData.analysis.map((item: string, index: number) => (
              <p key={index} className="whitespace-pre-wrap">{item[0]} {item[1]} {item[2]}</p>
            ))}

          </>
        ) : (
          <p>결과를 불러오는 중...</p>
        )}
      </div>
    </div>
  );
  if (stage === 'initial') return renderInitialStage();
  if (stage === 'survey') return renderSurveyStage();
  if (stage === 'result') return renderResultStage();
  if (stage === 'waiting') return renderWaitingStage();

  return null;
};

export default TimetableAnalyzer;
