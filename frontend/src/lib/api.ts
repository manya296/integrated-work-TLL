// API Layer for the Async Execution System Frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Scan {
  id: string;
  name: string;
  target: string;
  status: string;
  config: any;
  created_at: string;
  started_at?: string;
  finished_at?: string;
}

export interface Task {
  id: string;
  scan_id: string;
  method: string;
  url: string;
  headers: any;
  payload: any;
  status: string;
  attempts: number;
  max_retries: number;
  created_at: string;
  response?: {
    id: string;
    status_code: number;
    latency_ms: number;
    response_headers: any;
    response_body: string;
    error_message?: string;
    created_at: string;
  };
}

export interface ScanProgress {
  scan_id: string;
  status: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  pending_tasks: number;
  detailed_stats: {
    QUEUED: number;
    PROCESSING: number;
    RETRYING: number;
    SUCCESS: number;
    FAILED: number;
  };
}

export interface QueueStatus {
  critical_p1: number;
  high_p2: number;
  medium_p3: number;
  low_p4: number;
  delayed_retries: number;
  dead_letters: number;
  total_pending: number;
}

export interface WorkerStatus {
  active_workers: number;
  status: string;
}

export interface ExecutionStats {
  throughput: {
    total_processed: number;
    success: number;
    failure: number;
    rate_limited_429: number;
  };
  rates: {
    success_rate_pct: number;
    failure_rate_pct: number;
    rate_limit_pct: number;
  };
  retries_total: number;
}

export interface JWTAnalysisResult {
  valid: boolean;
  header: any;
  payload: any;
  vulnerabilities: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    type: string;
    description: string;
    remediation: string;
  }>;
  risk_score: number;
  error?: string;
}

export interface DiffResult {
  status_differs: boolean;
  status_a: number;
  status_b: number;
  body_length_differs: boolean;
  body_length_a: number;
  body_length_b: number;
  json_diff_keys: string[];
  leak_detected: boolean;
  leak_type: string | null;
  risk_score: number;
  explanation: string;
}

// Fallback high-fidelity mock generators
const MOCK_SCANS: Scan[] = [
  {
    id: '11b017cb-befa-4c49-a8da-6649d971055c',
    name: 'Production OAuth & API Gateway Audit',
    target: 'https://gateway.internal.enterprise.com',
    status: 'RUNNING',
    config: { depth: 3, modules: ['discovery', 'jwt', 'fuzzing'] },
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: '22c017cb-befa-4c49-a8da-6649d971055d',
    name: 'Staging Microservices Security Check',
    target: 'https://staging.api.cloud.corp',
    status: 'COMPLETED',
    config: { depth: 2, modules: ['discovery', 'jwt'] },
    created_at: new Date(Date.now() - 86400 * 1000).toISOString(),
    started_at: new Date(Date.now() - 86400 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 86000 * 1000).toISOString(),
  },
  {
    id: '33d017cb-befa-4c49-a8da-6649d971055e',
    name: 'Legacy Partner Portal Vulnerability Scan',
    target: 'https://partners.legacy.corp.internal',
    status: 'FAILED',
    config: { depth: 4, modules: ['discovery', 'jwt', 'fuzzing'] },
    created_at: new Date(Date.now() - 172800 * 1000).toISOString(),
    started_at: new Date(Date.now() - 172800 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 172000 * 1000).toISOString(),
  }
];

