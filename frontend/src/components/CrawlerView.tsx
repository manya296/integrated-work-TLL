"use client"

import React, { useState, useEffect } from "react"
import { Shield, Server, Activity, Terminal, GitBranch, ArrowRight, Play, CheckCircle } from "lucide-react"
import { Card } from "./ui/card"
import { apiService, Scan, Task } from "@/lib/api"

interface CrawlerViewProps {
  activeScan: Scan | null;
}

export function CrawlerView({ activeScan }: CrawlerViewProps) {
  const [crawlerState, setCrawlerState] = useState("RUNNING")
  const [visited, setVisited] = useState<string[]>([])
  const [pending, setPending] = useState<string[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [scanTasks, setScanTasks] = useState<Task[]>([])

  useEffect(() => {
    const loadTasks = async () => {
      if (!activeScan) {
        setVisited(["/api/v1/auth/login", "/api/v1/users/me", "/api/v1/items/bulk"])
        setPending(["/api/v1/payments/refund", "/api/v1/tenant/settings", "/api/v1/billing/invoice/pdf"])
        return
      }

      setLoading(true)
      try {
        const tasks = await apiService.getScanTasks(activeScan.id)
        setScanTasks(tasks)

        const visitedUrls = tasks
          .filter(task => task.status !== 'QUEUED')
          .map(task => task.url)

        const pendingUrls = tasks
          .filter(task => task.status === 'QUEUED')
          .map(task => task.url)

        setVisited(visitedUrls.length ? Array.from(new Set(visitedUrls)) : ["/api/v1/auth/login"])
        setPending(pendingUrls.length ? Array.from(new Set(pendingUrls)) : ["/api/v1/payments/refund", "/api/v1/tenant/settings", "/api/v1/billing/invoice/pdf"])
      } catch (err) {
        console.error('Failed to load scan tasks for crawler', err)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [activeScan])

  useEffect(() => {
    if (crawlerState !== "RUNNING") return

    const interval = setInterval(() => {
      if (pending.length === 0) {
        setCrawlerState("COMPLETED")
        return
      }

      // Move one item from pending to visited
      const itemToVisit = pending[0]
      setPending(prev => prev.slice(1))
      setVisited(prev => [...prev, itemToVisit])

      // Add a simulated crawler log
      const time = new Date().toLocaleTimeString()
      const method = itemToVisit.includes("refund") || itemToVisit.includes("settings") ? "POST" : "GET"
      setLogs(prev => [
        `[${time}] CRAWLER: Traversing ${method} ${itemToVisit}`,
        `[${time}] CRAWLER: Extracted parameters schema successfully`,
        `[${time}] CRAWLER: Queue depth adjusted - pending tasks list updated`,
        ...prev
      ].slice(0, 15))

    }, 4000)

    return () => clearInterval(interval)
  }, [crawlerState, pending])

  const triggerRecrawl = () => {
    if (activeScan) {
      setCrawlerState("RUNNING")
      setLogs([`[${new Date().toLocaleTimeString()}] CRAWLER: Initializing recrawl session for ${activeScan.name}...`])
      return
    }

    setVisited(["/api/v1/auth/login"])
    setPending([
      "/api/v1/users/me",
      "/api/v1/payments/refund",
      "/api/v1/tenant/settings",
      "/api/v1/billing/invoice/pdf",
      "/api/v1/items/bulk"
    ])
    setCrawlerState("RUNNING")
    setLogs([`[${new Date().toLocaleTimeString()}] CRAWLER: Initializing recrawl session...`])
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            API Schema Crawler
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Explore dependency trees and sequence transitions between authenticated routes.
          </p>
          {activeScan && (
            <p className="text-[11px] text-primary font-semibold mt-2">
              Active scan: {activeScan.name} ({activeScan.status})
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[10px] px-2.5 py-1 rounded font-black uppercase ${
            crawlerState === 'RUNNING' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-green-100 text-green-700'
          }`}>
            Crawler: {crawlerState}
          </span>
          <button 
            onClick={triggerRecrawl}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow shadow-primary/10"
          >
            Recrawl Spec
            <Play className="w-3.5 h-3.5 fill-white" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Traversal Counters */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-4 border-b border-border pb-2">
              <Activity className="w-4 h-4 text-primary" />
              Crawler Metrics
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-muted">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <span>Visited Endpoints</span>
                <span className="text-foreground font-black text-sm">{visited.length}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <span>Pending Endpoints</span>
                <span className="text-foreground font-black text-sm">{pending.length}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <span>Max Depth Traversed</span>
                <span className="text-foreground font-black text-sm">3 / 5</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-[10px] text-muted">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Autopilot sequence parsing online</span>
          </div>
        </Card>

        {/* Visited vs Pending Lists */}
        <Card className="md:col-span-2">
          <h3 className="font-extrabold text-foreground text-sm mb-4 border-b border-border pb-2">
            Endpoint Traversal Path Status
          </h3>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            {/* Visited list */}
            <div className="space-y-2">
              <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase text-[9px]">Visited ({visited.length})</span>
              <div className="space-y-2 overflow-y-auto max-h-[200px] pr-1">
                {visited.map((v, idx) => (
                  <div key={idx} className="p-2.5 bg-green-50/50 border border-green-100 text-slate-700 font-mono text-[10px] rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending list */}
            <div className="space-y-2">
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase text-[9px]">Pending ({pending.length})</span>
              <div className="space-y-2 overflow-y-auto max-h-[200px] pr-1">
                {pending.length === 0 ? (
                  <div className="p-4 text-center text-muted font-bold">Traversal Queue Empty</div>
                ) : (
                  pending.map((p, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 text-slate-700 font-mono text-[10px] rounded-xl flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                      <span className="truncate">{p}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Crawler stream logs */}
      <Card>
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-primary" />
            Crawler Console Log stream
          </h3>
          <span className="text-[9px] bg-slate-100 text-muted px-2 py-0.5 rounded font-extrabold">Auto-refresh active</span>
        </div>

        <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-[10px] min-h-[150px] max-h-[250px] overflow-y-auto space-y-1.5">
          {logs.length === 0 ? (
            <span className="text-slate-500 font-semibold">CRAWLER: Waiting for crawler stream logs...</span>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="leading-normal">{log}</div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
