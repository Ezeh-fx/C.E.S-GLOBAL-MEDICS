import axios from "axios";

const API_BASE_URL = "https://med-kit-lab-ces-be.onrender.com";

export const getAdminSetting = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/settings`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin settings:", error);
    throw error;
  }
};

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const updateBankDetails = async (
  bankDetails: BankInfo
): Promise<any> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/settings/bank`,
      bankDetails
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update bank details:", error);
    throw error;
  }
};

// interface StoreDetails {
//   storeName: string;
//   storeDescription: string;
//   storeAddress: string;
//   storePhone: string;
//   storeEmail: string;
// }

export const updateStoreDetails = async (storeInfo: {
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
}): Promise<any> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/settings/store`, {
      name: storeInfo.storeName,
      description: storeInfo.storeDescription,
      address: storeInfo.storeAddress,
      phone: storeInfo.storePhone,
      email: storeInfo.storeEmail,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update store details:", error);
    throw error;
  }
};
