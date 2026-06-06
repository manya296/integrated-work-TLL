"use client"

import React, { useState, useEffect } from "react"
import { Shield, FileText, Download, AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from "lucide-react"
import { Card } from "./ui/card"
import { apiService, Scan } from "@/lib/api"

interface ReportsViewProps {
  activeScan: Scan | null;
}

export function ReportsView({ activeScan }: ReportsViewProps) {
  const [report, setReport] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeIssue, setActiveIssue] = useState<any | null>(null)

  const fetchReport = async () => {
    if (!activeScan) return
    setLoading(true)
    try {
      const res = await apiService.getReport(activeScan.id)
      setReport(res)
      if (res?.vulnerabilities && res.vulnerabilities.length > 0) {
        setActiveIssue(res.vulnerabilities[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [activeScan])

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            TLL-Alpha Security Reports
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Generate and view automated vulnerability findings for API authorization and access control assessments.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="bg-white border border-border hover:bg-slate-50 text-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Report
          </button>
          <button
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow shadow-primary/10"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-xs text-muted font-bold animate-pulse">Running security analysis & generating report...</div>
      ) : report ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Findings List */}
          <Card className="md:col-span-1 space-y-4">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
              <FileText className="w-4 h-4 text-primary" />
              Identified Vulnerabilities
            </h3>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {report.vulnerabilities.map((vuln: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveIssue(vuln)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    activeIssue?.id === vuln.id
                      ? 'bg-primary/5 border-primary/20 text-primary'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[10px] text-muted">{vuln.id}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                      vuln.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      vuln.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {vuln.severity}
                    </span>
                  </div>
                  <h4 className="font-extrabold truncate text-foreground">{vuln.title}</h4>
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-1 font-mono">
                    <span className="bg-white border border-border/50 px-1 rounded">{vuln.method}</span>
                    <span className="truncate">{vuln.path}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Finding Details */}
          <Card className="md:col-span-2 space-y-4">
            {activeIssue ? (
              <div className="space-y-4 text-xs font-medium leading-relaxed">
                <div className="flex justify-between items-start border-b border-border pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-muted">{activeIssue.id}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        activeIssue.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        activeIssue.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {activeIssue.severity} (CVSS {activeIssue.cvss})
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-foreground">{activeIssue.title}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] font-bold uppercase">Endpoint Path</span>
                    <span className="font-mono font-bold text-foreground block truncate mt-0.5">{activeIssue.path}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-bold uppercase">HTTP Method</span>
                    <span className="font-mono font-bold text-foreground block mt-0.5">{activeIssue.method}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-bold uppercase">Impact Level</span>
                    <span className="font-bold text-red-600 block mt-0.5">{activeIssue.impact}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Description & Evidence</span>
                  <p className="text-slate-700 text-[11px] leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl font-semibold">
                    {activeIssue.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-primary font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    Remediation blueprint
                  </span>
                  <p className="text-slate-700 text-[11px] leading-relaxed bg-primary/5 border border-primary/20 p-3 rounded-xl font-semibold">
                    {activeIssue.remediation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-muted">Select an issue from the sidebar to inspect parameters.</div>
            )}
          </Card>
        </div>
      ) : (
        <Card className="text-center py-16 text-xs text-muted flex flex-col items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <span className="font-bold">No active reports generated.</span>
          <span className="text-[10px] text-slate-500 mt-1">Select a valid target or create a scan first.</span>
        </Card>
      )}
    </div>
  )
}
