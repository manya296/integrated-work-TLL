"use client"

import React, { useState, useEffect } from "react"
import { Shield, Play, Plus, Server, Activity, Calendar, Trash2, ArrowRight } from "lucide-react"
import { Card } from "./ui/card"
import { apiService, Scan } from "@/lib/api"

interface HistoryViewProps {
  scans: Scan[];
  activeScan: Scan | null;
  onSelectScan: (scan: Scan) => void;
  onRefreshScans: () => void;
}

export function HistoryView({ scans, activeScan, onSelectScan, onRefreshScans }: HistoryViewProps) {
  const [newScanName, setNewScanName] = useState("Corporate Payments Gateway API Audit")
  const [newScanTarget, setNewScanTarget] = useState("https://payments.enterprise.com/api/v1")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const handleCreateScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newScanName.trim() || !newScanTarget.trim()) return

    setCreating(true)
    setError("")

    try {
      const created = await apiService.createScan(newScanName, newScanTarget)
      onSelectScan(created)
      onRefreshScans()
      
      // Reset form
      setNewScanName("New API Target Scan")
      setNewScanTarget("https://")
    } catch (err: any) {
      setError(err.message || "Failed to initialize scan.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Audit Target History
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Initiate new scans, review targets, and track history across your workspace.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Create Scan Form */}
        <Card className="md:col-span-1 space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <Plus className="w-4 h-4 text-primary" />
            Launch New Security Scan
          </h3>

          <form onSubmit={handleCreateScan} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">Audit Scan Title</label>
              <input
                type="text"
                value={newScanName}
                onChange={(e) => setNewScanName(e.target.value)}
                placeholder="e.g. Production OAuth Gateway"
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 text-foreground font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">Target Base URL / Swagger spec</label>
              <input
                type="text"
                value={newScanTarget}
                onChange={(e) => setNewScanTarget(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
              />
            </div>

            {error && <div className="text-red-600 font-bold">{error}</div>}

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {creating ? "Launching Scan Engines..." : "Initialize Scan Workspace"}
              <Play className="w-4 h-4 fill-white" />
            </button>
          </form>
        </Card>

        {/* History Table */}
        <Card className="md:col-span-2">
          <h3 className="font-extrabold text-foreground text-sm mb-4 border-b border-border pb-2">
            Registered Target Workspaces
          </h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-medium text-slate-700">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase">
                  <th className="py-2.5">Scan Title</th>
                  <th className="py-2.5">Base Endpoint Target</th>
                  <th className="py-2.5">Date Created</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => (
                  <tr 
                    key={s.id} 
                    className={`border-b border-border/50 hover:bg-slate-50 ${activeScan?.id === s.id ? 'bg-primary/5 border-primary/20' : ''}`}
                  >
                    <td className="py-3 font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-4.5 h-4.5 text-primary shrink-0" />
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-muted truncate max-w-xs">{s.target}</td>
                    <td className="py-3 text-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        s.status === 'RUNNING' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                        s.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onSelectScan(s)}
                          className="text-[10px] bg-white border border-border hover:border-primary/50 text-slate-700 hover:text-primary px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold"
                        >
                          Select
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
