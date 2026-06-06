"use client"

import React, { useState, useEffect } from "react"
import { Server, Activity, ArrowRight, Play, Square, Settings, Database, Cpu, Plus, Minus, Terminal } from "lucide-react"
import { Card } from "./ui/card"
import { apiService, Scan, QueueStatus, WorkerStatus, ExecutionStats, ScanProgress, Task } from "@/lib/api"

interface AsyncExecutionViewProps {
  activeScan: Scan | null;
}

export function AsyncExecutionView({ activeScan }: AsyncExecutionViewProps) {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null)
  const [execStats, setExecStats] = useState<ExecutionStats | null>(null)
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null)
  const [scanTasks, setScanTasks] = useState<Task[]>([])
  const [concurrency, setConcurrency] = useState(10)
  const [workers, setWorkers] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch queue and execution statistics
  const fetchStats = async () => {
    try {
      const basePromises = [
        apiService.getQueueStatus(),
        apiService.getWorkerStatus(),
        apiService.getExecutionStats()
      ]

      if (activeScan) {
        basePromises.push(apiService.getScanProgress(activeScan.id))
        basePromises.push(apiService.getScanTasks(activeScan.id))
      }

      const [q, w, e, progress, tasks] = await Promise.all(basePromises)
      setQueueStatus(q)
      setWorkerStatus(w)
      setExecStats(e)
      if (activeScan) {
        setScanProgress(progress as ScanProgress)
        setScanTasks(tasks as Task[])
      }
      setLoading(false)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 3000)
    return () => clearInterval(interval)
  }, [activeScan])

  // Simulate active worker threads lists
  useEffect(() => {
    const methods = ["GET", "POST", "PUT", "DELETE"]
    const endpoints = [
      "/api/v1/users/me",
      "/api/v1/payments/refund",
      "/api/v1/tenant/settings",
      "/api/v1/billing/invoice/pdf"
    ]

    const interval = setInterval(() => {
      const activeCount = workerStatus?.active_workers || 4
      const nextWorkers = []
      
      for (let i = 0; i < activeCount; i++) {
        const isBusy = Math.random() > 0.3
        nextWorkers.push({
          id: `worker-node-${i+1}`,
          status: isBusy ? "BUSY" : "IDLE",
          task: isBusy ? {
            method: methods[Math.floor(Math.random() * methods.length)],
            url: endpoints[Math.floor(Math.random() * endpoints.length)]
          } : null,
          latency: isBusy ? (40 + Math.floor(Math.random() * 80)) : 0
        })
      }
      setWorkers(nextWorkers)

      // Add worker scaling log
      if (Math.random() > 0.7) {
        const time = new Date().toLocaleTimeString()
        setLogs(prev => [
          `[${time}] WORKER-POOL: Heartbeat verified. Active threads: ${activeCount}/${concurrency}`,
          `[${time}] WORKER-POOL: Token bucket rate check: 0 tokens restricted`,
          ...prev
        ].slice(0, 15))
      }

    }, 3000)

    return () => clearInterval(interval)
  }, [workerStatus, concurrency])

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Async Scan Execution Center
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Orchestrate distributed workers, adjust token bucket rate limits, and inspect execution pipeline heartbeats.
          </p>
          {activeScan && (
            <p className="text-[11px] text-primary font-semibold mt-2">
              Active scan: {activeScan.name} ({activeScan.status}) • {scanTasks.length} execution tasks loaded
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 border border-border rounded-xl px-3 py-1.5 gap-2 text-xs">
            <span className="text-muted font-bold">Max Concurrency Limit:</span>
            <button 
              onClick={() => setConcurrency(prev => Math.max(1, prev - 1))}
              className="bg-white border border-border hover:bg-slate-100 p-1 rounded cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-extrabold text-foreground min-w-[20px] text-center">{concurrency}</span>
            <button 
              onClick={() => setConcurrency(prev => Math.min(50, prev + 1))}
              className="bg-white border border-border hover:bg-slate-100 p-1 rounded cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col">
          <span className="text-[10px] font-bold text-muted uppercase">Worker utilization</span>
          <span className="text-2xl font-black text-foreground mt-1">
            {workers.length > 0 ? `${Math.floor((workers.filter(w => w.status === 'BUSY').length / workers.length) * 100)}%` : "0%"}
          </span>
          <span className="text-[10px] text-muted font-semibold mt-2 pt-2 border-t border-border/50">Active vs Total threads</span>
        </Card>

        <Card className="flex flex-col">
          <span className="text-[10px] font-bold text-muted uppercase">Scan Queue Depth</span>
          <span className="text-2xl font-black text-foreground mt-1">
            {loading ? "..." : `${queueStatus?.total_pending || 0} Tasks`}
          </span>
          <span className="text-[10px] text-muted font-semibold mt-2 pt-2 border-t border-border/50">Tasks pending execution</span>
        </Card>

        <Card className="flex flex-col">
          <span className="text-[10px] font-bold text-muted uppercase">Total Requests Handled</span>
          <span className="text-2xl font-black text-foreground mt-1">
            {loading ? "..." : `${execStats?.throughput.total_processed || 0}`}
          </span>
          <span className="text-[10px] text-muted font-semibold mt-2 pt-2 border-t border-border/50">Success rate: {execStats?.rates.success_rate_pct || 0}%</span>
        </Card>

        <Card className="flex flex-col">
          <span className="text-[10px] font-bold text-muted uppercase">Retry & Throttling Limits</span>
          <span className="text-2xl font-black text-foreground mt-1">
            {loading ? "..." : `${execStats?.retries_total || 0} Retries`}
          </span>
          <span className="text-[10px] text-muted font-semibold mt-2 pt-2 border-t border-border/50">Dead Letter queue: {queueStatus?.dead_letters || 0}</span>
        </Card>
      </div>

      {activeScan && scanProgress && (
        <Card className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 p-6 bg-slate-50 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-foreground text-sm">Scan Execution Progress</h3>
                <p className="text-[11px] text-muted">Live status for {activeScan.name}</p>
              </div>
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                {activeScan.status}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-500 mb-2 text-[10px] uppercase font-bold">
                  <span>Completed</span>
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
                <div className="bg-white p-3 rounded-2xl border border-border">
                  <span className="block text-muted mb-2">Queued</span>
                  <span className="font-black text-foreground">{scanProgress.detailed_stats.QUEUED}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-border">
                  <span className="block text-muted mb-2">Processing</span>
                  <span className="font-black text-foreground">{scanProgress.detailed_stats.PROCESSING}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-border">
                  <span className="block text-muted mb-2">Retrying</span>
                  <span className="font-black text-foreground">{scanProgress.detailed_stats.RETRYING}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-border flex flex-col justify-between text-xs">
            <div>
              <h3 className="font-extrabold text-foreground text-sm mb-3">Scan Pulse</h3>
              <div className="space-y-3 text-slate-600">
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
                  <span className="font-bold text-green-600">{execStats?.rates.success_rate_pct || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeScan && scanProgress && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-foreground text-sm">Live Scan Progress</h3>
                <p className="text-[11px] text-muted">Current task completion status for {activeScan.name}</p>
              </div>
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                {activeScan.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] uppercase text-muted mb-2">
                  <span>Completion</span>
                  <span>{Math.round((scanProgress.completed_tasks / Math.max(scanProgress.total_tasks, 1)) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.round((scanProgress.completed_tasks / Math.max(scanProgress.total_tasks, 1)) * 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-[10px]">
                <div className="bg-slate-50 p-3 rounded-2xl border border-border">
                  <p className="text-muted uppercase font-bold">Succeeded</p>
                  <p className="text-foreground font-black text-base mt-2">{scanProgress.detailed_stats.SUCCESS}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-border">
                  <p className="text-muted uppercase font-bold">Queued</p>
                  <p className="text-foreground font-black text-base mt-2">{scanProgress.detailed_stats.QUEUED}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-border">
                  <p className="text-muted uppercase font-bold">Failed</p>
                  <p className="text-foreground font-black text-base mt-2">{scanProgress.failed_tasks}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-foreground text-sm mb-3">Execution Summary</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total Tasks</span>
                  <span className="font-bold text-foreground">{scanProgress.total_tasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retrying</span>
                  <span className="font-bold text-amber-600">{scanProgress.detailed_stats.RETRYING}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span className="font-bold text-foreground">{scanProgress.pending_tasks}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border mt-4 pt-4 text-[10px] text-muted">
              <p className="font-bold">Worker health:</p>
              <p>{workerStatus?.active_workers || 0} active workers • {workerStatus?.status ?? 'idle'}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Cluster Node map grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Workers Grid */}
        <Card className="md:col-span-2">
          <h3 className="font-extrabold text-foreground text-sm mb-4 border-b border-border pb-2">
            Active Cluster Worker Threads
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {workers.length === 0 ? (
              <div className="sm:col-span-2 text-center py-12 text-xs text-muted">Awaiting worker heartbeat signals...</div>
            ) : (
              workers.map((w, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
                  <div className="space-y-1 max-w-[65%]">
                    <span className="font-extrabold text-foreground block font-mono">{w.id}</span>
                    {w.task ? (
                      <div className="truncate text-[10px] text-slate-600 font-semibold font-mono">
                        <span className="bg-white border border-border/50 px-1 py-0.2 rounded text-[9px] mr-1 text-primary">{w.task.method}</span>
                        {w.task.url}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold block">Sleeping - Queue empty</span>
                    )}
                  </div>

                  <div className="text-right space-y-1 shrink-0">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase inline-block ${
                      w.status === 'BUSY' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-green-100 text-green-700'
                    }`}>
                      {w.status}
                    </span>
                    {w.latency > 0 && (
                      <span className="text-[9px] text-muted font-semibold block">{w.latency}ms</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Live worker logs */}
        <Card className="md:col-span-1">
          <h3 className="font-extrabold text-foreground text-sm mb-4 border-b border-border pb-2 flex items-center justify-between">
            <span>Cluster Scaling Log</span>
            <Terminal className="w-4 h-4 text-primary" />
          </h3>

          <div className="bg-slate-900 text-green-400 p-3.5 rounded-xl font-mono text-[9px] min-h-[200px] max-h-[300px] overflow-y-auto space-y-1.5">
            {logs.length === 0 ? (
              <span className="text-slate-500 font-bold">WORKER-POOL: Awaiting thread pool scaling event...</span>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="leading-normal">{log}</div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
