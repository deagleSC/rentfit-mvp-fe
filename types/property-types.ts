export interface Unit {
  ownerId: string;
  title: string;
  address: Address;
  geo: Geo;
  beds: number;
  areaSqFt: number;
  status: string;
}

export interface Address {
  line1: string;
  line2?: string;
  countryId: string;
  stateId: string;
  cityId: string;
  pincode: string;
}

export interface Geo {
  type: string;
  coordinates: number[];
}

export interface PropertyState {
  units: Unit[];
  isUnitsLoading: boolean;
  isAddUnitLoading: boolean;
}

export interface PropertyActions {
  addUnit: (unit: Unit) => Promise<Unit | null>;
}
