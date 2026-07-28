import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface PasteInputCardProps {
  title: string;
  placeholder: string;
  buttonText?: string;
  onSubmit: (text: string, forceIncomplete?: boolean) => void;
  isLoading?: boolean;
  sampleTexts?: { label: string; text: string }[];
  showIncompleteOption?: boolean;
}

export const PasteInputCard: React.FC<PasteInputCardProps> = ({
  title,
  placeholder,
  buttonText = 'ANALYZE & EXTRACT',
  onSubmit,
  isLoading = false,
  sampleTexts = [],
  showIncompleteOption = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [testIncomplete, setTestIncomplete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmit(inputText, testIncomplete);
  };

  const handleFillSample = (sample: string) => {
    setInputText(sample);
  };

  return (
    <div className="nb-card p-5 md:p-6 mb-8 bg-white">
      <div className="flex items-center justify-between mb-3 border-b-3 border-black pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#FFE066] p-1.5 border-2 border-black">
            <FileText className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="font-heading text-lg md:text-xl font-black uppercase text-black">
            {title}
          </h2>
        </div>
        <span className="font-heading text-xs uppercase font-extrabold bg-black text-[#FFE066] px-2 py-1">
          PASTE & RUN
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="nb-input mb-4 resize-none font-medium text-sm md:text-base placeholder:text-gray-400 placeholder:font-bold"
        />

        {/* Quick Sample Presets */}
        {sampleTexts.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-heading uppercase font-bold text-gray-700 mb-2">
              TRY A QUICK SAMPLE INPUT:
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleTexts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleFillSample(sample.text)}
                  className="px-2.5 py-1 text-xs font-heading font-bold uppercase bg-white hover:bg-[#FFE066] border-2 border-black shadow-[2px_2px_0_#111111] transition-all"
                >
                  ⚡ {sample.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optional fallback test toggle */}
        {showIncompleteOption && (
          <div className="mb-4 p-3 bg-[#FFF9EC] border-2 border-black flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={testIncomplete}
                onChange={(e) => setTestIncomplete(e.target.checked)}
                className="nb-checkbox"
              />
              <span className="font-heading text-xs font-bold uppercase text-black">
                TEST INCOMPLETE EXTRACTION FALLBACK STATE (SHOWS WARNING BANNER)
              </span>
            </label>
            {testIncomplete && <AlertCircle className="w-4 h-4 text-[#FF3B3B]" />}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setInputText('')}
            disabled={!inputText || isLoading}
            className="nb-btn nb-btn-secondary text-xs px-3 py-2 disabled:opacity-50"
          >
            CLEAR INPUT
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="nb-btn text-sm py-3 px-6 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
            {isLoading ? 'PROCESSING...' : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};
