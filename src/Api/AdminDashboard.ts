import axios from "axios";

const API_BASE = "https://med-kit-lab-ces-be.onrender.com/api";

export interface DashboardStats {
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  buyersChange: string;
  productsChange: string;
  ordersChange: string;
  revenueChange: string;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch all the required data
    const [customersRes, productsRes, ordersRes] = await Promise.all([
      axios.get(`${API_BASE}/customers`),
      axios.get(`${API_BASE}/products`),
      axios.get(`${API_BASE}/orders`)
    ]);

    const customers = customersRes.data.customers || customersRes.data || [];
    const products = productsRes.data.products || productsRes.data || [];
    const orders = ordersRes.data.orders || ordersRes.data || [];

    // Calculate total revenue from orders
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + (order.total || 0);
    }, 0);

    // Calculate changes (simplified - you can enhance this with historical data)
    const calculateChange = (current: number) => {
      const change = Math.floor(Math.random() * 20) + 1; // Mock change for now
      return `+${change}%`;
    };

    return {
      totalBuyers: customers.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      buyersChange: calculateChange(customers.length),
      productsChange: calculateChange(products.length),
      ordersChange: calculateChange(orders.length),
      revenueChange: calculateChange(totalRevenue),
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    // Return fallback data
    return {
      totalBuyers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      buyersChange: "+0%",
      productsChange: "+0%",
      ordersChange: "+0%",
      revenueChange: "+0%",
    };
  }
}; 