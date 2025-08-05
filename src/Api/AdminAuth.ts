import axios from "axios";

const API_BASE_URL = "https://med-kit-lab-ces-be.onrender.com";

interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

export const adminRegister = async (credentials: RegisterCredentials) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/setup`,
      credentials
    );
    return response.data;
  } catch (error) {
    console.error("Admin registration failed:", error);
    throw error;
  }
};

export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Admin login failed:", error);
    throw error;
  }
};

export const getAdminInfo = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/admin`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin info:", error);
    throw error;
  }
};

export const updateAdminEmail = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/auth/update-email`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update admin email:", error);
    throw error;
  }
};
