import React, { useEffect, useState } from "react";
import { getAllPaymentRequests } from "@/Api/Payment";
import { Eye, Loader2, Search, Filter, CreditCard, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PaymentDetailModal from "./PaymentDetailModal";
import { motion } from "framer-motion";

const AdminPayment = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { sessions, totalPages: apiTotalPages } =
        await getAllPaymentRequests({
          status: statusFilter !== "All" ? statusFilter : undefined,
          page: currentPage,
        });
      setPayments(sessions);
      setTotalPages(apiTotalPages || 1);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setPayments([]);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line
  }, [statusFilter, currentPage]);

  const filteredPayments = payments.filter((payment) => {
    const customer = payment.customerId?.fullName || "";
    const matchesSearch =
      customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment._id || "").toString().includes(searchTerm);
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const stats = [
    {
      title: "Total Payments",
      value: payments.length,
      icon: CreditCard,
      color: "text-blue-600",
    },
    {
      title: "Submitted",
      value: payments.filter(p => p.paymentStatus?.toLowerCase() === "submitted").length,
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: "Approved",
      value: payments.filter(p => p.paymentStatus?.toLowerCase() === "approved").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Rejected",
      value: payments.filter(p => p.paymentStatus?.toLowerCase() === "rejected").length,
      icon: XCircle,
      color: "text-red-600",
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
          Payment Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage customer payment submissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                placeholder="Search by customer name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    Customer
                  </th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    Amount
                  </th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="py-8 flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Loader2 className="animate-spin w-5 h-5" />
                        <span className="text-sm">Loading Payments...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                        <p className="text-sm">No payment requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsModalOpen(true);
                      }}
                    >
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                              {payment.customerId?.fullName || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              #{payment._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                        ₦{payment.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <Badge className={`text-xs ${getStatusColor(payment.paymentStatus)}`}>
                          {payment.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden md:table-cell">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString()
                          : "-"}
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
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
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
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reloadPayments={loadPayments}
      />
    </motion.div>
  );
};

export default AdminPayment;
