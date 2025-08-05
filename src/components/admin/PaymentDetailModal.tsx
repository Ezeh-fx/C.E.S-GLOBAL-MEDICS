import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, CreditCard, User, Package, Calendar, CheckCircle, XCircle, AlertCircle, Loader2, Eye, Download } from "lucide-react";
import { approvePayment, rejectPayment } from "@/Api/Payment";
import { motion } from "framer-motion";

interface PaymentDetailModalProps {
  payment: any;
  isOpen: boolean;
  onClose: () => void;
  reloadPayments: () => Promise<void>;
}

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

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  isOpen,
  onClose,
  reloadPayments,
}) => {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!payment) return null;

  const handleApprove = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await approvePayment(payment._id);
      setSuccess("Payment approved successfully!");
      await reloadPayments();
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to approve payment");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await rejectPayment(payment._id, rejectReason);
      setSuccess("Payment rejected successfully!");
      await reloadPayments();
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reject payment");
    } finally {
      setLoading(false);
    }
  };

  const customer = payment.customerId || {};
  const items = payment.items || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl sm:text-2xl font-bold">Payment Request Details</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Status Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* Payment Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Session Number:</span>
                    <span className="font-mono text-xs sm:text-sm">{payment.sessionNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Payment ID:</span>
                    <span className="font-mono text-xs sm:text-sm">#{payment._id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <Badge className={`text-xs ${getStatusColor(payment.paymentStatus)}`}>
                      {payment.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="font-semibold text-base sm:text-lg">
                      ₦{payment.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-xs sm:text-sm">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Updated:</span>
                    <span className="text-xs sm:text-sm">
                      {payment.updatedAt ? new Date(payment.updatedAt).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>

                {payment.notes && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-xs sm:text-sm font-medium">Notes:</span>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {payment.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                  </div>
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm sm:text-base">{customer.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs sm:text-sm">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-xs sm:text-sm">{customer.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Items Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 sm:mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                </div>
                Order Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Product</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm hidden sm:table-cell">Brand</th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Qty</th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Price</th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, idx: number) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-2 sm:py-4 px-2 sm:px-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                              {item.product?.productName || "-"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.product?.category}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-gray-900 dark:text-white text-xs sm:text-sm hidden sm:table-cell">
                          {item.brandName}
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-right text-gray-900 dark:text-white text-xs sm:text-sm">
                          {item.quantity}
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-right text-gray-900 dark:text-white text-xs sm:text-sm">
                          ₦{item.price?.toLocaleString()}
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-right font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                          ₦{(item.price * item.quantity)?.toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 sm:mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Proof of Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payment.paymentProof ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={payment.paymentProof}
                      alt="Payment Proof"
                      className="w-48 h-48 sm:w-64 sm:h-64 object-contain border rounded-lg bg-gray-50 dark:bg-gray-800"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => window.open(payment.paymentProof, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      View Full Size
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No proof of payment uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Approve/Reject Actions */}
        {payment.paymentStatus === "submitted" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 sm:mt-6 space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Payment Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Payment
                      </>
                    )}
                  </Button>

                  <div className="space-y-3">
                    <Textarea
                      placeholder="Enter rejection reason..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button
                      onClick={handleReject}
                      disabled={loading || !rejectReason.trim()}
                      className="bg-red-600 hover:bg-red-700 text-white w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Payment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailModal;
