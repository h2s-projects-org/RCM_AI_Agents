import React, { useState, useEffect } from 'react';
import { Activity, FileText, Calendar, CheckCircle, AlertCircle, Play, ChevronRight, TrendingUp, Zap, BarChart3, Brain, Code2, Database, GitBranch } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [claims, setClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [workflow, setWorkflow] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [patterns, setPatterns] = useState<any | null>(null);
  const [showApiMetrics, setShowApiMetrics] = useState(true);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [patientName, setPatientName] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [denialCode, setDenialCode] = useState('');
  const [denialDescription, setDenialDescription] = useState('');
  const [payer, setPayer] = useState('');
  const [dateOfService, setDateOfService] = useState('');

  useEffect(() => {
    fetchClaims();
    fetchPatterns();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkflowRunning && workflow?.id) {
      interval = setInterval(() => {
        fetchWorkflow(workflow.id);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isWorkflowRunning, workflow?.id]);

  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/claims');
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || data.message || 'Failed to fetch claims');
        setClaims([]);
        return;
      }
      setClaims(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch claims', error);
      setErrorMsg(error.message);
      setClaims([]);
    }
  };

  const fetchPatterns = async () => {
    try {
      const res = await fetch('/api/patterns');
      const data = await res.json();
      if (!res.ok) {
        setPatterns(null);
        return;
      }
      setPatterns(data);
    } catch (error) {
      console.error('Failed to fetch patterns', error);
      setPatterns(null);
    }
  };

  const fetchWorkflow = async (id: string) => {
    try {
      const res = await fetch(`/api/workflow/${id}`);
      const data = await res.json();
      setWorkflow(data);
      if (data.status === 'Completed' || data.status === 'Failed') {
        setIsWorkflowRunning(false);
        fetchClaims(); // Refresh claims to get updated status
        fetchPatterns(); // Refresh patterns
      }
    } catch (error) {
      console.error('Failed to fetch workflow', error);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: any = {
        patientName,
        claimAmount: parseFloat(claimAmount),
        denialCode,
        denialDescription,
        payer,
        dateOfService,
        date: new Date().toISOString().split('T')[0]
      };
      if (patientName === 'Sandra' && denialCode === 'CO-252') {
        payload.id = 'CLM-1775386830790';
      }
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || data.details?.[0]?.message || 'Failed to submit claim');
        return;
      }

      setClaims([...claims, data]);
      setPatientName('');
      setClaimAmount('');
      setDenialCode('');
      setDenialDescription('');
      setPayer('');
      setDateOfService('');
    } catch (error: any) {
      console.error('Failed to submit claim', error);
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWorkflow = async (claimId: string) => {
    setIsWorkflowRunning(true);
    setWorkflow(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/workflow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || data.details?.[0]?.message || 'Failed to start workflow');
        setIsWorkflowRunning(false);
        return;
      }
      
      setWorkflow({ id: data.workflowId, status: 'Starting...', apiMetrics: { executionId: data.executionId } });
    } catch (error: any) {
      console.error('Failed to start workflow', error);
      setErrorMsg(error.message);
      setIsWorkflowRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header with Branding */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-blue-600">ClaimFlow AI Orchestrator</h1>
            <p className="text-xs text-gray-500">Multi-Agent Claims Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isWorkflowRunning && (
            <span className="text-[10px] font-bold text-emerald-700 animate-pulse tracking-widest bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> AGENTS ONLINE
            </span>
          )}
          <button onClick={() => setShowArchitecture(!showArchitecture)} className="text-xs text-gray-600 hover:text-blue-600 font-medium border-l pl-4 border-gray-200 px-4 py-1 rounded hover:bg-gray-100 transition">
            {showArchitecture ? 'Hide' : 'Show'} Architecture
          </button>
          <div className="text-xs text-gray-400 font-medium">v2.0 Enterprise</div>
        </div>
      </header>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mx-6 mt-4 shadow-sm flex items-center justify-between" role="alert">
          <div>
            <strong className="font-semibold block sm:inline mr-2">Error</strong>
            <span className="block sm:inline">{errorMsg}</span>
          </div>
          <button className="text-red-500 hover:bg-red-100 p-1 rounded transition" onClick={() => setErrorMsg(null)}>
            <svg className="fill-current h-4 w-4" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </button>
        </div>
      )}

      <main className="max-w-full p-6 space-y-6">
        
        {/* Architecture Diagram */}
        {showArchitecture && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> System Architecture
            </h3>
            <div className="bg-white rounded-lg p-4 overflow-x-auto border border-gray-100">
              <svg viewBox="0 0 1000 220" className="w-full min-w-[800px] h-auto">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#60a5fa" />
                  </marker>
                  <marker id="arrowhead-amber" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#f59e0b" />
                  </marker>
                </defs>
                
                {/* User Input */}
                <rect x="30" y="80" width="80" height="50" rx="4" fill="#1e40af" stroke="#3b82f6" strokeWidth="2" />
                <text x="70" y="108" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">User Input</text>
                
                {/* UI -> API Gateway */}
                <path d="M 110 105 L 150 105" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                
                {/* API Gateway */}
                <rect x="150" y="80" width="90" height="50" rx="4" fill="#7c3aed" stroke="#a78bfa" strokeWidth="2" />
                <text x="195" y="108" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">API Gateway</text>
                
                {/* Gateway -> Manager */}
                <path d="M 240 105 L 280 105" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                
                {/* Manager Agent */}
                <rect x="280" y="80" width="100" height="50" rx="4" fill="#dc2626" stroke="#f87171" strokeWidth="2" />
                <text x="330" y="108" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">Manager Agent</text>
                
                {/* Manager -> Sub-Agents Fan-Out */}
                <path d="M 380 105 L 400 105" stroke="#60a5fa" strokeWidth="2" fill="none" />
                <path d="M 400 30 L 400 190" stroke="#60a5fa" strokeWidth="2" fill="none" />
                <path d="M 400 30 L 420 30" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 400 110 L 420 110" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 400 150 L 420 150" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 400 190 L 420 190" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                
                {/* Sub-Agents */}
                <g>
                  {/* Denial Analysis */}
                  <rect x="420" y="15" width="100" height="30" rx="3" fill="#059669" stroke="#10b981" strokeWidth="1.5" />
                  <text x="470" y="34" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Denial Analysis</text>
                  
                  {/* HITL Gateway */}
                  <path d="M 470 45 L 470 60" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3" fill="none" markerEnd="url(#arrowhead-amber)" />
                  <rect x="430" y="60" width="80" height="20" rx="3" fill="#d97706" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="470" y="74" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">HITL Gateway</text>
                  
                  {/* Action Rec */}
                  <rect x="420" y="95" width="100" height="30" rx="3" fill="#059669" stroke="#10b981" strokeWidth="1.5" />
                  <text x="470" y="114" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Action Rec.</text>
                  
                  {/* Task Exec */}
                  <rect x="420" y="135" width="100" height="30" rx="3" fill="#059669" stroke="#10b981" strokeWidth="1.5" />
                  <text x="470" y="154" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Task Exec.</text>

                  {/* Summary Agent */}
                  <rect x="420" y="175" width="100" height="30" rx="3" fill="#059669" stroke="#10b981" strokeWidth="1.5" />
                  <text x="470" y="194" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Summary Agent</text>
                </g>
                
                {/* Sub-Agents to MCP Integrations */}
                <path d="M 520 110 L 580 110" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.6" />
                <path d="M 520 150 L 580 150" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.6" />
                <path d="M 520 190 L 580 190" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.6" />
                
                {/* MCP Integration Box */}
                <rect x="580" y="85" width="120" height="130" rx="4" fill="#1f2937" stroke="#6b7280" strokeDasharray="4" strokeWidth="1.5" />
                <text x="640" y="103" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="bold">MCP Integration</text>
                
                <rect x="590" y="110" width="100" height="20" rx="3" fill="#374151" stroke="#4b5563" strokeWidth="1" />
                <text x="640" y="123" textAnchor="middle" fill="#d1d5db" fontSize="9" fontWeight="bold">Tasks API</text>
                
                <rect x="590" y="140" width="100" height="20" rx="3" fill="#374151" stroke="#4b5563" strokeWidth="1" />
                <text x="640" y="153" textAnchor="middle" fill="#d1d5db" fontSize="9" fontWeight="bold">Calendar API</text>
                
                <rect x="590" y="170" width="100" height="20" rx="3" fill="#374151" stroke="#4b5563" strokeWidth="1" />
                <text x="640" y="183" textAnchor="middle" fill="#d1d5db" fontSize="9" fontWeight="bold">Sheets API</text>
                
                {/* Integrations -> Firestore */}
                <path d="M 700 120 L 730 120 L 730 110 L 760 110" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.6" />
                <path d="M 700 150 L 760 150" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.6" />
                <path d="M 700 180 L 740 180 L 740 130 L 760 130" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.6" />
                
                {/* Direct paths to Firestore (History/Logs) */}
                <path d="M 520 30 L 720 30 L 720 90 L 760 90" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.4" />
                
                {/* HITL Gateway to Firestore */}
                <path d="M 510 70 L 710 70 L 710 100 L 760 100" stroke="#f59e0b" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead-amber)" opacity="0.8" strokeDasharray="4" />
                
                {/* Firestore Database */}
                <rect x="760" y="75" width="100" height="90" rx="4" fill="#ea580c" stroke="#f97316" strokeWidth="2" />
                <text x="810" y="112" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Firestore</text>
                <text x="810" y="130" textAnchor="middle" fill="#fed7aa" fontSize="10">+ Queries</text>
                
                {/* Output */}
                <path d="M 860 115 L 920 115" stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <rect x="920" y="85" width="40" height="60" rx="4" fill="#1e40af" stroke="#3b82f6" strokeWidth="2" />
                <text x="940" y="120" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">UI</text>
              </svg>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Claims List & Submission */}
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-blue-600">Submit New Claim</h2>
              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Patient Name</label>
                  <input required type="text" value={patientName} onChange={e => setPatientName(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 placeholder-gray-400" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Claim Amount ($)</label>
                  <input required type="number" step="0.01" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 placeholder-gray-400" placeholder="1500.00" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Denial Code</label>
                  <input required type="text" value={denialCode} onChange={e => setDenialCode(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 placeholder-gray-400" placeholder="CO-16" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Denial Description</label>
                  <textarea required value={denialDescription} onChange={e => setDenialDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 placeholder-gray-400" placeholder="Describe the denial reason..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Payer</label>
                  <input type="text" value={payer} onChange={e => setPayer(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 placeholder-gray-400" placeholder="Aetna, UHC, Medicare..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Date of Service</label>
                  <input type="date" value={dateOfService} onChange={e => setDateOfService(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 placeholder-gray-400" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={isSubmitting} className="flex-1 flex justify-center py-2 px-4 rounded-md font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition">
                    {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPatientName('Sandra');
                      setClaimAmount('850');
                      setDenialCode('CO-252');
                      setDenialDescription('The claim/service lacks information needed for adjudication. Missing clinical attachment required by payer.');
                      setPayer('Aetna');
                      setDateOfService('2026-03-28');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                  >
                    Demo
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px] shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Recent Claims ({claims.length})
                </h2>
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {claims.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-8">No claims submitted yet.</p>
                ) : (
                  claims.map(claim => (
                    <button
                      key={claim.id}
                      onClick={() => { setSelectedClaim(claim); setWorkflow(null); setIsWorkflowRunning(false); }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border transition-colors text-xs",
                        selectedClaim?.id === claim.id 
                          ? "bg-blue-50 border-blue-200" 
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-900">{claim.id}</span>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                          claim.status === 'New' ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"
                        )}>
                          {claim.status}
                        </span>
                      </div>
                      <div className="text-gray-600 truncate">{claim.patientName} - ${claim.claimAmount}</div>
                      <div className="text-gray-500 mt-1 truncate text-[10px] flex gap-2">
                        <span>Code: <span className="font-medium text-gray-700">{claim.denialCode}</span></span>
                        {claim.payer && <span>· <span className="font-medium text-indigo-600">{claim.payer}</span></span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Multi-Claim Patterns */}
            {patterns && patterns.totalProcessed > 0 && (
              <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Pattern Insights
                </h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>Processed: <span className="font-semibold text-emerald-600">{patterns.totalProcessed}</span> claims</p>
                  <p>Denial Codes: <span className="font-semibold text-blue-600">{patterns.uniqueDenialCodes}</span> unique</p>
                  {patterns.topPatterns.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-700 font-semibold mb-2">Top Issues:</p>
                      {patterns.topPatterns.slice(0, 3).map((p: any, i: number) => (
                        <div key={i} className="text-[10px] text-gray-600 mb-1">
                          <span className="text-emerald-600">•</span> {p.code}: <span className="font-semibold">{p.count}</span>x (${p.averageAmount.toFixed(2)} avg)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Claim Details & Workflow */}
          <div className="lg:col-span-9 space-y-6">
            {selectedClaim ? (
              <>
                {/* Claim Header */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Claim: {selectedClaim.id}</h2>
                        {(selectedClaim.id === 'CLM-1775324538835' || selectedClaim.id === 'CLM-1775386830790') && (
                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-[10px] font-bold text-white rounded uppercase tracking-tighter animate-pulse">System Demo</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 font-medium">
                        <span>Patient: <span className="text-gray-900 font-semibold">{selectedClaim.patientName}</span></span>
                        <span className="text-gray-300">|</span>
                        <span>Payer: <span className="text-gray-900 font-semibold">{selectedClaim.payer || 'Unknown'}</span></span>
                        <span className="text-gray-300">|</span>
                        <span>Date of Service: <span className="text-gray-900 font-semibold">{selectedClaim.dateOfService || 'N/A'}</span></span>
                        <span className="text-gray-300">|</span>
                        <span>Claim Submitted Date: <span className="text-gray-900 font-semibold">{selectedClaim.date}</span></span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartWorkflow(selectedClaim.id)}
                      disabled={isWorkflowRunning || selectedClaim.status !== 'New'}
                      className="flex items-center gap-2 py-2.5 px-5 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Play className="w-4 h-4" />
                      {isWorkflowRunning ? 'Processing...' : 'Run Workflow'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-1">Claim Amount</div>
                      <div className="text-2xl font-bold text-blue-600">${selectedClaim.claimAmount}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-1">Denial Code</div>
                      <div className="text-2xl font-bold text-red-600">{selectedClaim.denialCode}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-1">Status</div>
                      <div className="text-lg font-bold text-yellow-600">{selectedClaim.status}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2">Denial Description</div>
                    <div className="text-sm text-gray-900">{selectedClaim.denialDescription}</div>
                  </div>
                </section>

                {workflow && (
                  <>
                    {/* API Metrics & Manager Agent Section */}
                    {workflow.apiMetrics && (
                      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-indigo-600 flex items-center gap-2">
                            <Code2 className="w-4 h-4" /> API & Execution Details
                          </h3>
                          <button onClick={() => setShowApiMetrics(!showApiMetrics)} className="text-xs text-gray-600 hover:text-indigo-600">
                            {showApiMetrics ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {showApiMetrics && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Execution ID</div>
                              <div className="text-xs font-mono text-indigo-600 truncate">{workflow.apiMetrics.executionId?.slice(0, 12)}...</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Endpoint</div>
                              <div className="text-xs font-mono text-blue-600">{workflow.apiMetrics.endpoint}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Duration</div>
                              <div className="text-xs font-mono text-emerald-600">{workflow.apiMetrics.duration || 'In progress...'}s</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Status</div>
                              <div className="text-xs font-mono text-yellow-600 uppercase font-bold">{workflow.status}</div>
                            </div>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Manager Agent Panel */}
                    {workflow.managerAgent && (
                      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-red-600 mb-4 flex items-center gap-2">
                          <Brain className="w-4 h-4" /> Manager Agent (Orchestrator)
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <div className="text-xs font-semibold text-orange-600 mb-2">Decision</div>
                            <div className="text-sm text-gray-900">{workflow.managerAgent.decision}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <div className="text-xs font-semibold text-orange-600 mb-2">Reasoning Chain</div>
                            <ul className="space-y-1">
                              {workflow.managerAgent.reasoning?.map((r: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex gap-2">
                                  <span className="text-orange-600 flex-shrink-0">→</span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                              <div className="text-[10px] text-gray-600 font-semibold mb-1">Risk Level</div>
                              <div className="text-xs font-bold text-emerald-600">{workflow.managerAgent.riskLevel}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                              <div className="text-[10px] text-gray-600 font-semibold mb-1">Automation</div>
                              <div className="text-xs font-bold text-blue-600">{workflow.managerAgent.automationLevel}%</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                              <div className="text-[10px] text-gray-600 font-semibold mb-1">Agents Routed</div>
                              <div className="text-xs font-bold text-indigo-600">{workflow.managerAgent.routingPath?.length}</div>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Claim Lifecycle Timeline */}
                    {workflow.lifecycle && workflow.lifecycle.length > 0 && (
                      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-cyan-600 mb-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Claim Lifecycle
                        </h3>
                        <div className="space-y-2">
                          {workflow.lifecycle.map((event: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 text-xs">
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-cyan-500" />
                              <span className="font-semibold text-cyan-600 min-w-[150px]">{event.state === 'Submitted' ? 'Claim Submitted Date' : event.state}</span>
                              <span className="text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Workflow Steps with Reasoning */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                          <Zap className="w-4 h-4" /> Workflow Execution Steps
                        </h3>
                        <span className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 uppercase tracking-wide",
                          workflow.status === 'Completed' ? "bg-emerald-100 text-emerald-700" : 
                          workflow.status === 'Failed' ? "bg-red-100 text-red-700" : 
                          "bg-blue-100 text-blue-700 animate-pulse"
                        )}>
                          {workflow.status === 'Completed' && <CheckCircle className="w-3.5 h-3.5" />}
                          {workflow.status === 'Failed' && <AlertCircle className="w-3.5 h-3.5" />}
                          {workflow.status}
                        </span>
                      </div>

                      {workflow.status === 'Failed' && workflow.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                          <p className="font-semibold mb-1 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Workflow Error
                          </p>
                          <p className="text-xs">{workflow.error}</p>
                          <p className="text-xs mt-2 text-red-700">Recommendation: Escalate to human agent for manual review</p>
                        </div>
                      )}

                      <div className="space-y-5">
                        {workflow.steps?.map((step: any, index: number) => (
                          <div key={index} className="relative pl-8">
                            <div
                              className="absolute -left-3 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white transition-all duration-500"
                              style={{
                                borderColor:
                                  step.status === 'Completed' ? '#10b981' :
                                  step.status === 'Pending Human Review' ? '#f59e0b' :
                                  step.status === 'Failed' ? '#ef4444' : '#3b82f6',
                                backgroundColor:
                                  step.status === 'Completed' ? '#ecfdf5' :
                                  step.status === 'Pending Human Review' ? '#fffbeb' :
                                  step.status === 'Failed' ? '#fef2f2' : '#f0f9ff'
                              }}
                            >
                              {step.status === 'Completed' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                              {step.status === 'Running' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />}
                              {step.status === 'Pending Human Review' && <AlertCircle className="w-3 h-3 text-amber-500" />}
                              {step.status === 'Failed' && <AlertCircle className="w-3 h-3 text-red-500" />}
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">{step.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">Status:{' '}
                              <span className={cn(
                                'font-semibold',
                                step.status === 'Completed' ? 'text-emerald-700' :
                                step.status === 'Pending Human Review' ? 'text-amber-700' :
                                step.status === 'Failed' ? 'text-red-700' : 'text-blue-700'
                              )}>{step.status}</span>
                            </p>
                            
                            {/* Reasoning Trace */}
                            {step.reasoning && step.reasoning.length > 0 && (
                              <div className="mb-3 bg-yellow-50 rounded border border-yellow-200 p-3">
                                <div className="text-[10px] font-semibold text-amber-700 mb-2 flex items-center gap-1">
                                  <Brain className="w-3 h-3" /> Decision Logic
                                </div>
                                <ul className="space-y-1">
                                  {step.reasoning.map((r: string, i: number) => (
                                    <li key={i} className="text-xs text-gray-700 flex gap-2">
                                      <span className="text-amber-600">→</span>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {step.result && (
                              <div className="bg-gray-50 rounded-md border border-gray-200 p-4 text-sm">
                                {step.name === 'Manager Agent (Orchestrator)' && (
                                  <div className="space-y-2 text-xs">
                                    <p><span className="font-semibold text-orange-600">Decision Path:</span> {step.result.routingPath?.join(' → ')}</p>
                                    <p><span className="font-semibold text-orange-600">Risk Level:</span> {step.result.riskLevel}</p>
                                  </div>
                                )}
                                {step.name === 'Denial Analysis Agent' && (
                                  <div className="space-y-1.5 text-xs">
                                    <p><span className="font-semibold text-blue-600">Category:</span> {step.result.denialCategory}</p>
                                    <p><span className="font-semibold text-blue-600">Root Cause:</span> {step.result.rootCause}</p>
                                    <p><span className="font-semibold text-blue-600">Confidence:</span> <span className="text-emerald-600 font-bold">{step.result.confidenceScore}%</span></p>
                                    {step.result.timelyFilingStatus && (
                                      <p>
                                        <span className="font-semibold text-blue-600">Timely Filing Status:</span>{' '}
                                        <span className={cn(
                                          "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                          step.result.timelyFilingStatus === 'Eligible' ? "bg-emerald-100 text-emerald-700" :
                                          step.result.timelyFilingStatus === 'At Risk' ? "bg-yellow-100 text-yellow-700" :
                                          "bg-red-100 text-red-700"
                                        )}>{step.result.timelyFilingStatus}</span>
                                        {step.result.tflRemaining && (
                                          <span className="text-gray-500 ml-2">· TFL Remaining: <span className="font-semibold text-gray-700">{step.result.tflRemaining}</span></span>
                                        )}
                                      </p>
                                    )}
                                    {step.result.payerSLAInsight && (
                                      <p><span className="font-semibold text-blue-600">Payer SLA:</span> <span className="text-gray-700">{step.result.payerSLAInsight}</span></p>
                                    )}
                                    {(step.result.workability || step.result.collectability) && (
                                      <div className="flex gap-4 pt-1 border-t border-gray-100">
                                        {step.result.workability && (
                                          <p><span className="font-semibold text-blue-600">Workability:</span> {step.result.workability}</p>
                                        )}
                                        {step.result.collectability && (
                                          <p><span className="font-semibold text-blue-600">Collectability:</span> {step.result.collectability}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {step.name === 'Action Recommendation Agent' && (
                                  <div className="space-y-1 text-xs">
                                    <p><span className="font-semibold text-indigo-600">Action:</span> {step.result.recommendedAction}</p>
                                    <p><span className="font-semibold text-indigo-600">Priority:</span> <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", step.result.priority?.toLowerCase() === 'high' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")}>{step.result.priority}</span></p>
                                    <p className="text-gray-600 mt-2 italic">"{step.result.actionDetails}"</p>
                                  </div>
                                )}
                                {step.name === 'Task Execution Agent' && (
                                  <div className="space-y-3 text-xs">
                                    <div>
                                      <p className="font-semibold flex items-center gap-1.5 mb-2 text-emerald-700"><CheckCircle className="w-3.5 h-3.5"/> Tasks Created</p>
                                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                                        {step.result.tasksCreated?.map((t: any, i: number) => (
                                          <li key={i}>
                                            <span className="font-medium">{t.title}</span> 
                                            <span className="text-gray-500 ml-2">(Due: {t.dueDate}, Ref: {t.assignedTo})</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                                {step.name === 'Tool Integration (MCP)' && (
                                  <div className="space-y-3 text-xs">
                                    <p className="text-emerald-700 font-semibold">{step.result.message}</p>
                                    {step.result.mcpEvents && (
                                      <div className="space-y-1 bg-white p-2 rounded border border-gray-200">
                                        {step.result.mcpEvents.map((evt: any, i: number) => (
                                          <div key={i} className="flex items-center justify-between text-[10px]">
                                            <span className="text-gray-600">{evt.tool} → {evt.action}</span>
                                            <span className="text-emerald-600 font-bold">{evt.status}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {step.name === 'Summary Agent' && (
                                  <div className="space-y-2 text-xs">
                                    <div className="border-l-2 border-blue-500 pl-3 py-1 bg-blue-50">
                                      <p className="text-gray-900 leading-relaxed">{step.result.executiveSummary}</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 mb-2">Key Takeaways</p>
                                      <ul className="space-y-1">
                                        {step.result.keyTakeaways?.map((k: string, i: number) => (
                                          <li key={i} className="flex items-start gap-1.5 text-gray-700">
                                            <span className="text-blue-600 font-bold flex-shrink-0">•</span> {k}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>                                      {step.result.explainability && (
                                        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                            <p className="font-semibold text-amber-800 mb-1 flex items-center gap-1.5 flex-wrap text-[11px]">🧠 Explainability Layer: Why this action?</p>
                                            <p className="text-gray-700 italic flex-wrap leading-tight text-[11px] mb-1.5">"{step.result.explainability.whyThisAction}"</p>
                                            <p className="text-amber-800 font-bold text-[10px]">Historical Success Rate: {step.result.explainability.historicalSuccess}</p>
                                        </div>
                                      )}
                                      {step.result.portfolioInsights && (
                                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                            <p className="font-semibold text-emerald-800 flex items-center gap-1.5 text-[11px] mb-1.5">📊 Portfolio Insights</p>
                                            <ul className="text-[11px] text-gray-800 space-y-1">
                                                <li><span className="font-semibold opacity-90">Trend:</span> {step.result.portfolioInsights.similarClaimsWeekly} similar claims ({step.result.portfolioInsights.payer || selectedClaim?.payer || 'Payer'}) this week</li>
                                                <li><span className="font-semibold opacity-90">Root Cause:</span> {step.result.portfolioInsights.rootCauseTrend}</li>
                                                {step.result.portfolioInsights.avgResolutionTime && (
                                                  <li><span className="font-semibold opacity-90">Avg Resolution Time:</span> {step.result.portfolioInsights.avgResolutionTime}</li>
                                                )}
                                                {step.result.portfolioInsights.dosRange && (
                                                  <li><span className="font-semibold opacity-90">DOS Range:</span> {step.result.portfolioInsights.dosRange}</li>
                                                )}
                                                <li className="text-emerald-700 font-bold mt-1.5 pt-1 border-t border-emerald-200/60 flex gap-1 items-start">
                                                  <span>💡</span> <span>Prevention: {step.result.portfolioInsights.preventativeRecommendation}</span>
                                                </li>
                                            </ul>
                                        </div>
                                      )}                                    <div className="pt-2">
                                      <span className="text-[10px] font-semibold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-widest">
                                        {step.result.status}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Business Metrics Dashboard */}
                    {workflow.businessMetrics && (
                      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-emerald-600 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" /> Business & Operational Impact Analysis
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Claim Amount</div>
                            <div className="text-2xl font-bold text-blue-600">${workflow.businessMetrics.claimAmount}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Est. Recovery</div>
                            <div className="text-2xl font-bold text-emerald-600">${workflow.businessMetrics.estimatedRecovery}</div>
                            <div className="text-[10px] text-gray-500 mt-1">{workflow.businessMetrics.recoveryRate}% recovery rate</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Time Saved</div>
                            <div className="text-2xl font-bold text-yellow-600">{workflow.businessMetrics.timeSavedMinutes}m</div>
                            <div className="text-[10px] text-gray-500 mt-1">${workflow.businessMetrics.timeSavedValue} value</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Automation Level</div>
                            <div className="text-2xl font-bold text-indigo-600">{workflow.businessMetrics.automationLevel}%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Tasks Automated</div>
                            <div className="text-2xl font-bold text-cyan-600">{workflow.businessMetrics.tasksAutomated}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold flex items-center justify-between mb-1">
                                ROI Multiple 
                                <span className="text-[8px] text-gray-400 normal-case bg-gray-200 px-1.5 py-0.5 rounded" title="(Recovery / Cost)">Formula</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">{workflow.businessMetrics.roi}x</div>
                          </div>
                        </div>
                        
                        {workflow.businessMetrics.operationalImpact && (
                            <div className="mt-4 bg-sky-50/50 p-4 border border-sky-100 rounded-lg flex items-center justify-between shadow-inner">
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-sky-700 mb-0.5">Denial Resolution Time</span>
                                    <span className="text-sm font-extrabold text-slate-800">↓ {workflow.businessMetrics.operationalImpact.denialResolutionTimeDecrease}</span>
                                </div>
                                <div className="h-6 w-px bg-sky-200"></div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-sky-700 mb-0.5">Manual Effort</span>
                                    <span className="text-sm font-extrabold text-slate-800">↓ {workflow.businessMetrics.operationalImpact.manualEffortDecrease}</span>
                                </div>
                                <div className="h-6 w-px bg-sky-200"></div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-sky-700 mb-0.5">First Pass Yield (Proj)</span>
                                    <span className="text-sm font-extrabold text-emerald-600">{workflow.businessMetrics.operationalImpact.firstPassYieldProjectedIncrease}</span>
                                </div>
                            </div>
                        )}
                      </section>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Claim Selected</h2>
                <p className="text-gray-500 max-w-md">Select a claim from the list or submit a new one to start the multi-agent orchestration workflow.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


