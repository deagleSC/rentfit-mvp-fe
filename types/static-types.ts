export interface StaticState {
  countries: Country[];
  states: State[];
  cities: City[];
  isCountriesLoading: boolean;
  isStatesLoading: boolean;
  isCitiesLoading: boolean;
}

export interface StaticActions {
  getCountries: (page: number, limit: number, search: string | null) => void;
  getStates: (
    page: number,
    limit: number,
    countryId: string,
    search?: string | null
  ) => void;
  getCities: (
    page: number,
    limit: number,
    stateId: string,
    search?: string | null
  ) => void;
}

export interface Country {
  _id: string;
  name: string;
  code: string;
  phoneCode: string;
}

export interface State {
  _id: string;
  name: string;
  code: string;
  countryId: string;
}

export interface City {
  _id: string;
  name: string;
  stateId: string;
}
