import { Unit } from "./property-types";
import { User } from "./user-types";

export interface CreateTenancyPayload {
  unitId: string;
  ownerId: string;
  tenantId: string;
  agreementId?: string;
  rent: {
    amount: number;
    cycle: "monthly" | "quarterly" | "yearly";
    dueDateDay?: number;
    utilitiesIncluded?: boolean;
  };
  deposit?: {
    amount?: number;
    status?: "upcoming" | "held" | "returned" | "disputed";
  };
  status?: "upcoming" | "active" | "terminated" | "pendingRenewal";
}

export interface Payment {
  paymentId?: string;
  amount: number;
  date: string;
  method?: string;
  reference?: string;
  receiptUrl?: string;
}

export interface Tenancy {
  _id: string;
  unitId: string;
  ownerId: string;
  tenantId: string;
  agreement?: {
    agreementId?: string;
    pdfUrl?: string;
    version?: number;
    signedAt?: string;
  };
  rent: CreateTenancyPayload["rent"];
  deposit?: CreateTenancyPayload["deposit"];
  payments?: Payment[];
  status: NonNullable<CreateTenancyPayload["status"]>;
  createdAt?: string;
  updatedAt?: string;
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
    status?: "upcoming" | "held" | "returned" | "disputed";
  };
  clauses: Array<{
    key?: string;
    text: string;
  }>;
  templateName?: string;
  stateCode?: string;
}

export interface TenancyWizardState {
  step: 1 | 2 | 3 | 4 | 5;
  selectedUnit: Unit | null;
  selectedTenant: User | null;
  isSubmitting: boolean;
  formData: AgreementFormData | null;
  agreementId: string | null;
}

export interface TenancyWizardActions {
  setStep: (step: TenancyWizardState["step"]) => void;
  setSelectedUnit: (unit: Unit | null) => void;
  setSelectedTenant: (tenant: User | null) => void;
  setFormData: (data: Partial<AgreementFormData>) => void;
  setAgreementId: (agreementId: string | null) => void;
  resetWizard: () => void;
}
