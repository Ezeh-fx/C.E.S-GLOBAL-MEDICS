import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Package, User, Truck, CreditCard, Calendar, MapPin, Phone, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { updateOrderStatus } from "@/Api/OrderProduct";
import { motion } from "framer-motion";

interface OrderDetailModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  reloadOrders?: () => Promise<void>;
}

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

const getPaymentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  }
};

const statusOptions = [
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  reloadOrders,
}) => {
  const [status, setStatus] = useState(order?.status || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  React.useEffect(() => {
    setStatus(order?.status || "");
    setError("");
    setSuccess("");
  }, [order]);

  if (!order) return null;

  const items = order.items || [];
  const delivery = order.deliveryDetails || {};
  const customer = order.customerInfo || {};

  const canEditStatus = !["completed", "delivered", "cancelled"].includes(
    (order.status || "").toLowerCase()
  );

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setError("");
    setSuccess("");
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateOrderStatus(order._id, status);
      console.log("Update response:", res);
      setSuccess("Order status updated successfully");
      if (reloadOrders) await reloadOrders();
      // Optionally update order.status in parent
    } catch (err: any) {
      setError(err.message || "Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">Order Details</DialogTitle>
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

        {/* Status Update Alert */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Order & Customer Info */}
          <div className="space-y-6">
            {/* Order Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Order ID:</span>
                      <span className="font-mono text-sm">#{order._id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="text-sm">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-semibold text-lg">
                        ₦{order.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Shipping:</span>
                      <span className="font-semibold">
                        ₦{order.shippingFee?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(status)}>{status}</Badge>
                        {canEditStatus && (
                          <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Payment:</span>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </div>

                    {canEditStatus && (
                      <Button
                        onClick={handleUpdateStatus}
                        disabled={loading || status === order.status}
                        className="w-full"
                        size="sm"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Status"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Customer Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{customer.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="text-sm">
                        <div>{customer.address}</div>
                        <div className="text-gray-500">
                          {customer.city}, {customer.state} {customer.zipCode}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delivery Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{delivery.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{delivery.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="text-sm">
                        <div>{delivery.address}</div>
                        <div className="text-gray-500">
                          {delivery.city}, {delivery.state} {delivery.zipCode}
                        </div>
                        {delivery.landmark && (
                          <div className="text-gray-500">Landmark: {delivery.landmark}</div>
                        )}
                      </div>
                    </div>
                    {delivery.deliveryInstructions && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div className="font-medium">Instructions:</div>
                        <div>{delivery.deliveryInstructions}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Items Table */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  Order Items ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Brand</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Qty</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Price</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Subtotal</th>
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
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {item.product?.productName || "-"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.product?.category}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-900 dark:text-white">
                            {item.brandName}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-900 dark:text-white">
                            {item.quantity}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-900 dark:text-white">
                            ₦{item.price?.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-white">
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
        </div>

        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              Updated: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "-"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
