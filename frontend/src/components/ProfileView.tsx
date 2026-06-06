"use client"

import React, { useState } from "react"
import { ShieldCheck, Mail, ShieldAlert, Key, RefreshCw, Layers } from "lucide-react"
import { Card } from "./ui/card"

export function ProfileView() {
  const [profile, setProfile] = useState({
    id: "usr_1002",
    name: "David Miller",
    email: "david.m@trustlayer.io",
    role: "Security Engineer",
    apiKey: "tl_live_12c91b44de804a9767ba8bf13dcac18cf77be8e",
    joined: "June 2026",
  })

  const [permissions, setPermissions] = useState([
    { name: "Execute Security Scans", granted: true },
    { name: "Decode Cryptographic Tokens", granted: true },
    { name: "Configure Rate Limiters", granted: true },
    { name: "Edit Database Schema", granted: false },
    { name: "Export Compliance PDF Reports", granted: true }
  ])

  const [resetting, setResetting] = useState(false)

  const handleResetKey = () => {
    setResetting(true)
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        apiKey: `tl_live_${Math.random().toString(36).substr(2, 40)}`
      }))
      setResetting(false)
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            My Security Profile
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Review your credential authorizations, cryptographic keys, and active permission controls.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 text-xs font-semibold">
        {/* Profile Details */}
        <Card className="md:col-span-1 space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <Key className="w-4 h-4 text-primary" />
            Console Account Details
          </h3>

          <div className="space-y-3 font-semibold text-xs">
            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-muted font-bold uppercase tracking-wider text-[9px]">User ID</span>
              <span className="text-foreground font-mono font-bold">{profile.id}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-muted font-bold uppercase tracking-wider text-[9px]">Full Name</span>
              <span className="text-foreground font-bold">{profile.name}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-muted font-bold uppercase tracking-wider text-[9px]">Email Address</span>
              <span className="text-foreground font-mono font-bold">{profile.email}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-muted font-bold uppercase tracking-wider text-[9px]">Security Role</span>
              <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded font-black uppercase">{profile.role}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-muted font-bold uppercase tracking-wider text-[9px]">Member Since</span>
              <span className="text-foreground font-bold">{profile.joined}</span>
            </div>
          </div>
        </Card>

        {/* API Token Key Management */}
        <Card className="md:col-span-2 space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <Layers className="w-4 h-4 text-secondary" />
            API Key & Permission Credentials
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            {/* Key configuration */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <span className="text-muted font-bold uppercase tracking-wider text-[9px] block">Console Secret API Token</span>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={profile.apiKey}
                  className="flex-1 p-2.5 border border-border rounded-xl bg-white font-mono text-[10px] text-foreground select-all focus:outline-none"
                />
                <button
                  onClick={handleResetKey}
                  disabled={resetting}
                  className="bg-white border border-border hover:bg-slate-50 p-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-600 ${resetting ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Permissions list */}
            <div className="space-y-2">
              <span className="text-muted font-bold uppercase tracking-wider text-[9px] block">Role Permissions Matrix</span>
              <div className="grid md:grid-cols-2 gap-3">
                {permissions.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                    <span className="text-slate-700 font-bold">{p.name}</span>
                    {p.granted ? (
                      <span className="text-green-600 font-black flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        Granted
                      </span>
                    ) : (
                      <span className="text-red-500 font-black flex items-center gap-1">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        Restricted
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
