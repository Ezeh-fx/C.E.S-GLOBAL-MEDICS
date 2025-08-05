import React, { useEffect, useState } from "react";
import { Search, Eye, Loader2, Filter, Calendar, Package, User, CreditCard } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";
import { getAllOrders, getOrderById } from "@/Api/OrderProduct";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { motion } from "framer-motion";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { orders, totalPages: apiTotalPages } = await getAllOrders({ status: statusFilter !== "All" ? statusFilter : undefined, page: currentPage });
      setOrders(orders);
      setTotalPages(apiTotalPages || 1);
      setLoading(false);
      console.log("Orders fetched successfully:", orders);
    } catch (err) {
      setLoading(false);
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line
  }, [statusFilter, currentPage]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.customerInfo?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order._id || "").toString().includes(searchTerm);
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "cancelled":
        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const handleViewOrder = async (order: any) => {
    try {
      const { order: fullOrder } = await getOrderById(order._id);
      setSelectedOrder(fullOrder);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Pending",
      value: orders.filter(o => o.status?.toLowerCase() === "pending").length,
      icon: Calendar,
      color: "text-yellow-600",
    },
    {
      title: "Completed",
      value: orders.filter(o => o.status?.toLowerCase() === "completed" || o.status?.toLowerCase() === "delivered").length,
      icon: CreditCard,
      color: "text-green-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Orders Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and track all customer orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search orders by customer name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Customer</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm hidden sm:table-cell">Items</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm hidden md:table-cell">Shipping</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm hidden lg:table-cell">Payment</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Status</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm hidden md:table-cell">Date</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="py-8 flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Loader2 className="animate-spin w-5 h-5" />
                        <span className="text-sm">Loading Orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-8 h-8 text-gray-400" />
                        <p className="text-sm">No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => handleViewOrder(order)}
                    >
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                              {order.customerInfo?.fullName || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              #{order._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-900 dark:text-white text-xs sm:text-sm hidden sm:table-cell">
                        {order.items?.length || 0} items
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                        ₦{order.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden md:table-cell">
                        ₦{order.shippingFee?.toLocaleString()}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                        <Badge 
                          variant={order.paymentStatus === 'confirmed' ? 'default' : 'secondary'}
                          className={`text-xs ${order.paymentStatus === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden md:table-cell">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
};

export default AdminOrders;
