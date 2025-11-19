export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ROUTES = {
  LOGIN: `${API_URL}/api/auth/login`,
  SIGNUP: `${API_URL}/api/auth/signup`,
  GET_COUNTRIES: `${API_URL}/api/static/countries`,
  GET_STATES: `${API_URL}/api/static/states`,
  GET_CITIES: `${API_URL}/api/static/cities`,
  ADD_UNIT: `${API_URL}/api/units`,
};
