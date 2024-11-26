import React from 'react';

interface SurveyQuestionProps {
  question: string;
  name: string;
  options: string[];
  selectedValue: string;
  onChange: (name: string, value: string) => void;
}

const SurveyQuestion: React.FC<SurveyQuestionProps> = ({ question, name, options, selectedValue, onChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-2">{question}</h3>
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option} className="flex items-center">
          <input
            type="radio"
            name={name}
            value={option}
            checked={selectedValue === option}
            onChange={() => onChange(name, option)}
            className="mr-2"
          />
          {option}
        </label>
      ))}
    </div>
  </div>
);

export default SurveyQuestion;
