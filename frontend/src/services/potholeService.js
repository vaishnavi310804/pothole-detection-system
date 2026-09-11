import apiClient from "../api/apiClient";

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/potholes/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const createPothole = async (potholeData) => {
  const response = await apiClient.post("/potholes", potholeData);
  return response.data;
};

export const getAllPotholes = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.reportStatus) params.append("reportStatus", filters.reportStatus);
  if (filters.severity) params.append("severity", filters.severity);

  const response = await apiClient.get("/potholes", { params });
  return response.data;
};

export const getPotholeById = async (id) => {
  const response = await apiClient.get(`/potholes/${id}`);
  return response.data;
};

export const updatePotholeStatus = async (id, reportStatus) => {
  const response = await apiClient.patch(`/potholes/${id}/status`, {
    reportStatus,
  });
  return response.data;
};

export const deletePothole = async (id) => {
  const response = await apiClient.delete(`/potholes/${id}`);
  return response.data;
};
