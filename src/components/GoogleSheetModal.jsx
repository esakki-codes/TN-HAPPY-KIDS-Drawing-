import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  X,
  ExternalLink,
  Download,
  Database,
  Link as LinkIcon,
  Check,
  Copy,
  RefreshCw,
  Sparkles,
  Users
} from 'lucide-react';
import {
  getAllRegistrations,
  exportRegistrationsToCSV,
  getGoogleScriptUrl,
  setGoogleScriptUrl,
  DEFAULT_SHEET_URL,
} from '../utils/googleSheet';

export const GoogleSheetModal = ({ isOpen, onClose }) => {
  const [registrations, setRegistrations] = useState([]);
  const [scriptUrl, setScriptUrlInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRegistrations(getAllRegistrations());
      setScriptUrlInput(getGoogleScriptUrl());
    }
  }, [isOpen]);

  const handleSaveUrl = (e) => {
    e.preventDefault();
    setGoogleScriptUrl(scriptUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRefresh = () => {
    setRegistrations(getAllRegistrations());
  };

  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Child Name",
        "Date of Birth",
        "Age",
        "Parent Name",
        "WhatsApp Phone",
        "Parent Email",
        "Drawing File",
        "Video File",
        "Reward Points",
        "Status"
      ]);
    }
    
    // Append Registration Row
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.childName || "",
      data.childDob || "",
      data.childAge || "",
      data.parentName || "",
      data.parentPhone || "",
      data.parentEmail || "",
      data.drawingFileName || "Uploaded",
      data.videoFileName || "Uploaded",
      data.rewardPoints || 100,
      data.status || "Completed"
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl border-4 border-amber-400 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-amber-950"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-xl text-white flex items-center gap-2">
                  <span>Single Google Sheet Registration Master</span>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400">
                    Live Data
                  </span>
                </h3>
                <p className="text-xs text-emerald-100 font-medium">
                  All kid registrations are automatically recorded into a single master sheet
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-emerald-100 hover:text-white hover:bg-emerald-800/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body with scrollable content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-amber-50/40">
            
            {/* Top Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Direct Link to Google Sheet Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-4 sm:p-5 rounded-2xl shadow-lg border-2 border-emerald-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                      📊 Master Google Sheet
                    </span>
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                  </div>
                  <h4 className="font-heading font-extrabold text-base sm:text-lg mb-1">
                    Open Single Google Sheet Document
                  </h4>
                  <p className="text-xs text-emerald-100 mb-4">
                    Access the complete live Google Spreadsheet containing all child registration entries.
                  </p>
                </div>

                <a
                  href={DEFAULT_SHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-200"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-700" />
                  <span>Open Google Sheet Link ↗</span>
                </a>
              </div>

              {/* Download CSV / Refresh Local Database Card */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 sm:p-5 rounded-2xl shadow-lg border-2 border-amber-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Total Registrations: {registrations.length}</span>
                    </span>
                    <button
                      onClick={handleRefresh}
                      className="p-1 hover:bg-white/20 rounded-lg text-amber-100 transition-colors"
                      title="Refresh Registrations Table"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-heading font-extrabold text-base sm:text-lg mb-1">
                    Export Master Data to Excel / CSV
                  </h4>
                  <p className="text-xs text-amber-100 mb-4">
                    Download an offline copy of all registration records directly as a spreadsheet CSV file.
                  </p>
                </div>

                <button
                  onClick={exportRegistrationsToCSV}
                  disabled={registrations.length === 0}
                  className={`w-full py-3 bg-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all border ${
                    registrations.length === 0
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200'
                      : 'text-amber-900 hover:bg-amber-50 border-amber-200 cursor-pointer'
                  }`}
                >
                  <Download className="w-4 h-4 text-orange-600" />
                  <span>Download Excel/CSV File ({registrations.length})</span>
                </button>
              </div>

            </div>

            {/* Registrations Master Table Preview */}
            <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-amber-200 pb-2">
                <h4 className="font-heading font-extrabold text-sm sm:text-base text-amber-950 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Registrations Recorded in Single Master List</span>
                </h4>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {registrations.length} Total Records
                </span>
              </div>

              {registrations.length === 0 ? (
                <div className="py-8 text-center text-amber-800/80">
                  <FileSpreadsheet className="w-12 h-12 text-amber-300 mx-auto mb-2" />
                  <p className="font-bold text-sm">No registrations recorded yet.</p>
                  <p className="text-xs text-amber-700">Submit a registration to see entries populate in real-time!</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-amber-100 text-amber-950 font-extrabold sticky top-0 border-b border-amber-300">
                      <tr>
                        <th className="p-2.5">Date & Time</th>
                        <th className="p-2.5">Child Name</th>
                        <th className="p-2.5">Age / DOB</th>
                        <th className="p-2.5">Parent Name</th>
                        <th className="p-2.5">WhatsApp Phone</th>
                        <th className="p-2.5">Parent Email</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {registrations.map((r, index) => (
                        <tr key={r.id || index} className="hover:bg-amber-50/80 font-medium text-amber-900">
                          <td className="p-2.5 whitespace-nowrap text-[11px] text-amber-800">{r.timestamp}</td>
                          <td className="p-2.5 font-bold text-amber-950">{r.childName}</td>
                          <td className="p-2.5">{r.childAge ? `${r.childAge} yrs` : '-'} ({r.childDob})</td>
                          <td className="p-2.5">{r.parentName}</td>
                          <td className="p-2.5 font-mono text-[11px]">{r.parentPhone}</td>
                          <td className="p-2.5 text-[11px]">{r.parentEmail}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-300 whitespace-nowrap">
                              {r.status || 'Registered'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Optional Google Apps Script Web App Webhook Configuration */}
            <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                <h4 className="font-heading font-extrabold text-sm text-amber-950">
                  Configure Custom Google Sheet Webhook (Optional)
                </h4>
              </div>
              <p className="text-xs text-amber-800 mb-3">
                Paste your Google Apps Script Web App URL below to automatically append incoming form data directly into your personal Google Sheet.
              </p>

              <form onSubmit={handleSaveUrl} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 px-3.5 py-2.5 bg-amber-50/60 rounded-xl border border-amber-300 text-xs text-amber-950 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Saved!
                    </>
                  ) : (
                    'Save Webhook URL'
                  )}
                </button>
              </form>

              {/* Google Apps Script Instructions & Copyable Code */}
              <div className="mt-4 pt-3 border-t border-amber-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-900">
                    📋 Google Apps Script Code (Copy to Google Sheet Extensions -&gt; Apps Script):
                  </span>
                  <button
                    onClick={copyCodeToClipboard}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 text-[10px] font-extrabold rounded-lg border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Apps Script'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36 border border-slate-700 leading-relaxed">
                  {appsScriptCode}
                </pre>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="bg-amber-100 p-4 flex items-center justify-between border-t border-amber-300 shrink-0">
            <span className="text-xs font-bold text-amber-900">
              TN Happy Kids 2026 Registration Master System
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
