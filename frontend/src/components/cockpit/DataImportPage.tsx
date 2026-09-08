import React from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Cpu,
  ClipboardList,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getTemplateDownloadUrl } from '../../services/api';

interface DataImportPageProps {
  onOpenImportModal: () => void;
}

export const DataImportPage: React.FC<DataImportPageProps> = ({ onOpenImportModal }) => {
  const importCards = [
    {
      type: 'machines' as const,
      title: 'Import Machines & Workstations',
      description: 'Bulk onboard CNC mills, robotic arms, EDM cells, laser cutters, and diagnostic stations.',
      icon: Cpu,
      accentColor: '#00F2FE',
      csvTemplate: getTemplateDownloadUrl('machines', 'csv'),
      xlsxTemplate: getTemplateDownloadUrl('machines', 'xlsx'),
    },
    {
      type: 'orders' as const,
      title: 'Import Production Orders',
      description: 'Ingest customer purchase orders, target delivery dates, part numbers, and quantities.',
      icon: ClipboardList,
      accentColor: '#38BDF8',
      csvTemplate: getTemplateDownloadUrl('orders', 'csv'),
      xlsxTemplate: getTemplateDownloadUrl('orders', 'xlsx'),
    },
    {
      type: 'schedule' as const,
      title: 'Import Production Schedule',
      description: 'Load operation dispatch schedules, shift allocations, machine assignments, and durations.',
      icon: Calendar,
      accentColor: '#FFB95F',
      csvTemplate: getTemplateDownloadUrl('schedule', 'csv'),
      xlsxTemplate: getTemplateDownloadUrl('schedule', 'xlsx'),
    },
    {
      type: 'complete_factory' as const,
      title: 'Import Complete Multi-Sheet Factory',
      description: 'Single multi-tab Excel workbook containing Machines, Orders, and Schedule in one unified import.',
      icon: Layers,
      accentColor: '#4EDEA3',
      csvTemplate: getTemplateDownloadUrl('complete_factory', 'csv'),
      xlsxTemplate: getTemplateDownloadUrl('complete_factory', 'xlsx'),
    },
  ];


  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none font-sans text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div>
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-[#00F2FE]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Factory Data Onboarding &amp; Ingestion</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seamlessly onboard existing ERP, MES, and spreadsheet data without manual data entry.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenImportModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F2FE] hover:bg-[#38BDF8] text-[#070D17] font-bold text-xs transition shadow-md self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Launch File Importer</span>
        </button>
      </div>

      {/* 5-Step Ingestion Pipeline Explainer */}
      <div className="p-4 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
          Onboarding Process Pipeline
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          {[
            { step: '01', name: 'Upload Data', desc: 'CSV or .xlsx workbook' },
            { step: '02', name: 'Validate Schema', desc: 'Auto-detect fields & types' },
            { step: '03', name: 'Preview & Conflict', desc: 'Detect duplicate IDs' },
            { step: '04', name: 'Select Strategy', desc: 'Skip, update, or reject' },
            { step: '05', name: 'Sync Digital Twin', desc: 'Graph updated live' },
          ].map((s, i) => (
            <div key={s.step} className="p-3 rounded-lg bg-[#0E1726] border border-[#16253D] flex flex-col items-center">
              <span className="font-mono text-[10px] text-[#00F2FE] font-bold">{s.step}</span>
              <span className="text-xs font-bold text-white mt-1">{s.name}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Import Types & Downloadable Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {importCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.type}
              className="p-5 rounded-xl bg-[#0B1320] border border-[#132238] hover:border-[#1E3557] transition flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center border shrink-0"
                    style={{
                      backgroundColor: `${card.accentColor}15`,
                      borderColor: `${card.accentColor}35`,
                      color: card.accentColor,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{card.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#132238]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-mono">TEMPLATES:</span>
                  <a
                    href={card.csvTemplate}
                    download
                    className="px-2 py-1 rounded bg-[#0E1726] hover:bg-[#132238] text-[10px] font-mono text-slate-300 border border-[#182840] transition flex items-center gap-1"
                  >
                    <Download className="h-2.5 w-2.5" />
                    <span>CSV</span>
                  </a>
                  <a
                    href={card.xlsxTemplate}
                    download
                    className="px-2 py-1 rounded bg-[#0E1726] hover:bg-[#132238] text-[10px] font-mono text-slate-300 border border-[#182840] transition flex items-center gap-1"
                  >
                    <Download className="h-2.5 w-2.5" />
                    <span>Excel (.xlsx)</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={onOpenImportModal}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#00F2FE] hover:underline cursor-pointer"
                >
                  <span>Import Now</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
