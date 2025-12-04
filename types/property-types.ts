export interface Unit {
  _id?: string;
  ownerId: string;
  title: string;
  address: Address;
  geo: Geo;
  beds: number;
  areaSqFt: number;
  status: string;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  // Legacy fields for backward compatibility
  countryId?: string;
  stateId?: string;
  cityId?: string;
}

export interface Geo {
  type: string;
  coordinates: number[];
}

export interface PropertyState {
  units: Unit[];
  selectedUnit: Unit | null;
  isUnitsLoading: boolean;
  isAddUnitLoading: boolean;
}

export interface PropertyActions {
  addUnit: (unit: Unit) => Promise<Unit | null>;
  getUnits: (ownerId: string) => Promise<Unit[] | null>;
  getUnitById: (id: string) => Promise<Unit | null>;
  setSelectedUnit: (unit: Unit | null) => void;
}
