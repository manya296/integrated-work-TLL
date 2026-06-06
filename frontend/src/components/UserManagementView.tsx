"use client"

import React, { useState } from "react"
import { Users, UserPlus, Key, ShieldCheck, Mail, ShieldAlert, CheckCircle2 } from "lucide-react"
import { Card } from "./ui/card"

export function UserManagementView() {
  const [users, setUsers] = useState([
    { id: "usr_1001", name: "Sarah Jenkins", email: "sarah.j@trustlayer.io", role: "Administrator", token: "tl_live_88a91x", status: "Active" },
    { id: "usr_1002", name: "David Miller", email: "david.m@trustlayer.io", role: "Security Engineer", token: "tl_live_12c91b", status: "Active" },
    { id: "usr_1003", name: "Elena Rostova", email: "elena.r@trustlayer.io", role: "Developer", token: "tl_live_44p00a", status: "Active" },
    { id: "usr_1004", name: "Guest Audit", email: "guest.auditor@enterprise.com", role: "Auditor", token: "tl_live_77q12x", status: "Active" }
  ])

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("Security Engineer")
  const [success, setSuccess] = useState(false)

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    const newUser = {
      id: `usr_${Math.floor(Math.random() * 9000) + 1000}`,
      name,
      email,
      role,
      token: `tl_live_${Math.random().toString(36).substr(2, 6)}`,
      status: "Active"
    }

    setUsers(prev => [...prev, newUser])
    setName("")
    setEmail("")
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User & Access Management
          </h2>
          <p className="text-xs text-muted font-semibold mt-1">
            Grant dashboard credentials, configure API access tokens, and define role-based access policies.
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            User added successfully!
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3 text-xs font-semibold">
        {/* Create User Form */}
        <Card className="md:col-span-1 space-y-4">
          <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border pb-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Add Console User
          </h3>

          <form onSubmit={handleAddUser} className="space-y-4 font-semibold text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 text-foreground font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">Corporate Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena.r@trustlayer.io"
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 font-mono text-[11px] text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted uppercase">Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 border border-border rounded-xl bg-slate-50 text-foreground font-bold"
              >
                <option>Administrator</option>
                <option>Security Engineer</option>
                <option>Developer</option>
                <option>Auditor</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Provision Credentials
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        </Card>

        {/* Users Table */}
        <Card className="md:col-span-2">
          <h3 className="font-extrabold text-foreground text-sm mb-4 border-b border-border pb-2">
            Active Accounts & API Keys
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-medium text-slate-700">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5">Access Token</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-foreground">{u.name}</td>
                    <td className="py-3 font-mono text-[10px] text-muted">{u.email}</td>
                    <td className="py-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        u.role === 'Administrator' ? 'bg-red-100 text-red-700' :
                        u.role === 'Security Engineer' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-muted">{u.token}</td>
                    <td className="py-3 text-right">
                      <span className="bg-green-100 text-green-700 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                        {u.status}
                      </span>
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
