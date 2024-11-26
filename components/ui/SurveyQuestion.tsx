import React from 'react';

interface SurveyQuestionProps {
  question: string;
  name: string;
  options: string[];
  selectedValue: string;
  onChange: (name: string, value: string) => void;
}

const SurveyQuestion: React.FC<SurveyQuestionProps> = ({ question, name, options, selectedValue, onChange }) => (
  <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
    <h3 className="text-2xl font-bold text-gray-800 mb-4">{question}</h3>
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option}
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-transform hover:scale-105 ${
            selectedValue === option ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={selectedValue === option}
            onChange={() => onChange(name, option)}
            className="hidden" // 숨겨진 기본 input
          />
          <span
            className={`w-5 h-5 flex items-center justify-center border rounded-full mr-3 ${
              selectedValue === option ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
            }`}
          >
            {selectedValue === option && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
          </span>
          <span className="text-lg font-medium text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

export default SurveyQuestion;
