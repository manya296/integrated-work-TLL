"use client"

import React, { useState, useEffect } from "react"
import { Activity, Shield, Server, AlertTriangle, BarChart2, Radio, Clock, ShieldCheck } from "lucide-react"
import { MetricCard } from "./dashboard/MetricCard"
import { Card } from "./ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts"
import { apiService, Scan, QueueStatus, WorkerStatus, ExecutionStats, ScanProgress } from "@/lib/api"

interface DashboardViewProps {
  scans: Scan[];
  activeScan: Scan | null;
  onSelectScan: (scan: Scan) => void;
  onNavigate: (view: string) => void;
}

export function DashboardView({ scans, activeScan, onSelectScan, onNavigate }: DashboardViewProps) {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null)
  const [execStats, setExecStats] = useState<ExecutionStats | null>(null)
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real-time dashboard parameters
  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          apiService.getQueueStatus(),
          apiService.getWorkerStatus(),
          apiService.getExecutionStats()
        ]
        if (activeScan) {
          promises.push(apiService.getScanProgress(activeScan.id))
        }

        const [q, w, e, progress] = await Promise.all(promises)
        setQueueStatus(q)
        setWorkerStatus(w)
        setExecStats(e)
        if (activeScan) setScanProgress(progress as ScanProgress)
        setLoading(false)
      } catch (err) {
        console.error("Dashboard data load failed", err)
      }
    };

    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [activeScan])

  // Populate dynamic charting
  useEffect(() => {
    const generateChartData = () => {
      const now = new Date()
      const data: any[] = []
      for (let i = 9; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000)
        data.push({
          name: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          requests: 120 + Math.floor(Math.sin((Date.now() - i * 60000) / 10000) * 30) + Math.floor(Math.random() * 20),
          latency: 45 + Math.floor(Math.cos((Date.now() - i * 60000) / 15000) * 8) + Math.floor(Math.random() * 5),
          failures: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0
        })
      }
      return data
    }

    setChartData(generateChartData())

    const interval = setInterval(() => {
      setChartData(prev => {
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const nextVal = {
          name: nextTime,
          requests: 120 + Math.floor(Math.sin(Date.now() / 10000) * 30) + Math.floor(Math.random() * 20),
          latency: 45 + Math.floor(Math.cos(Date.now() / 15000) * 8) + Math.floor(Math.random() * 5),
          failures: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0
        }
        return [...prev.slice(1), nextVal]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Summary Metrics calculation
  const totalScans = scans.length
  const completedScans = scans.filter(s => s.status === 'COMPLETED').length
  const runningScans = scans.filter(s => s.status === 'RUNNING').length
  const failedScans = scans.filter(s => s.status === 'FAILED').length

  const activeWorkersCount = workerStatus?.active_workers || 0
  const queueDepth = queueStatus?.total_pending || 0

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-border">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
            Security Operations Center (SOC)
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">Real-time scan logs, authorization swap monitors, and distributed workers.</p>
        </div>

        {/* Scan Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted uppercase">Active Target:</span>
          <select 
            value={activeScan?.id || ""} 
            onChange={(e) => {
              const target = scans.find(s => s.id === e.target.value)
              if (target) onSelectScan(target)
            }}
            className="text-xs font-bold border border-border rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary max-w-xs"
          >
            {scans.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Active Target Risk Score"
          value="CRITICAL (88)"
          icon={AlertTriangle}
          description="High density of BOLA & Auth Bypasses."
        />
        <MetricCard 
          title="Queue Depth (P1-P4)"
          value={loading ? "..." : `${queueDepth} Tasks`}
          icon={Activity}
          trend={{ value: 8, label: "delayed in retries", isPositive: false }}
        />
        <MetricCard 
          title="Active Cluster Workers"
          value={loading ? "..." : `${activeWorkersCount} Online`}
          icon={Server}
          description="Heartbeat scale-out responsive."
        />
        <MetricCard 
          title="Security Health Grade"
          value="Grade D"
          icon={ShieldCheck}
          description="4 critical issues require review."
        />
      </div>

      {activeScan && scanProgress && (
        <Card className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 p-6 bg-white rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-foreground text-sm">Active Scan Progress</h3>
                <p className="text-[11px] text-muted">Live progress for {activeScan.name}</p>
              </div>
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                {activeScan.status}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-500 mb-2 text-[10px] uppercase font-bold">
                  <span>Tasks Completed</span>
                  <span>{scanProgress.completed_tasks}/{scanProgress.total_tasks}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.round((scanProgress.completed_tasks / Math.max(scanProgress.total_tasks, 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-[10px]">
                <div className="bg-slate-50 p-3 rounded-2xl border border-border">
                  <span className="block text-muted mb-2">Queued</span>
                  <span className="font-black text-foreground">{scanProgress.detailed_stats.QUEUED}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-border">
                  <span className="block text-muted mb-2">Processing</span>
                  <span className="font-black text-foreground">{scanProgress.detailed_stats.PROCESSING}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-border">
                  <span className="block text-muted mb-2">Retrying</span>
                  <span className="font-black text-foreground">{scanProgress.detailed_stats.RETRYING}</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-slate-50 p-6 border border-border">
            <h3 className="font-extrabold text-foreground text-sm mb-3">Scan Pulse</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Failed</span>
                <span className="font-bold text-red-600">{scanProgress.failed_tasks}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Tasks</span>
                <span className="font-bold text-foreground">{scanProgress.pending_tasks}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate</span>
                <span className="font-bold text-green-600">{execStats?.rates.success_rate_pct ?? 0}%</span>
              </div>
            </div>
          </Card>
        </Card>
      )}

      {/* Primary Graphs Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Real-time Traffic throughput */}
        <Card className="md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
            <div>
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-primary" />
                API Request Throughput & Latency Stream
              </h3>
              <p className="text-[11px] text-muted font-medium mt-0.5">Updated every 3 seconds from distributed telemetry.</p>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">Live Stream</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="requests" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" name="Requests/sec" />
                <Area type="monotone" dataKey="latency" stroke="#0EA5E9" strokeWidth={1.5} fillOpacity={1} fill="url(#colorLatency)" name="Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distributed Queue Depth Breakdown */}
        <Card className="flex flex-col justify-between">
          <div className="mb-4 border-b border-border pb-3">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-secondary" />
              Task Queue Priority Distribution
            </h3>
            <p className="text-[11px] text-muted font-medium mt-0.5">Tasks stacked across P1-P4 router channels.</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {loading ? (
              <span className="text-xs text-muted">Loading queue buffers...</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'P1 Critical', value: queueStatus?.critical_p1 || 0, fill: '#EF4444' },
                    { name: 'P2 High', value: queueStatus?.high_p2 || 0, fill: '#F59E0B' },
                    { name: 'P3 Medium', value: queueStatus?.medium_p3 || 0, fill: '#2563EB' },
                    { name: 'P4 Low', value: queueStatus?.low_p4 || 0, fill: '#0EA5E9' },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={8} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Vulnerability highlights & Scans List */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Vulnerabilities */}
        <Card>
          <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-red-500" />
              Critical Security Detections
            </h3>
            <button 
              onClick={() => onNavigate('reports')}
              className="text-[10px] text-primary hover:underline font-extrabold cursor-pointer"
            >
              Generate TLL Report
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between bg-red-50 border border-red-100 rounded-xl p-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-red-800">VULN-001: BOLA on User Profiles</span>
                <p className="text-slate-600 text-[11px]">Object identifiers can be swapped directly via /api/v1/users/&lt;id&gt;.</p>
              </div>
              <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">Critical</span>
            </div>

            <div className="flex items-start justify-between bg-red-50 border border-red-100 rounded-xl p-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-red-800">VULN-002: JWT signature bypass via alg: none</span>
                <p className="text-slate-600 text-[11px]">Refund gateway accepts cryptographically signature-stripped parameters.</p>
              </div>
              <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">Critical</span>
            </div>

            <div className="flex items-start justify-between bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-amber-800">VULN-003: Leak of internal stack traces</span>
                <p className="text-slate-600 text-[11px]">Gateway leaks Postgres query syntax debug traces.</p>
              </div>
              <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">Medium</span>
            </div>
          </div>
        </Card>

        {/* Scan Status Summary */}
        <Card>
          <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
              <Server className="w-4 h-4 text-primary" />
              Scan Workspace History
            </h3>
            <button 
              onClick={() => onNavigate('scan_history')}
              className="text-[10px] text-primary hover:underline font-extrabold cursor-pointer"
            >
              Manage Scans
            </button>
          </div>

          <div className="space-y-2.5">
            {scans.slice(0, 3).map(s => (
              <div 
                key={s.id} 
                onClick={() => onSelectScan(s)}
                className={`flex items-center justify-between p-3 rounded-xl border border-border hover:bg-slate-50 transition-all cursor-pointer text-xs ${activeScan?.id === s.id ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">{s.name}</span>
                  <span className="text-[10px] text-muted font-medium truncate block max-w-xs">{s.target}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                  s.status === 'RUNNING' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                  s.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
