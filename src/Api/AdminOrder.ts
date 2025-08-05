import axios from "axios";
const API_BASE = "https://med-kit-lab-ces-be.onrender.com/api";
export interface Order {
  id: number;
  customer: string;
  total: number;
  status: string;
  date: string;
  items: number;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
}

export const fetchOrders = async (): Promise<{
  orders: Order[];
  total: number;
}> => {
  const res = await axios.get(`${API_BASE}/orders`);
  return res.data;
};
