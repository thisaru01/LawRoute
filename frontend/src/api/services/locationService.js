import axios from "@/api/axios";

export const getLocationAutocomplete = ({ text, limit = 5 }) => {
  return axios.get("/location/autocomplete", {
    params: { text, limit },
    timeout: 12000,
  });
};

export const getUniversityAutocomplete = ({ text, limit = 8 }) => {
  return axios.get("/location/universities", {
    params: { text, limit },
    timeout: 12000,
  });
};