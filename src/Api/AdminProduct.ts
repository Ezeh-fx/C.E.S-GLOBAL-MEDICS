import axios from "axios";

const API_BASE_URL = "https://med-kit-lab-ces-be.onrender.com";

export const getAllProducts = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin products:", error);
    throw error;
  }
};

export const addProduct = async (product: any): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/products`, product, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to add product:", error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<any> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/products/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
};
export const updateProduct = async (
  productId: string,
  productData: any
): Promise<any> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/products/${productId}`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};
