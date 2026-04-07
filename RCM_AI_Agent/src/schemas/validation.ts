import { z } from 'zod';

export const createClaimSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    patientName: z.string().min(1, "Patient name is required"),
    claimAmount: z.number().positive("Claim amount must be a positive number"),
    denialCode: z.string().min(1, "Denial code is required"),
    denialDescription: z.string().min(1, "Denial description is required"),
    payer: z.string().optional(),
    dateOfService: z.string().optional(),
  })
});
export const startWorkflowSchema = z.object({
  body: z.object({
    claimId: z.string().min(1, "Claim ID is required")
  })
});
