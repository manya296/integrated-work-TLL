"use client"

import React, { useState } from "react"
import { Layers, FileCode, CheckCircle, AlertCircle, Play, Globe, Lock, Unlock, Database, ArrowRight } from "lucide-react"
import { Card } from "./ui/card"
import { apiService, Scan } from "@/lib/api"

interface DiscoveryViewProps {
  activeScan: Scan | null;
  onRefreshScan: () => void;
}

export function DiscoveryView({ activeScan, onRefreshScan }: DiscoveryViewProps) {
  const [specSource, setSpecSource] = useState("mock_spec.json")
  const [baseUrl, setBaseUrl] = useState(activeScan?.target || "https://api.example.com")
  const [parsing, setParsing] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState("")

  // Discovered mock endpoints to list out
  const [discoveredEndpoints, setDiscoveredEndpoints] = useState<any[]>([
    { path: "/api/v1/auth/login", method: "POST", has_auth: false, parameters: 2, type: "Auth/Session" },
    { path: "/api/v1/users/me", method: "GET", has_auth: true, parameters: 0, type: "User Profile" },
    { path: "/api/v1/users/{id}", method: "GET", has_auth: true, parameters: 1, type: "User Profile" },
    { path: "/api/v1/payments/refund", method: "POST", has_auth: true, parameters: 2, type: "Transactions" },
    { path: "/api/v1/tenant/{tenantId}/settings", method: "GET", has_auth: true, parameters: 1, type: "Tenant Config" },
    { path: "/api/v1/billing/invoice/pdf", method: "GET", has_auth: true, parameters: 1, type: "Billing Documents" },
    { path: "/api/v1/items/bulk", method: "PUT", has_auth: true, parameters: 0, type: "Inventory" },
  ])

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeScan) {
      setError("Please select or create an active scan first.")
      return
    }

    setParsing(true)
    setError("")
    setResult(null)

    try {
      const resp = await apiService.runDiscovery(activeScan.id, specSource, baseUrl)
      setResult(resp)
      
      // Simulate discovering endpoint mappings
      setTimeout(() => {
        setParsing(false)
        onRefreshScan()
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Failed to trigger discovery engine.")
      setParsing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Endpoint Discovery Engine
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Analyze Swagger/OpenAPI files to harvest paths, query parameters, and session requirements.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Spec upload form */}
        <Card className="md:col-span-1">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-4 border-b border-border pb-2">
            <FileCode className="w-4 h-4 text-primary" />
            Parse Specification File
          </h3>

          <form onSubmit={handleParse} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">Specification Source</label>
              <input
                type="text"
                value={specSource}
                onChange={(e) => setSpecSource(e.target.value)}
                placeholder="mock_spec.json or http://..."
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">Override Target URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com"
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px]"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{result.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={parsing || !activeScan}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {parsing ? "Parsing Spec Schema..." : "Discover & Push Queue"}
              <Play className="w-4 h-4 fill-white" />
            </button>
          </form>
        </Card>

        {/* Discovery stats & path graphs */}
        <Card className="md:col-span-2 flex flex-col justify-between">
          <div className="mb-4 border-b border-border pb-2 flex justify-between items-center">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-secondary" />
              Discovered Route Mapping
            </h3>
            <span className="text-[10px] bg-slate-100 text-muted px-2 py-0.5 rounded font-extrabold">{discoveredEndpoints.length} Routes Identified</span>
          </div>

          {/* Visual representations of routes as small pills */}
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2.5">
            {discoveredEndpoints.map((ep, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                <div className="flex items-center space-x-3 max-w-[70%]">
                  <span className={`text-[9px] px-2 py-1 rounded font-black w-14 text-center ${
                    ep.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    ep.method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-foreground truncate">{ep.path}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] text-muted font-semibold bg-white px-2 py-0.5 rounded border border-border/50">{ep.type}</span>
                  {ep.has_auth ? (
                    <div className="flex items-center gap-1 text-red-600 font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Auth Required</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-600 font-bold">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Public Route</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Discovery Visualization node line */}
      <Card>
        <h3 className="font-extrabold text-foreground text-sm mb-4 border-b border-border pb-2">
          Spec Tree Hierarchy Node Graph
        </h3>
        
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
          {/* Mock Node graph visual representation */}
          <div className="flex items-center space-x-8 md:space-x-16 relative z-10">
            <div className="bg-white border-2 border-primary p-3 rounded-xl shadow text-center z-10">
              <Globe className="w-5 h-5 text-primary mx-auto mb-1" />
              <span className="text-[9px] font-extrabold uppercase font-mono">SPEC ROOT</span>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="bg-white border border-border p-2.5 rounded-xl shadow text-center relative z-10 flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono">/users</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
                <span className="text-[9px] font-black text-red-600 uppercase font-mono bg-red-50 border border-red-100 px-1 py-0.5 rounded">BOLA TARGET</span>
              </div>
              <div className="bg-white border border-border p-2.5 rounded-xl shadow text-center relative z-10 flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono">/payments</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
                <span className="text-[9px] font-black text-amber-600 uppercase font-mono bg-amber-50 border border-amber-100 px-1 py-0.5 rounded">JWT TARGET</span>
              </div>
            </div>
          </div>
          
          {/* Visual vector lines connects items */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <line x1="20%" y1="50%" x2="50%" y2="25%" stroke="#2563EB" strokeWidth="2" />
            <line x1="20%" y1="50%" x2="50%" y2="75%" stroke="#2563EB" strokeWidth="2" />
          </svg>
        </div>
      </Card>
    </div>
  )
}
