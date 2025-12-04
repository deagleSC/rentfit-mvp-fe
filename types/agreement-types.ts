export type AgreementStatus =
  | "draft"
  | "pending_signature"
  | "signed"
  | "cancelled";

export interface Clause {
  key?: string;
  text: string;
}

export interface Signature {
  userId: string;
  name?: string;
  method?: "esign" | "otp" | "manual";
  signedAt?: string;
  meta?: Record<string, any>;
}

export interface Agreement {
  _id: string;
  templateName?: string;
  stateCode?: string;
  clauses?: Clause[];
  pdfUrl?: string;
  version?: number;
  createdBy?: string;
  tenancyId?: string;
  tenantId?: string;
  status?: AgreementStatus;
  signers?: Signature[];
  lastSignedAt?: string;
  meta?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAgreementPayload {
  templateName?: string;
  stateCode?: string;
  clauses?: Clause[];
  version?: number;
  createdBy?: string;
  tenancyId?: string;
  status?: AgreementStatus;
  signers?: Array<{
    userId: string;
    name?: string;
    method?: "esign" | "otp" | "manual" | string;
    signedAt?: Date | string;
    meta?: Record<string, any>;
  }>;
  meta?: Record<string, any>;
  // When tenancyId is not provided, use this data directly
  tenancyData?: {
    ownerId: string;
    tenantId: string;
    unitId: string;
    rent: {
      amount: number;
      cycle: "monthly" | "quarterly" | "yearly" | string;
      dueDateDay?: number;
      utilitiesIncluded?: boolean;
    };
    deposit?: {
      amount?: number;
      status?: "upcoming" | "held" | "returned" | "disputed";
    };
  };
}

export interface SignAgreementPayload {
  userId: string;
  name?: string;
  method?: "esign" | "otp" | "manual";
  meta?: Record<string, any>;
}

export interface AgreementFormData {
  rent: {
    amount: number;
    cycle: "monthly" | "quarterly" | "yearly";
    dueDateDay?: number;
    utilitiesIncluded?: boolean;
  };
  deposit?: {
    amount?: number;
    status?: "held" | "returned" | "disputed";
  };
  clauses: Clause[];
  templateName?: string;
  stateCode?: string;
}
