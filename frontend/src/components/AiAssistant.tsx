"use client"

import React, { useState, useEffect, useRef } from "react"
import { Send, Bot, User, Sparkles, Code, Terminal, Shield, ArrowUpRight } from "lucide-react"

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  code?: string;
}

interface AiAssistantProps {
  currentView: string;
  activeScanId?: string;
  onSendQuery?: (query: string) => Promise<string>;
}

export function AiAssistant({ currentView, activeScanId }: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // System suggestions based on the active tab/view
  const getSuggestions = () => {
    switch (currentView) {
      case 'jwt_analysis':
        return [
          "Explain JWT algorithm 'none' risk",
          "How do I prevent signature bypass?",
          "What is HS256 vs RS256?"
        ]
      case 'response_diff':
        return [
          "Explain BOLA data leakage",
          "What does identical status 200 mean in diff?",
          "How to audit BFLA vulnerabilities?"
        ]
      case 'mutation_engine':
        return [
          "How are fuzzed requests generated?",
          "Explain ID mutation rules",
          "What are parameter boundary mutations?"
        ]
      case 'api_crawler':
        return [
          "What is an endpoint tree?",
          "How does the crawler resolve auth routes?",
          "Explain crawler queue depth limits"
        ]
      case 'endpoint_discovery':
        return [
          "How does OpenAPI parser find auth tags?",
          "Can I scan multiple swagger specs?",
          "Explain endpoint risk rating"
        ]
      default:
        return [
          "Summarize my scan findings",
          "Which endpoints have critical risk?",
          "Suggest a remediation strategy for BOLA"
        ]
    }
  }

  // Welcome user and set view-based initialization message
  useEffect(() => {
    let welcomeText = "Hello! I am your AI Security Copilot. I can explain findings, interpret token flaws, perform JSON diffs, and suggest remediation codes."
    
    if (currentView === 'jwt_analysis') {
      welcomeText = "I see you're analyzing JWT tokens. Paste a token in the input card, and I can explain specific claim weaknesses or detail how to verify signatures securely."
    } else if (currentView === 'response_diff') {
      welcomeText = "I'm ready to audit response differences. If the diff highlights matching sensitive keys (like emails or balances) under low-privileged roles, I'll flag it as BOLA."
    } else if (currentView === 'mutation_engine') {
      welcomeText = "The Mutation Engine is running. I can explain parameters under fuzzing and show how headers are swapped to find privilege escalations."
    } else if (currentView === 'async_execution') {
      welcomeText = "I'm monitoring the worker execution thread pools. I can explain latency patterns, token bucket rate limits, or worker scaling policies."
    }

    setMessages([
      { sender: 'ai', text: welcomeText, timestamp: new Date() }
    ])
  }, [currentView])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setTyping(true)

    // Simulate AI response based on message content
    setTimeout(() => {
      let replyText = ""
      let codeBlock = undefined

      const lower = textToSend.toLowerCase()
      if (lower.includes('bola') || lower.includes('broken object')) {
        replyText = "Broken Object Level Authorization (BOLA) occurs when an API endpoint exposes an object ID without verifying authorization. To patch BOLA, ensure all endpoints validate the logged-in user's rights to fetch or update the specific object identifier requested."
        codeBlock = `// Remediating BOLA in Express / NestJS
router.get('/api/v1/users/:id', async (req, res) => {
  const userId = req.params.id;
  const currentUser = req.user; // Set by authentication middleware
  
  // VULNERABLE: Direct database fetch without matching ownership
  // const user = await User.findById(userId);
  
  // SECURE: Enforce authorization check
  if (currentUser.role !== 'admin' && currentUser.id !== userId) {
    return res.status(403).json({ error: "Access Denied: Cannot view other profiles" });
  }
  
  const user = await User.findById(userId);
  res.json(user);
});`
      } else if (lower.includes('none') || lower.includes('signature')) {
        replyText = "JWT Signature Bypass (alg:none) allows an attacker to forge tokens by removing the signature segment and altering the header algorithm parameter. You should explicitly reject 'none' algorithms in your verification middleware."
        codeBlock = `# Secure JWT Decoding in Python (PyJWT)
import jwt

# SECURE: Explicitly declare the accepted algorithms.
# If alg is 'none', decode() raises InvalidAlgorithmError.
decoded = jwt.decode(
    token, 
    key="your-strong-shared-secret", 
    algorithms=["HS256"]
)`
      } else if (lower.includes('remediation') || lower.includes('vulnerability')) {
        replyText = "Based on the security report, your top vulnerabilities are BOLA (severity CRITICAL) and JWT signature algorithm vulnerabilities. I suggest checking authorization middleware configuration files."
      } else {
        replyText = `Understood. I will audit that query for you. In context of the ${currentView.replace('_', ' ')} module, please ensure your endpoints utilize appropriate authorization constraints and token validations. Let me know if you want a code patch template.`
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: replyText,
        timestamp: new Date(),
        code: codeBlock
      }])
      setTyping(false)
    }, 1200)
  }

  return (
    <div className="w-80 border-l border-border bg-white flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-primary/15 p-1.5 rounded-lg border border-primary/20">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Security Copilot</h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-muted font-medium">Ready</span>
            </div>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-primary" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[90%]`}>
              {msg.sender === 'ai' && (
                <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200 mt-1">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-foreground rounded-tl-none'
              }`}>
                {msg.text}
                
                {msg.code && (
                  <div className="mt-3 bg-slate-900 text-slate-100 p-3 rounded-lg border border-slate-800 font-mono text-[9px] overflow-x-auto whitespace-pre">
                    <div className="flex justify-between items-center mb-1 text-[8px] text-slate-400 font-bold border-b border-slate-800 pb-1">
                      <span>REMEDIATION CODE</span>
                      <Code className="w-3.5 h-3.5" />
                    </div>
                    {msg.code}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[9px] text-muted mt-1 px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {typing && (
          <div className="flex items-start space-x-2 max-w-[90%]">
            <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200 mt-1">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-muted font-bold flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-300"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-3 border-t border-border bg-slate-50 space-y-2">
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted px-1 block">SUGGESTED QUESTIONS</span>
        <div className="flex flex-wrap gap-1.5">
          {getSuggestions().map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-[10px] bg-white border border-border hover:border-primary/50 text-slate-700 hover:text-primary px-2.5 py-1.5 rounded-lg transition-all text-left truncate max-w-full cursor-pointer flex items-center justify-between gap-1 group font-medium"
            >
              <span className="truncate">{s}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend(input)
        }}
        className="p-3 border-t border-border flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask copilot..."
          className="flex-1 bg-slate-50 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )
}
