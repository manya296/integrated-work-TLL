"use client"

import React, { useState } from "react"
import { Shield, Key, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"

interface LoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export function Login({ onLoginSuccess, onCancel }: LoginProps) {
  const [email, setEmail] = useState("admin@enterprise.com")
  const [password, setPassword] = useState("••••••••")
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    setTimeout(() => {
      setLoading(false)
      onLoginSuccess()
    }, 800)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center p-6 tech-grid">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Top brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Sign in to console</h2>
          <p className="text-sm text-muted font-medium">Access your enterprise API testing workspace</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3.5 rounded-xl flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Password</label>
              <a href="#" className="text-xs text-primary hover:underline font-semibold">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="border-t border-border/80 my-2 pt-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">API Key / Token (Optional)</label>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-extrabold text-muted">Bypasses Login</span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="tl_live_xxxxxxxxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/3 py-3 border border-border text-foreground hover:bg-slate-50 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Decrypting profile..." : "Enter Workspace"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Branding decoration */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  )
}
