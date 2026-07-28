import React, { useState } from 'react';
import { LETTER_TEMPLATES } from '../data/initialMockData';
import { LetterTemplate, SavedDraft } from '../types';
import { generateLetterDraft } from '../services/mockLetterDraft';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import {
  FileEdit,
  Home,
  Calendar,
  Building,
  Briefcase,
  Copy,
  Check,
  RotateCcw,
  Save,
  Search,
  Trash2,
  FileText,
  Eye,
} from 'lucide-react';

interface LetterDrafterPageProps {
  savedDrafts: SavedDraft[];
  onSaveDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (id: string) => void;
}

export const LetterDrafterPage: React.FC<LetterDrafterPageProps> = ({
  savedDrafts,
  onSaveDraft,
  onDeleteDraft,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [fieldInputs, setFieldInputs] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraftText, setGeneratedDraftText] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  // Search filter for saved drafts
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDraft, setPreviewDraft] = useState<SavedDraft | null>(null);

  const iconMap: Record<string, React.ReactNode> = {
    Home: <Home className="w-6 h-6 stroke-[2.5]" />,
    Calendar: <Calendar className="w-6 h-6 stroke-[2.5]" />,
    Building: <Building className="w-6 h-6 stroke-[2.5]" />,
    Briefcase: <Briefcase className="w-6 h-6 stroke-[2.5]" />,
  };

  const handleSelectTemplate = (tpl: LetterTemplate) => {
    setSelectedTemplate(tpl);
    setFieldInputs({});
    setGeneratedDraftText(null);
  };

  const handleInputChange = (key: string, value: string) => {
    setFieldInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsGenerating(true);
    setGeneratedDraftText(null);

    try {
      const draftText = await generateLetterDraft(selectedTemplate.id, fieldInputs);
      setGeneratedDraftText(draftText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraftText) return;
    navigator.clipboard.writeText(generatedDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!selectedTemplate || !generatedDraftText) return;

    const newDraft: SavedDraft = {
      id: `draft-${Date.now()}`,
      templateId: selectedTemplate.id,
      templateTitle: selectedTemplate.title,
      date: new Date().toISOString().split('T')[0],
      inputs: fieldInputs,
      generatedText: generatedDraftText,
    };

    onSaveDraft(newDraft);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const filteredSavedDrafts = savedDrafts.filter(
    (draft) =>
      draft.templateTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.generatedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#FF6B6B] border-4 border-black p-5 md:p-6 shadow-[6px_6px_0_#111111]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-heading text-xs font-black uppercase bg-black text-[#FF6B6B] px-2 py-0.5">
            MODULE 2
          </span>
          <span className="font-heading text-xs font-bold uppercase text-black">
            LETTER & MESSAGE DRAFTER
          </span>
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-black uppercase text-black">
          FORMAL CORRESPONDENCE GENERATOR
        </h1>
        <p className="font-medium text-black/90 text-sm mt-1">
          Select a template, fill key parameters, and generate polished complaint letters, leave notices, or society requests instantly.
        </p>
      </div>

      {/* STEP 1: Template Selection Grid */}
      <div className="nb-card p-5 md:p-6 bg-white">
        <div className="border-b-3 border-black pb-3 mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-black uppercase text-black flex items-center gap-2">
            <span className="bg-[#FFE066] border-2 border-black px-2 py-0.5 text-xs">
              STEP 1
            </span>
            CHOOSE LETTER TEMPLATE
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LETTER_TEMPLATES.map((tpl) => {
            const isSelected = selectedTemplate?.id === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-4 border-3 border-black shadow-[4px_4px_0_#111111] cursor-pointer transition-all ${
                  isSelected ? 'bg-[#FFE066] translate-x-1 translate-y-1 shadow-[2px_2px_0_#111111]' : 'bg-[#FFF9EC] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white border-2 border-black shadow-[2px_2px_0_#111111]">
                    {iconMap[tpl.iconName] || <FileText className="w-6 h-6 stroke-[2.5]" />}
                  </div>
                  <span className="font-heading text-[10px] font-black uppercase bg-black text-white px-1.5 py-0.5">
                    {tpl.category}
                  </span>
                </div>

                <h3 className="font-heading text-base font-black uppercase text-black mb-1">
                  {tpl.title}
                </h3>
                <p className="text-xs font-medium text-gray-700">
                  {tpl.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2 & 3: Form Input & Generated Draft Output */}
      {selectedTemplate && (
        <div className="nb-card p-5 md:p-6 bg-[#FFF9EC] border-3 border-black">
          <div className="border-b-3 border-black pb-3 mb-6 flex items-center justify-between">
            <h2 className="font-heading text-lg font-black uppercase text-black flex items-center gap-2">
              <span className="bg-[#FF6B6B] border-2 border-black px-2 py-0.5 text-xs">
                STEP 2
              </span>
              ENTER DETAILS FOR: {selectedTemplate.title.toUpperCase()}
            </h2>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-xs font-heading font-bold uppercase underline text-black hover:bg-[#FFE066] p-1"
            >
              CHANGE TEMPLATE
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTemplate.fields.map((field) => (
                <div key={field.key}>
                  <label className="block font-heading text-xs font-black uppercase mb-1 text-black">
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    required
                    value={fieldInputs[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="nb-input text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="nb-btn py-3 px-6 text-sm"
              >
                <FileEdit className="w-5 h-5 stroke-[2.5]" />
                {isGenerating ? 'GENERATING DRAFT...' : 'GENERATE FORMAL DRAFT'}
              </button>
            </div>
          </form>

          {/* Loading state during generation */}
          {isGenerating && <LoadingState message="WRITING POLISHED LETTER DRAFT..." />}

          {/* STEP 3: Generated Result Card */}
          {generatedDraftText && !isGenerating && (
            <div className="mt-6 pt-6 border-t-3 border-black bg-white p-5 border-3 shadow-[5px_5px_0_#111111]">
              <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
                <span className="font-heading text-xs font-black uppercase bg-[#2ECC71] text-white px-2 py-1 border border-black shadow-[2px_2px_0_#111111]">
                  GENERATED DRAFT (EDITABLE)
                </span>
                {savedNotification && (
                  <span className="font-heading text-xs font-black uppercase bg-[#FFE066] text-black px-2 py-1 border border-black">
                    ✓ SAVED TO DRAFTS!
                  </span>
                )}
              </div>

              <textarea
                value={generatedDraftText}
                onChange={(e) => setGeneratedDraftText(e.target.value)}
                rows={12}
                className="nb-input font-mono text-sm leading-relaxed p-4 mb-4 whitespace-pre-wrap resize-y"
              />

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="nb-btn nb-btn-secondary text-xs px-4 py-2"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  REGENERATE
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="nb-btn nb-btn-teal text-xs px-4 py-2"
                >
                  {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                  {copied ? 'COPIED TO CLIPBOARD!' : 'COPY TEXT'}
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="nb-btn nb-btn-success text-xs px-5 py-2"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  SAVE DRAFT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SAVED DRAFTS SECTION */}
      <div className="nb-card p-5 md:p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#4ECDC4] p-1.5 border-2 border-black">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="font-heading text-lg md:text-xl font-black uppercase text-black">
              SAVED LETTER DRAFTS ({savedDrafts.length})
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH DRAFTS..."
              className="nb-input text-xs py-1.5 pl-8 pr-3"
            />
            <Search className="w-4 h-4 text-black absolute left-2.5 top-2.5 stroke-[2.5]" />
          </div>
        </div>

        {filteredSavedDrafts.length === 0 ? (
          <EmptyState
            title="NO SAVED DRAFTS"
            message="No saved letter drafts match your search. Generate a letter above and save it here!"
            icon={<FileEdit className="w-8 h-8 stroke-[2.5]" />}
          />
        ) : (
          <div className="space-y-4">
            {filteredSavedDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-4 bg-[#FFF9EC] border-3 border-black shadow-[4px_4px_0_#111111]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 border-b-2 border-black/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-black uppercase bg-[#FFE066] border border-black px-2 py-0.5">
                      {draft.templateTitle}
                    </span>
                    <span className="text-xs font-bold text-gray-600">
                      SAVED ON: {draft.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDraft(previewDraft?.id === draft.id ? null : draft)}
                      className="nb-btn nb-btn-secondary text-xs px-2.5 py-1"
                    >
                      <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                      {previewDraft?.id === draft.id ? 'HIDE' : 'VIEW FULL'}
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(draft.generatedText);
                        alert('Copied to clipboard!');
                      }}
                      className="nb-btn nb-btn-teal text-xs px-2.5 py-1"
                    >
                      <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      COPY
                    </button>

                    <button
                      onClick={() => onDeleteDraft(draft.id)}
                      className="nb-btn nb-btn-coral p-1.5 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                <div className="font-mono text-xs text-gray-800 line-clamp-3 bg-white p-3 border-2 border-black">
                  {draft.generatedText}
                </div>

                {/* Expanded View */}
                {previewDraft?.id === draft.id && (
                  <div className="mt-4 p-4 bg-white border-2 border-black shadow-[3px_3px_0_#111111]">
                    <div className="font-heading text-xs font-black uppercase mb-2 text-black">
                      FULL GENERATED TEXT:
                    </div>
                    <pre className="font-mono text-xs text-black whitespace-pre-wrap leading-relaxed">
                      {draft.generatedText}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
