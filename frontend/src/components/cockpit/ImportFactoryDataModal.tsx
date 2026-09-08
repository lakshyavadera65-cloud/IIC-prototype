import React, { useState, useRef } from 'react';
import {
  ImportScope,
  DuplicateStrategy,
  ImportPreviewResponse,
  ImportConfirmResponse,
} from '../../types';
import {
  previewImportData,
  confirmImportData,
  getTemplateDownloadUrl,
} from '../../services/api';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  ChevronRight,
  Download,
  RefreshCw,
  Layers,
  Cpu,
  Package,
  Calendar,
  Factory,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';

interface ImportFactoryDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (result: ImportConfirmResponse) => void;
}

type WizardStep = 'scope' | 'upload' | 'preview' | 'syncing' | 'complete';

export const ImportFactoryDataModal: React.FC<ImportFactoryDataModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [step, setStep] = useState<WizardStep>('scope');
  const [scope, setScope] = useState<ImportScope>('complete_factory');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('skip');

  // Preview & Result states
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Active sheet tab for Complete Factory preview
  const [activeSheetTab, setActiveSheetTab] = useState<'machines' | 'orders' | 'schedule'>('machines');

  // Confirming state
  const [confirmResult, setConfirmResult] = useState<ImportConfirmResponse | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetWorkflow = () => {
    setStep('scope');
    setSelectedFile(null);
    setPreviewData(null);
    setPreviewError(null);
    setConfirmResult(null);
    setConfirmError(null);
    setDuplicateStrategy('skip');
  };

  const handleClose = () => {
    resetWorkflow();
    onClose();
  };

  // Scope selection
  const handleSelectScope = (newScope: ImportScope) => {
    setScope(newScope);
    setStep('upload');
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      setPreviewError('Please upload a valid CSV (.csv) or Excel (.xlsx) file.');
      return;
    }
    setPreviewError(null);
    setSelectedFile(file);
  };

  // Trigger preview API
  const handleAnalyzeFile = async () => {
    if (!selectedFile) return;
    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      const preview = await previewImportData(selectedFile, scope);
      setPreviewData(preview);
      setStep('preview');
      // Set active tab based on what's available
      if (scope === 'complete_factory') {
        if (preview.parsed_data?.machines?.length) setActiveSheetTab('machines');
        else if (preview.parsed_data?.orders?.length) setActiveSheetTab('orders');
        else if (preview.parsed_data?.schedule?.length) setActiveSheetTab('schedule');
      }
    } catch (err: any) {
      setPreviewError(err.message || 'Failed to analyze uploaded file.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Trigger confirmation API
  const handleConfirmImport = async () => {
    if (!previewData) return;
    setStep('syncing');
    setConfirmError(null);

    try {
      const res = await confirmImportData(scope, duplicateStrategy, previewData.parsed_data);
      setConfirmResult(res);
      setStep('complete');
      onImportSuccess(res);
    } catch (err: any) {
      setConfirmError(err.message || 'Failed to apply imported factory data.');
      setStep('preview');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface-container-low border border-outline-variant/60 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/15 border border-primary/40 rounded-lg text-primary">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono uppercase tracking-wider text-on-surface">
                  Factory Operations Ingestion Engine
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                  FAST ONBOARDING
                </span>
              </div>
              <p className="text-xs font-mono text-on-surface-variant">
                Upload CSV or Excel data to instantly build or scale your PULSE Digital Twin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-2.5 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
            <div
              className={`flex items-center gap-1.5 ${
                step === 'scope' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'scope'
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                1
              </span>
              <span>Scope</span>
            </div>

            <ChevronRight className="h-3.5 w-3.5 text-outline" />

            <div
              className={`flex items-center gap-1.5 ${
                step === 'upload' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'upload'
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                2
              </span>
              <span>Upload</span>
            </div>

            <ChevronRight className="h-3.5 w-3.5 text-outline" />

            <div
              className={`flex items-center gap-1.5 ${
                step === 'preview' || step === 'syncing' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'preview' || step === 'syncing'
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                3
              </span>
              <span>Validate &amp; Preview</span>
            </div>

            <ChevronRight className="h-3.5 w-3.5 text-outline" />

            <div
              className={`flex items-center gap-1.5 ${
                step === 'complete' ? 'text-secondary font-bold' : 'text-on-surface-variant'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'complete'
                    ? 'bg-secondary text-on-secondary font-bold'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                ✓
              </span>
              <span>PULSE Ready</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-outline">
            <span>Supported:</span>
            <span className="text-primary font-semibold">.CSV</span>
            <span>•</span>
            <span className="text-secondary font-semibold">.XLSX</span>
          </div>
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Global Error Banner */}
          {(previewError || confirmError) && (
            <div className="p-3.5 rounded-lg bg-error-container/80 border border-error text-on-error-container text-xs flex items-center gap-3 font-mono shadow-md animate-shake">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <div className="flex-1">
                <span className="font-bold">Ingestion Warning: </span>
                <span>{previewError || confirmError}</span>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 1: CHOOSE IMPORT SCOPE */}
          {/* ==================================================== */}
          {step === 'scope' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-on-surface-variant">
                Select the category of industrial records you want to onboard into the factory model:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Complete Factory Dataset Option */}
                <button
                  type="button"
                  onClick={() => handleSelectScope('complete_factory')}
                  className="relative p-5 rounded-xl text-left transition-all border group bg-surface-container/60 hover:bg-surface-container-high border-secondary/50 hover:border-secondary shadow-lg sm:col-span-2"
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary/20 text-secondary border border-secondary/40 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    RECOMMENDED FOR ONBOARDING
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-secondary/15 text-secondary border border-secondary/30 group-hover:scale-105 transition">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 pr-32">
                      <h3 className="font-bold text-sm text-on-surface font-mono">
                        Import Complete Factory Dataset
                      </h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Upload a multi-sheet Excel workbook (.xlsx) containing <strong className="text-on-surface">Machines</strong>, <strong className="text-on-surface">Orders</strong>, and <strong className="text-on-surface">Schedule</strong>. Instant end-to-end plant initialization.
                      </p>
                      <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-secondary">
                        <span>Auto-detects sheets</span>
                        <span>•</span>
                        <span>Full dependency mapping</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Machines Only */}
                <button
                  type="button"
                  onClick={() => handleSelectScope('machines')}
                  className="p-4 rounded-xl text-left transition-all border bg-surface-container/40 hover:bg-surface-container-high border-outline-variant/40 hover:border-primary group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-primary/15 text-primary border border-primary/30 group-hover:scale-105 transition">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface font-mono">
                        Import Machines &amp; Workstations
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Add CNC mills, lathes, finishing, and assembly stations with throughput capacities and capabilities.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Orders Only */}
                <button
                  type="button"
                  onClick={() => handleSelectScope('orders')}
                  className="p-4 rounded-xl text-left transition-all border bg-surface-container/40 hover:bg-surface-container-high border-outline-variant/40 hover:border-primary group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-tertiary/15 text-tertiary border border-tertiary/30 group-hover:scale-105 transition">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface font-mono">
                        Import Production Orders
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Ingest customer contract batches, quantities, priorities (Critical/High), and delivery deadlines.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Schedule Only */}
                <button
                  type="button"
                  onClick={() => handleSelectScope('schedule')}
                  className="p-4 rounded-xl text-left transition-all border bg-surface-container/40 hover:bg-surface-container-high border-outline-variant/40 hover:border-primary group sm:col-span-2"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-primary/15 text-primary border border-primary/30 group-hover:scale-105 transition">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface font-mono">
                        Import Production Schedule
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Upload operation allocations (CNC machining, finishing, assembly) across machine timelines.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: UPLOAD FILE & TEMPLATES */}
          {/* ==================================================== */}
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Back button & scope label */}
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <button
                  type="button"
                  onClick={() => setStep('scope')}
                  className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant hover:text-primary transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Change Scope</span>
                </button>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-on-surface-variant">Active Target:</span>
                  <span className="font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
                    {scope.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/10 glow-cyan scale-[0.99]'
                    : selectedFile
                    ? 'border-secondary/60 bg-surface-container-high/60'
                    : 'border-outline-variant/50 hover:border-primary/70 bg-surface-container/30 hover:bg-surface-container/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3.5 rounded-full bg-primary/15 text-primary border border-primary/30 animate-pulse">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface font-mono">
                        Drag and drop your factory data file here
                      </p>
                      <p className="text-xs font-mono text-on-surface-variant mt-1">
                        or click to browse your computer
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-outline">
                      <span className="px-2 py-0.5 bg-surface-container rounded border border-outline-variant/30">
                        CSV (.csv)
                      </span>
                      <span className="px-2 py-0.5 bg-surface-container rounded border border-outline-variant/30">
                        Excel (.xlsx)
                      </span>
                      <span>Max size: 10MB</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-col sm:flex-row items-center justify-between w-full p-4 rounded-lg bg-surface-container border border-secondary/40 gap-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded bg-secondary/15 text-secondary border border-secondary/30 shrink-0">
                        {selectedFile.name.endsWith('.csv') ? (
                          <FileText className="h-6 w-6" />
                        ) : (
                          <FileSpreadsheet className="h-6 w-6" />
                        )}
                      </div>
                      <div className="space-y-0.5 text-left">
                        <div className="font-bold text-sm text-on-surface font-mono break-all">
                          {selectedFile.name}
                        </div>
                        <div className="text-[11px] font-mono text-on-surface-variant flex items-center gap-2">
                          <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="uppercase text-secondary font-bold">
                            {selectedFile.name.split('.').pop()}
                          </span>
                          <span>•</span>
                          <span className="text-outline">Ready for validation</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded text-xs font-mono text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 transition"
                      >
                        Replace File
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-1.5 rounded text-error hover:bg-error-container transition"
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Downloads Section */}
              <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-on-surface">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    <span>Need the official format structure?</span>
                  </div>
                  <p className="text-[11px] font-mono text-on-surface-variant">
                    Download sample templates with required column headers and formatted demonstration rows.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getTemplateDownloadUrl(scope, 'csv')}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-on-surface bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 transition"
                  >
                    <Download className="h-3.5 w-3.5 text-primary" />
                    <span>CSV Template</span>
                  </a>
                  <a
                    href={getTemplateDownloadUrl(scope, 'xlsx')}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-on-surface bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 transition"
                  >
                    <Download className="h-3.5 w-3.5 text-secondary" />
                    <span>Excel (.xlsx)</span>
                  </a>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!selectedFile || isLoadingPreview}
                  onClick={handleAnalyzeFile}
                  id="btn-analyze-import"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-on-primary font-mono text-xs font-bold hover:bg-primary-container transition shadow-lg glow-cyan disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoadingPreview ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Parsing &amp; Validating...</span>
                    </>
                  ) : (
                    <>
                      <span>Inspect &amp; Preview Records</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: PREVIEW & VALIDATION RESULTS */}
          {/* ==================================================== */}
          {step === 'preview' && previewData && (
            <div className="space-y-5">
              {/* Telemetry Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant">Detected Records</span>
                  <span className="text-lg font-bold text-primary">{previewData.total_detected}</span>
                </div>

                <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant">Valid Records</span>
                  <span className="text-lg font-bold text-secondary">{previewData.valid_count}</span>
                </div>

                <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant">Duplicates</span>
                  <span className={`text-lg font-bold ${previewData.duplicate_count > 0 ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                    {previewData.duplicate_count}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant">Errors / Blockers</span>
                  <span className={`text-lg font-bold ${previewData.error_count > 0 ? 'text-error' : 'text-secondary'}`}>
                    {previewData.error_count}
                  </span>
                </div>
              </div>

              {/* Complete Factory Sheet Badges */}
              {previewData.sheets_detected && previewData.sheets_detected.length > 0 && (
                <div className="p-3.5 rounded-lg bg-surface-container/60 border border-secondary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-secondary flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Excel Workbook Sheets Detected:
                    </span>
                    <span className="text-[11px] font-mono text-on-surface-variant">
                      {previewData.sheets_detected.length} Sheets Analyzed
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {previewData.sheets_detected.map((s) => (
                      <div
                        key={s.sheet_name}
                        className="px-3 py-1 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-xs flex items-center gap-2"
                      >
                        <span className="font-bold text-on-surface">{s.sheet_name}</span>
                        <span className="text-primary bg-primary/10 px-1.5 py-0.2 rounded text-[10px]">
                          {s.valid_count} records
                        </span>
                        {s.error_count > 0 && (
                          <span className="text-error bg-error/10 px-1.5 py-0.2 rounded text-[10px] font-bold">
                            {s.error_count} err
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sheet tabs if Complete Factory */}
              {scope === 'complete_factory' && (
                <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSheetTab('machines')}
                    className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
                      activeSheetTab === 'machines'
                        ? 'bg-primary text-on-primary font-bold shadow'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Machines ({previewData.parsed_data?.machines?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSheetTab('orders')}
                    className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
                      activeSheetTab === 'orders'
                        ? 'bg-primary text-on-primary font-bold shadow'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Package className="h-3.5 w-3.5" />
                    <span>Orders ({previewData.parsed_data?.orders?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSheetTab('schedule')}
                    className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
                      activeSheetTab === 'schedule'
                        ? 'bg-primary text-on-primary font-bold shadow'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Schedule ({previewData.parsed_data?.schedule?.length || 0})</span>
                  </button>
                </div>
              )}

              {/* Data Table Preview */}
              <div className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest overflow-hidden">
                <div className="px-4 py-2 bg-surface-container/60 border-b border-outline-variant/30 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-on-surface uppercase">
                    Sample Records Preview (First 8 Rows)
                  </span>
                  <span className="text-on-surface-variant text-[11px]">
                    Showing verified fields &amp; types
                  </span>
                </div>

                <div className="max-h-56 overflow-x-auto overflow-y-auto">
                  {(() => {
                    const currentRecords =
                      scope === 'complete_factory'
                        ? previewData.parsed_data?.[activeSheetTab] || []
                        : previewData.parsed_data?.[scope] || previewData.sample_records || [];

                    if (!currentRecords || currentRecords.length === 0) {
                      return (
                        <div className="p-6 text-center text-xs font-mono text-on-surface-variant">
                          No records parsed for this scope.
                        </div>
                      );
                    }

                    const sample = currentRecords.slice(0, 8);
                    const cols = Object.keys(sample[0] || {}).filter(
                      (k) => !['is_custom', 'is_existing', 'notes'].includes(k)
                    );

                    return (
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-surface-container-high/50 text-on-surface-variant text-[11px] border-b border-outline-variant/20 sticky top-0">
                          <tr>
                            <th className="py-2 px-3">STATUS</th>
                            {cols.map((col) => (
                              <th key={col} className="py-2 px-3 uppercase">
                                {col.replace('_', ' ')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          {sample.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-surface-container/40 transition">
                              <td className="py-2 px-3">
                                {row.is_existing ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-tertiary/20 text-tertiary border border-tertiary/40">
                                    CONFLICT
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-secondary/20 text-secondary border border-secondary/40">
                                    VALID
                                  </span>
                                )}
                              </td>
                              {cols.map((col) => {
                                const val = row[col];
                                const displayVal = Array.isArray(val)
                                  ? val.join('; ')
                                  : typeof val === 'boolean'
                                  ? val
                                    ? 'YES'
                                    : 'NO'
                                  : val?.toString() || '—';
                                return (
                                  <td key={col} className="py-2 px-3 text-on-surface truncate max-w-[160px]">
                                    {displayVal}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>

              {/* Validation Issues / Warnings Accordion */}
              {previewData.errors && previewData.errors.length > 0 && (
                <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="flex items-center gap-1.5 text-tertiary">
                      <AlertTriangle className="h-4 w-4" />
                      Issues &amp; Warnings ({previewData.errors.length})
                    </span>
                    <span className="text-on-surface-variant text-[11px]">
                      {previewData.error_count} Blocking • {previewData.warning_count} Warnings
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {previewData.errors.map((err, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1.5 rounded text-[11px] font-mono flex items-start gap-2 ${
                          err.severity === 'error'
                            ? 'bg-error/15 text-on-surface border border-error/30'
                            : 'bg-tertiary/15 text-on-surface border border-tertiary/30'
                        }`}
                      >
                        <span className="font-bold shrink-0 text-primary">
                          Row {err.row}
                          {err.sheet ? ` [${err.sheet}]` : ''}:
                        </span>
                        <span className="flex-1">{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicate Handling Strategy Options */}
              <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30 space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-mono font-bold text-on-surface uppercase">
                    Duplicate Resolution Strategy
                  </h4>
                  <p className="text-[11px] font-mono text-on-surface-variant">
                    How should the system resolve records that share IDs with existing factory entities?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  {/* Skip Option */}
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition ${
                      duplicateStrategy === 'skip'
                        ? 'border-primary bg-primary/10 text-on-surface shadow-sm'
                        : 'border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupStrategy"
                      value="skip"
                      checked={duplicateStrategy === 'skip'}
                      onChange={() => setDuplicateStrategy('skip')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-primary">Skip Duplicates</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">
                        Safe default. Ingest new records only; existing production unchanged.
                      </div>
                    </div>
                  </label>

                  {/* Update Option */}
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition ${
                      duplicateStrategy === 'update'
                        ? 'border-tertiary bg-tertiary/10 text-on-surface shadow-sm'
                        : 'border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupStrategy"
                      value="update"
                      checked={duplicateStrategy === 'update'}
                      onChange={() => setDuplicateStrategy('update')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-tertiary">Update Existing</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">
                        Overwrite existing machine / order attributes with new file data.
                      </div>
                    </div>
                  </label>

                  {/* Reject Option */}
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition ${
                      duplicateStrategy === 'reject'
                        ? 'border-error bg-error/10 text-on-surface shadow-sm'
                        : 'border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupStrategy"
                      value="reject"
                      checked={duplicateStrategy === 'reject'}
                      onChange={() => setDuplicateStrategy('reject')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-error">Strict Reject</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">
                        Abort import completely if any existing IDs are encountered.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant hover:text-on-surface transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Choose Another File</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg text-xs font-mono text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={!previewData.can_import && previewData.error_count > 0}
                    onClick={handleConfirmImport}
                    id="btn-confirm-import"
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-secondary text-on-secondary font-mono text-xs font-bold hover:bg-secondary/90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm &amp; Update Factory Model</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 4: SYNCING IN PROGRESS */}
          {/* ==================================================== */}
          {step === 'syncing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Factory className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-mono text-base font-bold text-on-surface">
                  Updating Factory Intelligence Model...
                </h3>
                <p className="font-mono text-xs text-on-surface-variant max-w-sm">
                  Rebuilding dynamic dependency graph, re-routing alternative workstations, and recalculating Factory Pulse.
                </p>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 5: IMPORT COMPLETE SUMMARY */}
          {/* ==================================================== */}
          {step === 'complete' && confirmResult && (
            <div className="py-6 space-y-6 animate-fade-in text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3.5 rounded-full bg-secondary/15 text-secondary border border-secondary/40 shadow-lg">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="font-mono text-lg font-bold text-secondary uppercase tracking-wider">
                  Factory Intelligence Model Synchronized
                </h3>
                <p className="font-mono text-xs text-on-surface-variant max-w-md">
                  {confirmResult.message}
                </p>
              </div>

              {/* Tally Metrics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-left max-w-2xl mx-auto">
                <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant">Machines Added</span>
                  <span className="text-xl font-bold text-primary">
                    +{confirmResult.machines_added}
                  </span>
                  <span className="text-[10px] text-outline mt-0.5">
                    ({confirmResult.machines_updated} updated)
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant">Orders Ingested</span>
                  <span className="text-xl font-bold text-tertiary">
                    +{confirmResult.orders_added}
                  </span>
                  <span className="text-[10px] text-outline mt-0.5">
                    ({confirmResult.orders_updated} updated)
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant">Schedule Tasks</span>
                  <span className="text-xl font-bold text-primary">
                    +{confirmResult.schedule_added}
                  </span>
                  <span className="text-[10px] text-outline mt-0.5">
                    ({confirmResult.schedule_updated} updated)
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant">New Factory Pulse</span>
                  <span className="text-xl font-bold text-secondary">
                    {confirmResult.pulse_score.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-secondary font-bold uppercase mt-0.5">
                    {confirmResult.pulse_status}
                  </span>
                </div>
              </div>

              {/* Final action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  id="btn-view-updated-factory"
                  className="px-8 py-3 rounded-lg bg-primary text-on-primary font-mono text-xs font-bold hover:bg-primary-container transition shadow-xl glow-cyan cursor-pointer"
                >
                  View Updated Factory Digital Twin →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
