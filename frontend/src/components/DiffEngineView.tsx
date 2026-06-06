"use client"

import React, { useState } from "react"
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle, HelpCircle, FileText, Split, AlertTriangle } from "lucide-react"
import { Card } from "./ui/card"
import { apiService, DiffResult } from "@/lib/api"

export function DiffEngineView() {
  const [statusA, setStatusA] = useState(200)
  const [bodyA, setBodyA] = useState(
    JSON.stringify({ id: "usr_1002", email: "admin@enterprise.com", role: "administrator", active: true, balance: 1450.00 }, null, 2)
  )

  const [statusB, setStatusB] = useState(200)
  const [bodyB, setBodyB] = useState(
    JSON.stringify({ id: "usr_1002", email: "admin@enterprise.com", role: "administrator", active: true, balance: 1450.00 }, null, 2)
  )

  const [diffResult, setDiffResult] = useState<DiffResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRunDiff = async () => {
    setLoading(true)
    try {
      const res = await apiService.runDiff(
        { status_code: statusA, body: bodyA },
        { status_code: statusB, body: bodyB }
      )
      setDiffResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Pre-populate BOLA vulnerability case
  const loadBolaCase = () => {
    setStatusA(200)
    setBodyA(JSON.stringify({ id: "usr_1002", email: "admin@enterprise.com", balance: 5000.00 }, null, 2))
    
    setStatusB(200) // Vulnerable - swapped context but still got 200 with matching private fields
    setBodyB(JSON.stringify({ id: "usr_1002", email: "admin@enterprise.com", balance: 5000.00 }, null, 2))
    setDiffResult(null)
  }

  // Pre-populate secure case
  const loadSecureCase = () => {
    setStatusA(200)
    setBodyA(JSON.stringify({ id: "usr_1002", email: "admin@enterprise.com", balance: 5000.00 }, null, 2))
    
    setStatusB(403) // Secure - context swap gets blocked correctly
    setBodyB(JSON.stringify({ error: "Access Denied", code: "AUTH_ERR_01" }, null, 2))
    setDiffResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Split className="w-5 h-5 text-primary" />
            Response Diff & Leakage Engine
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Compare response body payloads side-by-side to find metadata leaks and BOLA indicators.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadBolaCase}
            className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 border border-red-200 rounded-xl font-bold transition-all cursor-pointer"
          >
            Load BOLA Case
          </button>
          <button
            onClick={loadSecureCase}
            className="text-[10px] bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 border border-green-200 rounded-xl font-bold transition-all cursor-pointer"
          >
            Load Secure Case
          </button>
        </div>
      </div>

      {/* Split view inputs */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Request A */}
        <Card className="space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Response A (High Privilege User)
            </h3>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-muted">Status:</span>
              <input
                type="number"
                value={statusA}
                onChange={(e) => setStatusA(parseInt(e.target.value))}
                className="w-14 p-1 border border-border rounded-lg bg-slate-50 font-mono text-[11px] text-center"
              />
            </div>
          </div>

          <textarea
            rows={8}
            value={bodyA}
            onChange={(e) => setBodyA(e.target.value)}
            className="w-full p-3 border border-border rounded-xl bg-slate-50 font-mono text-[10px] focus:outline-none focus:bg-white transition-all leading-normal"
          />
        </Card>

        {/* Request B */}
        <Card className="space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-secondary" />
              Response B (Low Privilege User)
            </h3>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-muted">Status:</span>
              <input
                type="number"
                value={statusB}
                onChange={(e) => setStatusB(parseInt(e.target.value))}
                className="w-14 p-1 border border-border rounded-lg bg-slate-50 font-mono text-[11px] text-center"
              />
            </div>
          </div>

          <textarea
            rows={8}
            value={bodyB}
            onChange={(e) => setBodyB(e.target.value)}
            className="w-full p-3 border border-border rounded-xl bg-slate-50 font-mono text-[10px] focus:outline-none focus:bg-white transition-all leading-normal"
          />
        </Card>
      </div>

      {/* Button to run */}
      <div className="flex justify-center">
        <button
          onClick={handleRunDiff}
          disabled={loading}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer flex items-center gap-1.5"
        >
          {loading ? "Calculating Diff Metrics..." : "Run Diff Audit"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Diff Results Output */}
      {diffResult && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Risk Card */}
          <Card className="md:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-4 border-b border-border pb-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Diff Assessment
              </h3>

              <div className="text-center py-6 space-y-2">
                <span className="text-5xl font-black text-foreground">{diffResult.risk_score}</span>
                <span className="block text-xs uppercase tracking-wider font-bold text-muted">Vulnerability Score</span>
                <div className="pt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    diffResult.leak_detected ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {diffResult.leak_detected ? 'CRITICAL LEAK' : 'AUTHORIZATION SECURE'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Details & Explanations */}
          <Card className="md:col-span-2 space-y-4">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Copilot Diff Analysis
            </h3>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-xl font-semibold">
                <div className="flex items-center gap-1">
                  <span className="text-muted">Status A:</span>
                  <span className="text-foreground">{diffResult.status_a}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted">Status B:</span>
                  <span className="text-foreground">{diffResult.status_b}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted">Status Differs:</span>
                  <span className={diffResult.status_differs ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                    {diffResult.status_differs ? "Yes (Secure)" : "No (Warning)"}
                  </span>
                </div>
              </div>

              {diffResult.leak_detected && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold">{diffResult.leak_type}</span>
                    <p className="text-[11px] text-red-700 font-medium">Request B (viewer role) fetched matching sensitive data keys as Request A (admin). BOLA vulnerability confirmed.</p>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">AI Explanation</span>
                <p className="text-slate-700 text-[11px] font-semibold">{diffResult.explanation}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
