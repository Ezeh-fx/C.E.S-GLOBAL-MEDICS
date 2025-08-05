// src/Api/CheckOutApi.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : "https://med-kit-lab-ces-be.onrender.com/api";

// TypeScript interfaces for the checkout summary response
interface Product {
  _id: string;
  productName: string;
  category: string;
}

interface CartItem {
  product: Product;
  brandName: string;
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  sessionId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Customer {
  _id: string;
  email: string;
  fullName: string;
  password: string;
  phone: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
}

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface Summary {
  subtotal: number;
  shippingFee: number;
  total: number;
}

interface CheckoutSummaryResponse {
  cart: Cart;
  customer: Customer;
  storeInfo: StoreInfo;
  bankInfo: BankInfo;
  summary: Summary;
}

// Create a checkout session
export const createCheckoutSession = async (
  customerId: string,
  sessionId: string
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/checkout/${customerId}/${sessionId}`,
      {
        shippingFee: 1000,
        notes: "Handle with care",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

export const getCheckoutSummary = async (
  customerId: string,
  sessionId: string
): Promise<CheckoutSummaryResponse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/checkout/summary/${customerId}/${sessionId}`
    );

    // Validate the response structure
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response format from server");
    }

    const data = response.data as CheckoutSummaryResponse;

    // Validate required fields
    if (
      !data.cart ||
      !data.customer ||
      !data.storeInfo ||
      !data.bankInfo ||
      !data.summary
    ) {
      throw new Error("Missing required fields in checkout summary response");
    }

    return data;
  } catch (error) {
    console.error("Error getting checkout summary:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Checkout session not found");
      } else if (error.response?.status === 401) {
        throw new Error("Unauthorized access to checkout summary");
      } else if (error.response?.status >= 500) {
        throw new Error(
          "Server error occurred while fetching checkout summary"
        );
      }
    }
    throw error;
  }
};

// Upload payment proof
export const uploadPaymentProof = async (
  customerId: string,
  formData: FormData
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payments/upload/${customerId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    throw error;
  }
};

// Add delivery details
export const addDeliveryDetails = async (
  customerId: string,
  sessionId: string,
  deliveryData: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    additionalInfo?: string;
  }
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/delivery/${customerId}/${sessionId}`,
      deliveryData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding delivery details:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Customer or session not found");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid delivery data provided");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error occurred while adding delivery details");
      }
    }
    throw error;
  }
};

export const getPaymentProof = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payments/${id}`);
    return response.data; // This will be a Blob object
  } catch (error) {
    console.error("Error fetching payment proof:", error);
    throw error;
  }
};
