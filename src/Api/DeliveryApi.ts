import axios from "axios";

const API_BASE_URL = "https://med-kit-lab-ces-be.onrender.com/api/delivery";

export interface DeliveryDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  deliveryInstructions?: string;
}

export const addDeliveryDetails = async (
  customerId: string,
  details: DeliveryDetails
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${customerId}`, details);
    return response.data;
  } catch (error: any) {
    console.log(error);
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.message || "Failed to add delivery details"
      );
    }
    throw new Error("Failed to add delivery details");
  }
};