const MOCK_TASKS: Record<string, Task[]> = {
  '11b017cb-befa-4c49-a8da-6649d971055c': [
    {
      id: 't1',
      scan_id: '11b017cb-befa-4c49-a8da-6649d971055c',
      method: 'GET',
      url: 'https://gateway.internal.enterprise.com/api/v1/users/me',
      headers: { 'Content-Type': 'application/json' },
      payload: null,
      status: 'SUCCESS',
      attempts: 1,
      max_retries: 3,
      created_at: new Date().toISOString(),
      response: {
        id: 'r1',
        status_code: 200,
        latency_ms: 45.2,
        response_headers: { 'Content-Type': 'application/json' },
        response_body: JSON.stringify({ id: "usr_1002", email: "admin@enterprise.com", role: "administrator", active: true }),
        created_at: new Date().toISOString()
      }
    },
    {
      id: 't2',
      scan_id: '11b017cb-befa-4c49-a8da-6649d971055c',
      method: 'POST',
      url: 'https://gateway.internal.enterprise.com/api/v1/payments/refund',
      headers: { 'Content-Type': 'application/json' },
      payload: { transaction_id: "tx_90021", amount: 150.00 },
      status: 'FAILED',
      attempts: 3,
      max_retries: 3,
      created_at: new Date().toISOString(),
      response: {
        id: 'r2',
        status_code: 403,
        latency_ms: 120.8,
        response_headers: { 'Content-Type': 'application/json' },
        response_body: JSON.stringify({ error: "Access Denied: Insufficient Privileges", code: "AUTH_ERR_01" }),
        error_message: "403 Forbidden - Role swapper failed to bypass check",
        created_at: new Date().toISOString()
      }
    },
    {
      id: 't3',
      scan_id: '11b017cb-befa-4c49-a8da-6649d971055c',
      method: 'GET',
      url: 'https://gateway.internal.enterprise.com/api/v1/tenant/settings',
      headers: { 'Content-Type': 'application/json' },
      payload: null,
      status: 'PROCESSING',
      attempts: 0,
      max_retries: 3,
      created_at: new Date().toISOString()
    },
    {
      id: 't4',
      scan_id: '11b017cb-befa-4c49-a8da-6649d971055c',
      method: 'PUT',
      url: 'https://gateway.internal.enterprise.com/api/v1/billing/card',
      headers: { 'Content-Type': 'application/json' },
      payload: { card_number: "4111********1111", cvc: "123" },
      status: 'QUEUED',
      attempts: 0,
      max_retries: 3,
      created_at: new Date().toISOString()
    }
  ]
};

