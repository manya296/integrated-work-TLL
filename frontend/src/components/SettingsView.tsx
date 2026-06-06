"use client"

import React, { useState } from "react"
import { Settings, Save, Database, ShieldAlert, Cpu, Lock, Terminal, CheckCircle2 } from "lucide-react"
import { Card } from "./ui/card"

export function SettingsView() {
  const [dbUrl, setDbUrl] = useState("sqlite+aiosqlite:///./test.db")
  const [redisHost, setRedisHost] = useState("localhost")
  const [redisPort, setRedisPort] = useState(6379)
  const [redisDb, setRedisDb] = useState(0)
  
  const [maxConcurrency, setMaxConcurrency] = useState(10)
  const [heartbeatInterval, setHeartbeatInterval] = useState(5)
  const [workerTimeout, setWorkerTimeout] = useState(30)
  
  const [rateLimitMax, setRateLimitMax] = useState(100)
  const [rateLimitWindow, setRateLimitWindow] = useState(60)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Scanner Engine Settings
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Configure target environment credentials, database endpoints, queue limits, and rate limiters.
          </p>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Settings saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid gap-6 md:grid-cols-2 text-xs font-semibold">
        {/* Database & Redis */}
        <Card className="space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <Database className="w-4 h-4 text-primary" />
            Persistence & Queue Layer
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">DATABASE CONNECTION URL</label>
              <input
                type="text"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2">
                <label className="font-bold text-muted uppercase">REDIS HOSTNAME</label>
                <input
                  type="text"
                  value={redisHost}
                  onChange={(e) => setRedisHost(e.target.value)}
                  className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted uppercase">PORT</label>
                <input
                  type="number"
                  value={redisPort}
                  onChange={(e) => setRedisPort(parseInt(e.target.value))}
                  className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground text-center"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">REDIS LOGICAL DATABASE INDEX</label>
              <input
                type="number"
                value={redisDb}
                onChange={(e) => setRedisDb(parseInt(e.target.value))}
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
              />
            </div>
          </div>
        </Card>

        {/* Worker settings */}
        <Card className="space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <Cpu className="w-4 h-4 text-secondary" />
            Worker Pool Scaling
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">MAX CONCURRENCY LIMIT</label>
              <input
                type="number"
                value={maxConcurrency}
                onChange={(e) => setMaxConcurrency(parseInt(e.target.value))}
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-muted uppercase">HEARTBEAT INTERVAL (s)</label>
                <input
                  type="number"
                  value={heartbeatInterval}
                  onChange={(e) => setHeartbeatInterval(parseInt(e.target.value))}
                  className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted uppercase">WORKER TIMEOUT (s)</label>
                <input
                  type="number"
                  value={workerTimeout}
                  onChange={(e) => setWorkerTimeout(parseInt(e.target.value))}
                  className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Token bucket rate limiter */}
        <Card className="space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            Rate Limiter (Token Bucket)
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">MAX REQUEST BUCKET CAP</label>
              <input
                type="number"
                value={rateLimitMax}
                onChange={(e) => setRateLimitMax(parseInt(e.target.value))}
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">REFILL RATE WINDOW (s)</label>
              <input
                type="number"
                value={rateLimitWindow}
                onChange={(e) => setRateLimitWindow(parseInt(e.target.value))}
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
              />
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? "Updating Configurations..." : "Save Configuration Settings"}
            <Save className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
