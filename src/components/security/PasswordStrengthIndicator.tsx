import React, { useState } from 'react';
import { zxcvbn, ZxcvbnResult } from 'zxcvbn';
import { AlertTriangle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const [passwordAnalysis, setPasswordAnalysis] = useState<ZxcvbnResult | null>(null);

  const analyzePassword = () => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordAnalysis(result);
    } else {
      setPasswordAnalysis(null);
    }
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'text-red-600 bg-red-50';
      case 2:
        return 'text-orange-600 bg-orange-50';
      case 3:
        return 'text-yellow-600 bg-yellow-50';
      case 4:
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return 'Very Weak';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Password Strength</span>
        <span className="text-sm font-medium">Suggestions</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${passwordAnalysis ? getStrengthColor(passwordAnalysis.score) : 'bg-gray-300'}`}
              style={{ width: `${passwordAnalysis ? (passwordAnalysis.score + 1) * 25 : 0}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">
            {passwordAnalysis ? getStrengthLabel(passwordAnalysis.score) : 'Very Weak'}
          </span>
        </div>

        {passwordAnalysis && passwordAnalysis.score < 4 && (
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center gap-1 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              Suggestions:
              <ul className="list-disc pl-5">
                {result.feedback.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}