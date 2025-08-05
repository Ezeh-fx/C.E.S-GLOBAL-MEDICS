import axios from "axios";

const API_BASE_URL = "https://med-kit-lab-ces-be.onrender.com/api/payments";

export interface GetAllPaymentRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const getAllPaymentRequests = async (params: GetAllPaymentRequestsParams = {}) => {
  try {
    const { page = 1, limit = 10, status } = params;
    const query = new URLSearchParams();
    query.append("page", String(page));
    query.append("limit", String(limit));
    if (status) query.append("status", status);
    const response = await axios.get(`${API_BASE_URL}/?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to fetch payment requests");
    }
    throw new Error("Failed to fetch payment requests");
  }
};

export const getPaymentById = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to fetch payment");
    }
    throw new Error("Failed to fetch payment");
  }
};

export const approvePayment = async (id: string, adminNotes?: string) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/approve`, { adminNotes });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to approve payment");
    }
    throw new Error("Failed to approve payment");
  }
};

export const rejectPayment = async (id: string, rejectionReason: string, adminNotes?: string) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/reject`, { rejectionReason, adminNotes });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to reject payment");
    }
    throw new Error("Failed to reject payment");
  }
}; 