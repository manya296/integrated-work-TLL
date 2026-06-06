"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, Layers, GitBranch, Cpu, Key, Users, Server, Split, FileText, 
  Settings, UserCheck, Activity, Menu, X, LogOut, Sparkles, Terminal, Bell, Globe 
} from "lucide-react"

// Import views
import { LandingPage } from "@/components/LandingPage"
import { Login } from "@/components/Login"
import { AiAssistant } from "@/components/AiAssistant"
import { DashboardView } from "@/components/DashboardView"
import { DiscoveryView } from "@/components/DiscoveryView"
import { CrawlerView } from "@/components/CrawlerView"
import { MutationView } from "@/components/MutationView"
import { JwtView } from "@/components/JwtView"
import { RoleSwapperView } from "@/components/RoleSwapperView"
import { AsyncExecutionView } from "@/components/AsyncExecutionView"
import { DiffEngineView } from "@/components/DiffEngineView"
import { ReportsView } from "@/components/ReportsView"
import { SettingsView } from "@/components/SettingsView"
import { HistoryView } from "@/components/HistoryView"
import { UserManagementView } from "@/components/UserManagementView"
import { ProfileView } from "@/components/ProfileView"

import { apiService, Scan } from "@/lib/api"

export default function App() {
  const [sessionState, setSessionState] = useState<'landing' | 'login' | 'console'>('landing')
  const [currentView, setCurrentView] = useState("executive_dashboard")
  const [scans, setScans] = useState<Scan[]>([])
  const [activeScan, setActiveScan] = useState<Scan | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiOpen, setAiOpen] = useState(true)
  const [systemAlert, setSystemAlert] = useState<string | null>(null)

  // Fetch initial scans list
  const loadScans = async () => {
    try {
      const data = await apiService.getScans()
      setScans(data)
      if (data.length > 0 && !activeScan) {
        setActiveScan(data[0])
      }
    } catch (err) {
      console.error("Scans fetch failed", err)
    }
  }

  useEffect(() => {
    if (sessionState === 'console') {
      loadScans()
    }
  }, [sessionState])

  // Trigger system notification on BOLA discovery
  useEffect(() => {
    if (sessionState !== 'console') return

    const timer = setTimeout(() => {
      setSystemAlert("ALERT: 2 critical BOLA leaks detected on active target payments gateway.")
      setTimeout(() => setSystemAlert(null), 8000)
    }, 15000)

    return () => clearTimeout(timer)
  }, [sessionState])

  // Sidebar menu items
  const menuItems = [
    { id: "executive_dashboard", label: "Executive SOC", icon: Activity, section: "core" },
    { id: "endpoint_discovery", label: "Discovery Engine", icon: Layers, section: "core" },
    { id: "api_crawler", label: "Schema Crawler", icon: GitBranch, section: "core" },
    { id: "mutation_engine", label: "Mutation Fuzzer", icon: Cpu, section: "core" },
    { id: "jwt_analysis", label: "JWT Analyzer", icon: Key, section: "core" },
    { id: "role_swapping", label: "Role Swapper", icon: Users, section: "core" },
    { id: "async_execution", label: "Worker Engine", icon: Server, section: "core" },
    { id: "response_diff", label: "Diff Engine", icon: Split, section: "core" },
    
    { id: "scan_history", label: "Audit Targets", icon: Globe, section: "mgmt" },
    { id: "reports", label: "Security Reports", icon: FileText, section: "mgmt" },
    { id: "user_management", label: "Access Control", icon: UserCheck, section: "mgmt" },
    { id: "profile", label: "My Profile", icon: Shield, section: "mgmt" },
    { id: "settings", label: "Global Settings", icon: Settings, section: "mgmt" }
  ]

  // Render workspace content conditionally
  const renderContent = () => {
    switch (currentView) {
      case "executive_dashboard":
        return <DashboardView scans={scans} activeScan={activeScan} onSelectScan={setActiveScan} onNavigate={setCurrentView} />
      case "endpoint_discovery":
        return <DiscoveryView activeScan={activeScan} onRefreshScan={loadScans} />
      case "api_crawler":
        return <CrawlerView activeScan={activeScan} />
      case "mutation_engine":
        return <MutationView activeScan={activeScan} />
      case "jwt_analysis":
        return <JwtView />
      case "role_swapping":
        return <RoleSwapperView activeScan={activeScan} />
      case "async_execution":
        return <AsyncExecutionView activeScan={activeScan} />
      case "response_diff":
        return <DiffEngineView />
      case "scan_history":
        return <HistoryView scans={scans} activeScan={activeScan} onSelectScan={setActiveScan} onRefreshScans={loadScans} />
      case "reports":
        return <ReportsView activeScan={activeScan} />
      case "user_management":
        return <UserManagementView />
      case "profile":
        return <ProfileView />
      case "settings":
        return <SettingsView />
      default:
        return <DashboardView scans={scans} activeScan={activeScan} onSelectScan={setActiveScan} onNavigate={setCurrentView} />
    }
  }

  // Session routing
  if (sessionState === 'landing') {
    return <LandingPage onLaunch={() => setSessionState('console')} onLogin={() => setSessionState('login')} />
  }

  if (sessionState === 'login') {
    return <Login onLoginSuccess={() => setSessionState('console')} onCancel={() => setSessionState('landing')} />
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between overflow-hidden">
      {/* Top Banner Alert Notification */}
      <AnimatePresence>
        {systemAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] max-w-lg bg-red-600 text-white font-bold text-xs px-6 py-3 rounded-full flex items-center gap-2.5 shadow-2xl shadow-red-500/20"
          >
            <Shield className="w-4.5 h-4.5 animate-bounce" />
            <span>{systemAlert}</span>
            <button onClick={() => setSystemAlert(null)} className="hover:opacity-75 ml-2 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Top Navigation */}
      <header className="sticky top-0 z-40 glass-panel border-b border-border py-3.5 px-6 flex justify-between items-center h-16">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl border border-transparent hover:border-border transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-foreground uppercase">TrustLayer API Studio</span>
              <span className="text-[10px] text-muted font-bold block">ACTIVE WORKSPACE</span>
            </div>
          </div>
        </div>

        {/* System telemetry tags */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs font-bold text-muted bg-slate-50 border border-border px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>ENGINES COMPLIANT</span>
          </div>

          <button 
            onClick={() => setAiOpen(!aiOpen)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              aiOpen ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white border-border hover:border-primary/30 text-slate-600'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          <button 
            onClick={() => setSessionState('landing')}
            className="p-2.5 hover:bg-red-50 hover:border-red-200 border border-transparent rounded-xl text-red-600 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Console Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Menu */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-border bg-white flex flex-col justify-between h-full z-20 shrink-0 select-none"
            >
              <div className="p-4 space-y-6 overflow-y-auto">
                {/* Core security modules */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 block">Core Testing Engines</span>
                  <div className="space-y-1">
                    {menuItems.filter(i => i.section === 'core').map(item => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentView === item.id 
                            ? 'bg-primary text-white shadow shadow-primary/10' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <item.icon className="w-4.5 h-4.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Workspace administration modules */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 block">Management</span>
                  <div className="space-y-1">
                    {menuItems.filter(i => i.section === 'mgmt').map(item => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentView === item.id 
                            ? 'bg-primary text-white shadow shadow-primary/10' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <item.icon className="w-4.5 h-4.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Version indicator */}
              <div className="p-4 border-t border-border bg-slate-50/50 flex items-center justify-between text-[10px] font-bold text-muted">
                <span>SYSTEM v1.0.0</span>
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black">ONLINE</span>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Central Dynamic view board */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {renderContent()}
        </main>

        {/* Right Floating Copilot */}
        <AnimatePresence>
          {aiOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 h-full z-20"
            >
              <AiAssistant currentView={currentView} activeScanId={activeScan?.id} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Footer System Telemetry Status Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-2.5 px-6 text-[10px] font-semibold flex flex-col sm:flex-row justify-between items-center gap-2 select-none z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span>API Gateway Tunnel: Online</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span>Redis Broker: Active</span>
          </div>
        </div>

        <div>
          <span>TrustLayer Labs Security Shield &copy; 2026. Deployment Ready.</span>
        </div>
      </footer>
    </div>
  )
}
