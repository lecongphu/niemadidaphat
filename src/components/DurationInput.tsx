"use client";

import { useState, useEffect } from 'react';
import { 
  secondsToHumanReadable, 
  validateDurationInput,
  getTotalDurationFromChapters 
} from '@/lib/durationUtils';

interface DurationInputProps {
  value: string;
  onChange: (duration: string, seconds: number) => void;
  onSecondsChange?: (seconds: number) => void;
  chapterAudioUrls?: string[];
  placeholder?: string;
  label?: string;
  showAutoDetect?: boolean;
}

export default function DurationInput({
  value,
  onChange,
  onSecondsChange,
  chapterAudioUrls = [],
  placeholder = "Ví dụ: 2h 30m, 90m, 1:30:45",
  label = "Thời lượng",
  showAutoDetect = true
}: DurationInputProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [validationInfo, setValidationInfo] = useState<{
    isValid: boolean;
    error?: string;
    seconds: number;
  } | null>(null);

  // Validate input when value changes
  useEffect(() => {
    if (value) {
      const validation = validateDurationInput(value);
      setValidationInfo({
        isValid: validation.isValid,
        error: validation.error,
        seconds: validation.seconds,
      });
      
      if (validation.isValid && onSecondsChange) {
        onSecondsChange(validation.seconds);
      }
    } else {
      setValidationInfo(null);
      if (onSecondsChange) {
        onSecondsChange(0);
      }
    }
  }, [value, onSecondsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const validation = validateDurationInput(inputValue);
    
    onChange(inputValue, validation.seconds);
  };


  const detectFromChapters = async () => {
    const validUrls = chapterAudioUrls.filter(url => url && url.trim());
    if (validUrls.length === 0) return;

    setIsDetecting(true);
    setDetectionError(null);

    try {
      const totalDuration = await getTotalDurationFromChapters(validUrls);
      if (totalDuration > 0) {
        const formatted = secondsToHumanReadable(totalDuration);
        onChange(formatted, totalDuration);
      } else {
        setDetectionError('Không thể đọc thời lượng từ các tập');
      }
    } catch (error) {
      setDetectionError('Lỗi khi đọc các tập: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDetecting(false);
    }
  };

  const canDetectFromChapters = chapterAudioUrls.length > 0 && chapterAudioUrls.some(url => url && url.trim()) && showAutoDetect;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-xs text-gray-500 ml-2">
          Hỗ trợ: &ldquo;2h 30m&rdquo;, &ldquo;90m&rdquo;, &ldquo;1:30:45&rdquo;
        </span>
      </label>
      
      <div className="flex gap-2">
        <input
          type="text"
          className={`border rounded px-3 py-2 flex-1 ${
            validationInfo && !validationInfo.isValid 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
        />
        
        {canDetectFromChapters && (
          <div className="flex gap-1">
            
            {canDetectFromChapters && (
              <button
                type="button"
                onClick={detectFromChapters}
                disabled={isDetecting}
                className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Tự động tính từ tổng các tập"
              >
                {isDetecting ? '⏳' : '📚'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Validation Info */}
      {validationInfo && !validationInfo.isValid && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          ❌ {validationInfo.error}
        </div>
      )}

      {validationInfo && validationInfo.isValid && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          ✅ {secondsToHumanReadable(validationInfo.seconds)} ({validationInfo.seconds.toLocaleString()} giây)
        </div>
      )}

      {/* Detection Error */}
      {detectionError && (
        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
          ⚠️ {detectionError}
        </div>
      )}

      {/* Auto-detect Help */}
      {showAutoDetect && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>💡 <strong>Tự động lấy thời lượng:</strong></div>
          {canDetectFromChapters && (
            <div>• 📚 Từ tổng các tập ({chapterAudioUrls.filter(url => url && url.trim()).length} tập có audio)</div>
          )}
          <div>• ✋ Hoặc nhập thủ công: &ldquo;2h 30m&rdquo;, &ldquo;90m&rdquo;, &ldquo;1:30:45&rdquo;</div>
        </div>
      )}

      {/* Format Examples */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700">📋 Các định dạng hỗ trợ</summary>
        <div className="mt-2 space-y-1 pl-4">
          <div>• <code>&ldquo;2h 30m 45s&rdquo;</code> → 2 giờ 30 phút 45 giây</div>
          <div>• <code>&ldquo;90m&rdquo;</code> → 1 giờ 30 phút</div>
          <div>• <code>&ldquo;3600s&rdquo;</code> → 1 giờ</div>
          <div>• <code>&ldquo;1:30:45&rdquo;</code> → 1 giờ 30 phút 45 giây</div>
          <div>• <code>&ldquo;90:30&rdquo;</code> → 1 giờ 30 phút 30 giây</div>
          <div>• <code>&ldquo;150&rdquo;</code> → 2 giờ 30 phút (giả định phút)</div>
        </div>
      </details>
    </div>
  );
}
