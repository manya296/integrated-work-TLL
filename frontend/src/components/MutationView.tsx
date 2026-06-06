"use client"

import React, { useState, useEffect } from "react"
import { Cpu, ShieldAlert, Zap, Layers, RefreshCw, Terminal, CheckCircle2, Sliders } from "lucide-react"
import { Card } from "./ui/card"
import { apiService, Scan, Task } from "@/lib/api"

interface MutationViewProps {
  activeScan: Scan | null;
}

export function MutationView({ activeScan }: MutationViewProps) {
  const [activeStrategy, setActiveStrategy] = useState("id")
  const [mutationQueue, setMutationQueue] = useState([
    { path: "/api/v1/users/{id}", param: "id", original: "1002", mutated: "1003", strategy: "ID Swap", status: "QUEUED", priority: "P4" },
    { path: "/api/v1/users/{id}", param: "id", original: "1002", mutated: "../admin", strategy: "Path Traversal", status: "PROCESSING", priority: "P4" },
    { path: "/api/v1/payments/refund", param: "amount", original: "150.00", mutated: "-150.00", strategy: "Integer Overflow", status: "QUEUED", priority: "P4" },
    { path: "/api/v1/payments/refund", param: "amount", original: "150.00", mutated: "NaN", strategy: "Type Mutation", status: "SUCCESS", priority: "P4" },
    { path: "/api/v1/tenant/{tenantId}/settings", param: "tenantId", original: "usr_10", mutated: "usr_20", strategy: "Tenant Swap", status: "QUEUED", priority: "P4" },
  ])

  const strategies = [
    { id: "id", name: "ID & BOLA Mutation", desc: "Swaps sequential object identifiers to check for Broken Object Level Authorization checks.", severity: "CRITICAL" },
    { id: "parameter", name: "Parameter Boundary", desc: "Mutates integers to negative, zero, overflows, and floats; strings to nested structures.", severity: "MEDIUM" },
    { id: "header", name: "Header & Auth Swaps", desc: "Modifies Host, Content-Type, and drops Authorization headers entirely to find leaks.", severity: "HIGH" },
    { id: "json", name: "JSON Structure", desc: "Alters JSON payloads into arrays, injects key duplicates, and overrides nested claims.", severity: "HIGH" }
  ]

  useEffect(() => {
    const loadMutationQueue = async () => {
      if (!activeScan) return

      try {
        const tasks = await apiService.getScanTasks(activeScan.id)
        const queue = tasks.map(task => ({
          path: task.url,
          param: task.payload ? Object.keys(task.payload)[0] || "payload" : "id",
          original: task.payload ? JSON.stringify(task.payload).slice(0, 40) : "n/a",
          mutated: task.payload ? JSON.stringify({ ...task.payload, altered: true }).slice(0, 40) : "Injected role swap",
          strategy: task.method === 'GET' ? 'ID & BOLA Mutation' : 'JSON Structure',
          status: task.status,
          priority: 'P3'
        }))

        if (queue.length > 0) {
          setMutationQueue(queue)
        }
      } catch (err) {
        console.error('Unable to load mutation queue from active scan', err)
      }
    }

    loadMutationQueue()
  }, [activeScan])

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Parameter Mutation Engine
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Generate mutated fuzzing payloads from endpoint definitions to locate validation holes.
          </p>
          {activeScan && (
            <p className="text-[11px] text-primary font-semibold mt-2">
              Live task queue for {activeScan.name} ({activeScan.status})
            </p>
          )}
        </div>
      </div>

      {/* Strategies list & details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left selector */}
        <Card className="md:col-span-1">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-4 border-b border-border pb-2">
            <Sliders className="w-4 h-4 text-primary" />
            Fuzzing Strategies
          </h3>
          
          <div className="space-y-2">
            {strategies.map(st => (
              <button
                key={st.id}
                onClick={() => setActiveStrategy(st.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeStrategy === st.id 
                    ? 'bg-primary/5 border-primary/20 text-primary' 
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50 text-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span>{st.name}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                    st.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    st.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {st.severity}
                  </span>
                </div>
                <p className="text-[10px] text-muted font-medium font-normal line-clamp-2">{st.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Mutation Preview comparison */}
        <Card className="md:col-span-2">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-4 border-b border-border pb-2">
            <Zap className="w-4 h-4 text-secondary" />
            Active Mutation payload previews
          </h3>

          <div className="grid md:grid-cols-2 gap-4 text-xs font-medium">
            <div className="space-y-2">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Original JSON Body</span>
              <pre className="bg-slate-50 border border-border p-4 rounded-xl font-mono text-[10px] text-slate-700 whitespace-pre overflow-x-auto min-h-[140px]">
{`{
  "user_id": 1002,
  "action": "refund_transaction",
  "data": {
    "transaction_id": "tx_99201",
    "amount": 150.00
  }
}`}
              </pre>
            </div>

            <div className="space-y-2">
              <span className="text-primary font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                Mutated Fuzzing JSON Body
              </span>
              <pre className="bg-primary/5 border border-primary/20 p-4 rounded-xl font-mono text-[10px] text-foreground whitespace-pre overflow-x-auto min-h-[140px]">
{`{
  "user_id": "../admin", 
  "action": "refund_transaction",
  "data": {
    "transaction_id": "tx_99201",
    "amount": -150.00 
  }
}`}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      {/* Mutation queue table */}
      <Card>
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            Generated Mutation Fuzz Queue
          </h3>
          <span className="text-[10px] bg-slate-100 text-muted px-2 py-0.5 rounded font-extrabold">{mutationQueue.length} Mutations In Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium text-slate-700">
            <thead>
              <tr className="border-b border-border text-muted font-bold text-[10px] uppercase">
                <th className="py-2.5">Endpoint</th>
                <th className="py-2.5">Target Param</th>
                <th className="py-2.5">Original</th>
                <th className="py-2.5">Mutated Fuzz</th>
                <th className="py-2.5">Strategy</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {mutationQueue.map((mut, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-slate-50/50">
                  <td className="py-3 font-mono text-[10px] text-foreground">{mut.path}</td>
                  <td className="py-3 font-bold">{mut.param}</td>
                  <td className="py-3 font-mono text-[10px] text-muted">{mut.original}</td>
                  <td className="py-3 font-mono text-[10px] text-red-600 font-extrabold bg-red-50/30 px-1 py-0.5 rounded">{mut.mutated}</td>
                  <td className="py-3">{mut.strategy}</td>
                  <td className="py-3 text-right">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                      mut.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                      mut.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-slate-100 text-muted'
                    }`}>
                      {mut.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