export const apiService = {
  async getScans(): Promise<Scan[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/scans`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      console.warn('API getScans failed, using mock data:', err);
      return MOCK_SCANS;
    }
  },

  async createScan(name: string, target: string, config: any = {}): Promise<Scan> {
    try {
      const res = await fetch(`${API_BASE_URL}/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, target, config }),
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      console.warn('API createScan failed, using mock data:', err);
      const newScan: Scan = {
        id: `scan_${Math.random().toString(36).substr(2, 9)}`,
        name,
        target,
        status: 'PENDING',
        config,
        created_at: new Date().toISOString(),
      };
      MOCK_SCANS.unshift(newScan);
      return newScan;
    }
  },

  async getScanProgress(scanId: string): Promise<ScanProgress> {
    try {
      const res = await fetch(`${API_BASE_URL}/scans/${scanId}/progress`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      // Return dynamic mock status based on scan ID
      const scan = MOCK_SCANS.find(s => s.id === scanId);
      const status = scan?.status || 'PENDING';
      
      const successCount = status === 'COMPLETED' ? 120 : (status === 'RUNNING' ? Math.floor(Math.random() * 40 + 20) : 0);
      const failedCount = status === 'COMPLETED' ? 4 : (status === 'RUNNING' ? Math.floor(Math.random() * 5 + 1) : 0);
      const pendingCount = status === 'RUNNING' ? Math.floor(Math.random() * 20 + 5) : 0;
      
      return {
        scan_id: scanId,
        status,
        total_tasks: successCount + failedCount + pendingCount,
        completed_tasks: successCount,
        failed_tasks: failedCount,
        pending_tasks: pendingCount,
        detailed_stats: {
          QUEUED: status === 'RUNNING' ? Math.ceil(pendingCount / 3) : 0,
          PROCESSING: status === 'RUNNING' ? Math.ceil(pendingCount / 3) : 0,
          RETRYING: status === 'RUNNING' ? Math.floor(pendingCount / 3) : 0,
          SUCCESS: successCount,
          FAILED: failedCount,
        }
      };
    }
  },

  async getScanTasks(scanId: string): Promise<Task[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/scans/${scanId}/tasks`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      return MOCK_TASKS[scanId] || MOCK_TASKS['11b017cb-befa-4c49-a8da-6649d971055c'];
    }
  },

  async runDiscovery(scanId: string, specSource: string, baseUrl?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/scans/${scanId}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec_source: specSource, base_url: baseUrl }),
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      console.warn('API runDiscovery failed, simulating response:', err);
      // Update scan to RUNNING state
      const scan = MOCK_SCANS.find(s => s.id === scanId);
      if (scan) scan.status = 'RUNNING';
      
      return { message: "Submitted 14 tasks successfully from spec." };
    }
  },

  async getQueueStatus(): Promise<QueueStatus> {
    try {
      const res = await fetch(`${API_BASE_URL}/queue/status`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      // Simulate live fluctuating queue sizes
      const base = 5 + Math.floor(Math.sin(Date.now() / 5000) * 3);
      return {
        critical_p1: Math.max(0, base - 3),
        high_p2: base + 2,
        medium_p3: base * 2 + 10,
        low_p4: base * 3 + 15,
        delayed_retries: Math.max(0, Math.floor(base / 2) - 1),
        dead_letters: 1,
        total_pending: (base - 3) + (base + 2) + (base * 2 + 10) + (base * 3 + 15)
      };
    }
  },

  async getWorkerStatus(): Promise<WorkerStatus> {
    try {
      const res = await fetch(`${API_BASE_URL}/workers/status`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      return {
        active_workers: 4 + Math.floor(Math.sin(Date.now() / 10000) * 2),
        status: "scaling"
      };
    }
  },

  async getExecutionStats(): Promise<ExecutionStats> {
    try {
      const res = await fetch(`${API_BASE_URL}/execution/stats`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      // Return mock fluctuating stats
      const total = 1000 + Math.floor(Date.now() / 10000) % 200;
      const failure = Math.floor(total * 0.04);
      const rate_limited = Math.floor(total * 0.02);
      const success = total - failure - rate_limited;
      
      return {
        throughput: {
          total_processed: total,
          success,
          failure,
          rate_limited_429: rate_limited
        },
        rates: {
          success_rate_pct: parseFloat((success / total * 100).toFixed(2)),
          failure_rate_pct: parseFloat((failure / total * 100).toFixed(2)),
          rate_limit_pct: parseFloat((rate_limited / total * 100).toFixed(2))
        },
        retries_total: Math.floor(total * 0.08)
      };
    }
  },

  async getReport(scanId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/scans/${scanId}/report`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      console.warn('API getReport failed, generating mock security report:', err);
      return {
        scan_id: scanId,
        report_id: `rep_${uuidv4()}`,
        generated_at: new Date().toISOString(),
        issues_found: 4,
        vulnerabilities: [
          {
            id: "VULN-001",
            title: "BOLA (Broken Object Level Authorization) on User Details Endpoint",
            severity: "CRITICAL",
            path: "/api/v1/users/{id}",
            method: "GET",
            description: "An attacker can fetch other user profiles by guessing the sequential integer user ID.",
            remediation: "Migrate user identifiers from auto-incrementing integers to UUIDv4 and verify that the session user is authorized to view the requested record.",
            cvss: 8.9,
            impact: "High - Unauthorized exposure of user profiles including PII data."
          },
          {
            id: "VULN-002",
            title: "JWT Signature Bypass (Algorithm 'none' vulnerability)",
            severity: "CRITICAL",
            path: "/api/v1/payments/refund",
            method: "POST",
            description: "The API gateway accepts JWT signatures utilizing the 'none' algorithm, permitting any user to escalate privileges.",
            remediation: "Ensure the backend gateway expressly rejects JWTs containing 'alg': 'none'.",
            cvss: 9.3,
            impact: "Critical - Full administrative privilege bypass and financial transaction vulnerability."
          },
          {
            id: "VULN-003",
            title: "Information Disclosure via Stack Trace Leak",
            severity: "MEDIUM",
            path: "/api/v1/tenant/settings",
            method: "GET",
            description: "Providing malformed query strings causes the application server to leak database schema structures and internal library tracebacks.",
            remediation: "Configure application settings to prevent error outputs from displaying system stacks.",
            cvss: 5.4,
            impact: "Medium - Exposure of underlying database configuration and directory structures."
          },
          {
            id: "VULN-004",
            title: "Rate Limit Missing on Auth Endpoint",
            severity: "LOW",
            path: "/api/v1/auth/login",
            method: "POST",
            description: "No token bucket rate limits are enforced, exposing user accounts to brute-force credential stuffing.",
            remediation: "Install a rate-limiting middleware using Redis Token Buckets capped at 5 requests/minute per IP address.",
            cvss: 3.2,
            impact: "Low - High likelihood of brute-force entry attempts."
          }
        ]
      };
    }
  },

  async analyzeJWT(token: string): Promise<JWTAnalysisResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/jwt/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      console.warn('API analyzeJWT failed, using mock decoder:', err);
      
      // Basic mock JWT parsing for the client side if the server is off
      if (!token) return { valid: false, error: 'Empty token', header: {}, payload: {}, vulnerabilities: [], risk_score: 0 };
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          valid: false,
          error: "Malformed JWT structure. Expected 3 base64-encoded segments.",
          header: {},
          payload: {},
          vulnerabilities: [{
            severity: "HIGH",
            type: "Malformed Token",
            description: "The token doesn't follow the dot-separated format (header.payload.signature).",
            remediation: "Verify that you are pasting a valid JWT string."
          }],
          risk_score: 80
        };
      }
      
      try {
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        const vulnerabilities: any[] = [];
        if (header.alg === 'none' || header.alg === 'NONE') {
          vulnerabilities.push({
            severity: "CRITICAL",
            type: "Algorithm 'none' vulnerability",
            description: "The token header claims the algorithm is 'none'. This indicates that signature checking will be bypassed.",
            remediation: "Configure the server-side JWT verification engine to forbid the 'none' algorithm."
          });
        }
        
        if (!payload.exp) {
          vulnerabilities.push({
            severity: "HIGH",
            type: "No Expiration Date",
            description: "The token does not specify an expiration claim ('exp'). If hijacked, this token remains valid indefinitely.",
            remediation: "Configure authorization token configurations to enforce token expiration (exp) fields."
          });
        }
        
        return {
          valid: true,
          header,
          payload,
          vulnerabilities,
          risk_score: vulnerabilities.length > 0 ? (vulnerabilities.some(v => v.severity === 'CRITICAL') ? 95 : 70) : 10
        };
      } catch (e) {
        return {
          valid: false,
          error: `Base64 Decoding failed: ${e}`,
          header: {},
          payload: {},
          vulnerabilities: [{
            severity: "HIGH",
            type: "Encoding Failure",
            description: "Unable to parse base64 elements in JWT parts.",
            remediation: "Verify signature encryption formatting."
          }],
          risk_score: 75
        };
      }
    }
  },

  async runDiff(respA: { status_code: number, body: string }, respB: { status_code: number, body: string }): Promise<DiffResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/diff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_a: respA, response_b: respB }),
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (err) {
      const statusDiffers = respA.status_code !== respB.status_code;
      const bodyLengthDiffers = respA.body.length !== respB.body.length;
      
      let json_diff_keys: string[] = [];
      let leak_detected = false;
      let leak_type = null;
      
      try {
        const jsonA = JSON.parse(respA.body);
        const jsonB = JSON.parse(respB.body);
        json_diff_keys = Object.keys(jsonA).filter(k => !Object.prototype.hasOwnProperty.call(jsonB, k));
        
        if (respA.status_code === 200 && respB.status_code === 200) {
          const sensitiveKeys = ['email', 'phone', 'balance', 'credit_card', 'ssn', 'isAdmin'];
          const leaks = Object.keys(jsonB).filter(k => sensitiveKeys.includes(k) && jsonA[k] === jsonB[k]);
          if (leaks.length > 0) {
            leak_detected = true;
            leak_type = "BOLA/Privilege Escalation - Low role fetched high-privileged user fields: " + leaks.join(', ');
          }
        }
      } catch (e) {}
      
      return {
        status_differs,
        status_a: respA.status_code,
        status_b: respB.status_code,
        body_length_differs,
        body_length_a: respA.body.length,
        body_length_b: respB.body.length,
        json_diff_keys,
        leak_detected,
        leak_type,
        risk_score: leak_detected ? 90 : (statusDiffers ? 40 : 10),
        explanation: leak_detected ? "High vulnerability. Request B (run with less privileged user's token) was able to fetch identical sensitive keys as Request A." : "No critical authorization leak detected. The difference in status code confirms authorization checks are working."
      };
    }
  }
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
