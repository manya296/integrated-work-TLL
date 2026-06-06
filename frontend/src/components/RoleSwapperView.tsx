"use client"

import React, { useState } from "react"
import { Users, GitBranch, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Key, Layers } from "lucide-react"
import { Card } from "./ui/card"
import { Scan } from "@/lib/api"

interface RoleSwapperViewProps {
  activeScan: Scan | null;
}

export function RoleSwapperView({ activeScan }: RoleSwapperViewProps) {
  const [roleMatrix, setRoleMatrix] = useState([
    { endpoint: "/api/v1/users/me", method: "GET", sourceRole: "viewer", targetRole: "admin", status: "SUCCESS (SECURE)", bypass: false, detail: "Correctly rejected with 403 Forbidden" },
    { endpoint: "/api/v1/payments/refund", method: "POST", sourceRole: "viewer", targetRole: "admin", status: "BYPASS DETECTED ⚠️", bypass: true, detail: "Refund executed with viewer authentication" },
    { endpoint: "/api/v1/tenant/settings", method: "GET", sourceRole: "anonymous", targetRole: "viewer", status: "SUCCESS (SECURE)", bypass: false, detail: "Anonymous block works correctly" },
    { endpoint: "/api/v1/billing/invoice/pdf", method: "GET", sourceRole: "viewer", targetRole: "editor", status: "BYPASS DETECTED ⚠️", bypass: true, detail: "Can view other client invoices without token validations" },
    { endpoint: "/api/v1/items/bulk", method: "PUT", sourceRole: "editor", targetRole: "admin", status: "SUCCESS (SECURE)", bypass: false, detail: "Rejected correctly" },
  ])

  const [activeSwap, setActiveSwap] = useState<any>(roleMatrix[1])

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User / Role / Tenant Swapping
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Swap authentication contexts (JWT claims and user IDs) across requests to identify Privilege Escalation (BFLA) and BOLA.
          </p>
          {activeScan && (
            <p className="text-[11px] text-primary font-semibold mt-2">
              Analyzing active scan: {activeScan.name} • {activeScan.status}
            </p>
          )}
        </div>
      </div>

      {/* Role mappings node view */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Swapping configuration info card */}
        <Card className="md:col-span-1 space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <GitBranch className="w-4 h-4 text-primary" />
            Active Swapping Profile
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-muted block text-[10px] uppercase font-bold">SOURCE CONTEXT</span>
                <span className="text-foreground text-xs font-extrabold">Viewer (Low Privileged)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-primary" />
              <div className="space-y-0.5 text-right">
                <span className="text-muted block text-[10px] uppercase font-bold">TARGET CONTEXT</span>
                <span className="text-foreground text-xs font-extrabold">Admin (Privileged)</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-2">
              <span className="text-muted block text-[10px] uppercase font-bold">Tenant Boundaries Tested</span>
              <div className="flex items-center gap-2 text-foreground font-bold">
                <span className="bg-white px-2 py-1 border border-border rounded font-mono text-[10px]">tenant_0014</span>
                <span className="text-muted text-[10px]">to</span>
                <span className="bg-white px-2 py-1 border border-border rounded font-mono text-[10px]">tenant_0099</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Access control details */}
        <Card className="md:col-span-2 space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <Layers className="w-4 h-4 text-secondary" />
            Vulnerability Details
          </h3>

          {activeSwap ? (
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-mono text-foreground font-bold">{activeSwap.method} {activeSwap.endpoint}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                  activeSwap.bypass ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {activeSwap.bypass ? 'Vulnerable' : 'Secure'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-muted uppercase">Swap Test Description</span>
                  <p className="text-slate-700 text-[11px] font-semibold">{activeSwap.detail}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-muted uppercase">Remediation Blueprint</span>
                  <p className="text-slate-700 text-[11px] font-semibold">Verify target role privileges inside resource handler before processing database writes.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted">Select a row below to inspect swap outcomes.</div>
          )}
        </Card>
      </div>

      {/* Results grid */}
      <Card>
        <h3 className="font-extrabold text-foreground text-sm mb-4 border-b border-border pb-2">
          Authorization Swapping test matrices
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-medium text-slate-700">
            <thead>
              <tr className="border-b border-border text-muted font-bold text-[10px] uppercase">
                <th className="py-2.5">API Endpoint</th>
                <th className="py-2.5">Source Role</th>
                <th className="py-2.5">Target Role</th>
                <th className="py-2.5">Outcome Status</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {roleMatrix.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => setActiveSwap(item)}
                  className={`border-b border-border/50 hover:bg-slate-50 cursor-pointer ${activeSwap?.endpoint === item.endpoint ? 'bg-primary/5' : ''}`}
                >
                  <td className="py-3 font-mono text-[10px] text-foreground">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black mr-2 ${
                      item.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>{item.method}</span>
                    {item.endpoint}
                  </td>
                  <td className="py-3 font-bold">{item.sourceRole}</td>
                  <td className="py-3 font-bold">{item.targetRole}</td>
                  <td className={`py-3 font-extrabold ${item.bypass ? 'text-red-600' : 'text-green-600'}`}>{item.status}</td>
                  <td className="py-3 text-right">
                    <button className="text-[10px] text-primary font-bold hover:underline">Inspect</button>
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
