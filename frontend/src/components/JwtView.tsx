"use client"

import React, { useState, useEffect } from "react"
import { Key, ShieldAlert, CheckCircle, AlertCircle, Cpu, FileJson, Sparkles, ShieldCheck, AlertTriangle } from "lucide-react"
import { Card } from "./ui/card"
import { apiService, JWTAnalysisResult } from "@/lib/api"

export function JwtView() {
  const [tokenInput, setTokenInput] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTAwMiIsImVtYWlsIjoiYWRtaW5AZW50ZXJwcmlzZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJ0ZW5hbnRfaWQiOiJ0ZW5fMDAxNCIsImV4cCI6MTgwMTI4NDAwMH0.dummysig"
  )
  const [result, setResult] = useState<JWTAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Run analysis when token changes
  const runAnalysis = async () => {
    if (!tokenInput.trim()) return
    setLoading(true)
    try {
      const res = await apiService.analyzeJWT(tokenInput)
      setResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runAnalysis()
  }, [tokenInput])

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            JWT / Token Vulnerability Analysis
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Decode tokens to audit cryptographic headers, signatures, permissions matrix, and tenant bindings.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Token Paste Card */}
        <Card className="md:col-span-1 space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <FileJson className="w-4 h-4 text-primary" />
            Paste JWT Token
          </h3>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-muted uppercase">Base64 Encoded Token</label>
            <textarea
              rows={8}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="eyJhbGciOi..."
              className="w-full p-3 border border-border rounded-xl bg-slate-50 font-mono text-[10px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all leading-normal"
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-muted font-semibold">Decodes automatically</span>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="text-primary hover:underline font-bold cursor-pointer"
            >
              Force Re-Audit
            </button>
          </div>
        </Card>

        {/* Decoder split view */}
        <Card className="md:col-span-2 space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <Cpu className="w-4 h-4 text-secondary" />
            Decoded Claims
          </h3>

          {loading ? (
            <div className="text-center py-12 text-xs text-muted font-bold animate-pulse">Running cryptographic inspection...</div>
          ) : result ? (
            <div className="grid md:grid-cols-2 gap-4 text-xs font-semibold">
              {/* Header */}
              <div className="space-y-2">
                <span className="text-blue-600 font-bold uppercase tracking-wider text-[9px]">HEADER: Algorithm & Type</span>
                <pre className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl font-mono text-[10px] text-blue-900 whitespace-pre overflow-x-auto">
                  {JSON.stringify(result.header, null, 2)}
                </pre>
              </div>

              {/* Payload */}
              <div className="space-y-2">
                <span className="text-purple-600 font-bold uppercase tracking-wider text-[9px]">PAYLOAD: Identity & Claims</span>
                <pre className="bg-purple-50/40 border border-purple-100 p-4 rounded-xl font-mono text-[10px] text-purple-900 whitespace-pre overflow-x-auto">
                  {JSON.stringify(result.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-muted">Paste a token to inspect elements.</div>
          )}
        </Card>
      </div>

      {/* Security Analysis Vulnerabilities block */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Risk Score */}
        <Card className="md:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-4 border-b border-border pb-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              Token Security Score
            </h3>

            {result && (
              <div className="text-center py-6 space-y-2">
                <span className="text-5xl font-black text-foreground">{result.risk_score}</span>
                <span className="block text-xs uppercase tracking-wider font-bold text-muted">Risk Assessment Rating</span>
                <div className="pt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    result.risk_score > 70 ? 'bg-red-100 text-red-700 border border-red-200' :
                    result.risk_score > 30 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {result.risk_score > 70 ? 'HIGH RISK' : result.risk_score > 30 ? 'MEDIUM RISK' : 'SECURE CONFIG'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Vulnerability Listings */}
        <Card className="md:col-span-2">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-4 border-b border-border pb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Detected Token Vulnerabilities
          </h3>

          <div className="space-y-3">
            {result?.vulnerabilities && result.vulnerabilities.length > 0 ? (
              result.vulnerabilities.map((vuln, idx) => (
                <div key={idx} className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs flex justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-extrabold text-red-900 block">{vuln.type}</span>
                    <p className="text-slate-600 text-[11px] font-medium leading-relaxed">{vuln.description}</p>
                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Remediation:</span>
                      <span className="text-[10px] text-primary font-bold">{vuln.remediation}</span>
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-black uppercase shrink-0 h-fit">
                    {vuln.severity}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-muted flex flex-col items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-green-600 mb-2" />
                <span className="font-bold">No critical cryptographic design flaws detected.</span>
                <span className="text-[10px] text-slate-500 mt-1">Header uses strong signatures, validation exp checks are complete.</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
