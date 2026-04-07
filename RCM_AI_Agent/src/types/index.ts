export enum ClaimLifecycleState {
  Submitted = 'Submitted',
  Denied = 'Denied',
  Analyzed = 'Analyzed',
  ActionPlanned = 'Action Planned',
  InProgress = 'In Progress',
  ReadyForResubmission = 'Ready for Resubmission',
  PendingValidation = 'Pending Validation',
  Resolved = 'Resolved'
}

export interface Claim {
  id: string; // Document ID
  patientName: string;
  claimAmount: number;
  denialCode: string;
  denialDescription: string;
  payer?: string;
  dateOfService?: string;
  status: string;
  date: string;
  processedDate?: string;
}

export interface WorkflowStep {
  name: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Pending Human Review';
  result?: any;
  reasoning?: string[];
}

export interface LifecycleEvent {
  state: ClaimLifecycleState | string;
  timestamp: string;
}

export interface ApiMetrics {
  executionId: string;
  endpoint: string;
  requestTime: string;
  responseTime: string | null;
  duration: string | null;
}

export interface MCPEvent {
  tool: string;
  action: string;
  status: string;
  eventId?: string;
  rowId?: string;
  taskCount?: number;
}

export interface Workflow {
  id: string; // Document ID
  claimId: string;
  status: 'Running' | 'Completed' | 'Failed';
  steps: WorkflowStep[];
  startTime: string;
  endTime?: string;
  apiMetrics: ApiMetrics;
  lifecycle: LifecycleEvent[];
  
  // Agent specific outputs
  managerAgent?: any;
  businessMetrics?: {
    claimAmount: number;
    estimatedRecovery: number;
    recoveryRate: number;
    timeSavedMinutes: number;
    timeSavedValue: number;
    tasksAutomated: number;
    automationLevel: number;
    roi: number;
    operationalImpact?: {
       denialResolutionTimeDecrease: string;
       manualEffortDecrease: string;
       firstPassYieldProjectedIncrease: string;
    };
  };
  reasoning?: any;
  finalSummary?: any;
  error?: string;
}

export interface DenialPattern {
  code: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  lastOccurrence: string | null;
}
