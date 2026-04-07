import { db } from './firestore.js';
import { Claim, Workflow, DenialPattern } from '../types/index.js';

export const collections = {
  claims: db.collection('claims'),
  workflows: db.collection('workflows'),
  patterns: db.collection('patterns'),
  executionHistory: db.collection('executionHistory')
};

// ==========================================
// CLAIMS QUERIES
// ==========================================
export async function createClaim(claim: Claim): Promise<void> {
  await collections.claims.doc(claim.id).set(claim);
}

export async function getClaim(id: string): Promise<Claim | null> {
  const doc = await collections.claims.doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as Claim;
}

export async function getAllClaims(): Promise<Claim[]> {
  const snapshot = await collections.claims.orderBy('date', 'desc').get();
  return snapshot.docs.map(doc => doc.data() as Claim);
}

export async function updateClaimStatus(id: string, status: string, processedDate?: string): Promise<void> {
  const data: Partial<Claim> = { status };
  if (processedDate) data.processedDate = processedDate;
  await collections.claims.doc(id).update(data);
}

// ==========================================
// WORKFLOW QUERIES
// ==========================================
export async function createWorkflow(workflow: Workflow): Promise<void> {
  await collections.workflows.doc(workflow.id).set(workflow);
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  const doc = await collections.workflows.doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as Workflow;
}

export async function updateWorkflow(id: string, data: Partial<Workflow>): Promise<void> {
  await collections.workflows.doc(id).update(data);
}

// ==========================================
// PATTERNS (ANALYTICS)
// ==========================================
export async function analyzePatterns(): Promise<any> {
    const claimsSnapshot = await collections.claims.where('status', '!=', 'New').get();
    const processedClaims = claimsSnapshot.docs.map(doc => doc.data() as Claim);

    const patterns: any = {};
  
    processedClaims.forEach(claim => {
        const code = claim.denialCode;
        if (!patterns[code]) {
            patterns[code] = { count: 0, totalAmount: 0, lastOccurrence: null };
        }
        patterns[code].count++;
        patterns[code].totalAmount += claim.claimAmount;
        patterns[code].lastOccurrence = claim.processedDate || new Date().toISOString();
    });
  
    const sortedPatterns = Object.entries(patterns)
        .map(([code, data]: any) => ({
            code,
            ...data,
            averageAmount: parseFloat((data.totalAmount / data.count).toFixed(2))
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);
  
    return {
        totalProcessed: processedClaims.length,
        uniqueDenialCodes: Object.keys(patterns).length,
        topPatterns: sortedPatterns,
        weeklyTrend: sortedPatterns[0]?.count || 0
    };
}