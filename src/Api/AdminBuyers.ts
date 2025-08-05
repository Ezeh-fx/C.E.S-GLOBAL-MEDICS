import axios from "axios";

const API_BASE = "https://med-kit-lab-ces-be.onrender.com/api"; // adjust path

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: string;
}
const API_BASE_URL = "https://med-kit-lab-ces-be.onrender.com";

export async function fetchCustomers(page = 1, limit = 10, search = "") {
  const params: any = { page, limit };
  if (search) params.search = search;
  const res = await axios.get<{ customers: Customer[]; total: number }>(
    `${API_BASE}/customers`,
    { params }
  );
  return res.data;
}

export async function fetchCustomerById(id: string) {
  const res = await axios.get<{ customer: Customer }>(
    `${API_BASE}/customers/${id}`
  );
  return res.data.customer;
}

// Customer management
export const getAllCustomers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  try {
    const { page = 1, limit = 10, search = "" } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await axios.get(
      `${API_BASE_URL}/api/customers?${queryParams}`
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw error;
  }
};
