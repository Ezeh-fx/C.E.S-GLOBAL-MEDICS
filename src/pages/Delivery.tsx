import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getPaymentProof } from "@/Api/CheckOutApi";
import { addDeliveryDetails } from "@/Api/DeliveryApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentProofData {
  session: {
    _id: string;
    customerId: {
      _id: string;
      email: string;
      fullName: string;
      phone: string;
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
    items: Array<{
      product: {
        _id: string;
        productName: string;
        category: string;
      };
      brandName: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    shippingFee: number;
    paymentStatus: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
    sessionNumber: string;
    __v: number;
    paymentProof: string;
  };
}

const Delivery = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentProofData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    additionalInfo: "",
  });

  const customerId = useSelector(
    (state: RootState) => state.customer.customer?._id
  );
  const sessionId = useSelector((state: RootState) => state.cart.sessionId);
  console.log(sessionId);
  const id = localStorage.getItem("paymentProof");

  useEffect(() => {
    const fetchPaymentProof = async () => {
      if (!customerId || !sessionId) {
        setError("Missing customer ID or session ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getPaymentProof(id);
        console.log(data);
        setPaymentData(data);

        // Pre-fill delivery info with customer data (with fallbacks)
        setDeliveryInfo({
          fullName: data.session.customerId.fullName || "",
          phone: data.session.customerId.phone || "",
          address: data.session.customerId.address?.street || "",
          city: data.session.customerId.address?.city || "",
          state: data.session.customerId.address?.state || "",
          zipCode: data.session.customerId.address?.zipCode || "",
          additionalInfo: "",
        });
      } catch (error) {
        console.error("Error fetching payment proof:", error.message);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch payment proof"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentProof();
  }, [customerId, sessionId]);

  const handleInputChange = (field: string, value: string) => {
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitDelivery = async () => {
    if (
      !deliveryInfo.fullName ||
      !deliveryInfo.phone ||
      !deliveryInfo.address
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!customerId) {
      toast({
        title: "Error",
        description: "Missing session information",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await addDeliveryDetails(customerId, {
        fullName: deliveryInfo.fullName,
        phone: deliveryInfo.phone,
        address: deliveryInfo.address,
        city: deliveryInfo.city,
        state: deliveryInfo.state,
        zipCode: deliveryInfo.zipCode, // You may want to add a zipCode field to your form and state
        landmark: "", // You may want to add a landmark field to your form and state
        deliveryInstructions: deliveryInfo.additionalInfo,
      });

      // Store order to localStorage
      const orderData = {
        orderId: paymentData?.session.sessionNumber || `ORDER-${Date.now()}`,
        customerId: customerId,
        sessionId: sessionId,
        orderDate: new Date().toISOString(),
        items: paymentData?.session.items || [],
        totalAmount: paymentData?.session.totalAmount || 0,
        shippingFee: paymentData?.session.shippingFee || 0,
        paymentStatus: paymentData?.session.paymentStatus || "pending",
        deliveryInfo: {
          fullName: deliveryInfo.fullName,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          state: deliveryInfo.state,
          zipCode: deliveryInfo.zipCode,
          additionalInfo: deliveryInfo.additionalInfo,
        },
        orderStatus: "delivery_requested",
        createdAt: new Date().toISOString(),
      };

      // Get existing orders from localStorage
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      
      // Add new order to the array
      existingOrders.push(orderData);
      
      // Store updated orders back to localStorage
      localStorage.setItem("orders", JSON.stringify(existingOrders));

      console.log("Order stored to localStorage:", orderData);

      toast({
        title: "Success",
        description: "Delivery details submitted successfully",
      });

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting delivery details:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit delivery details"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit delivery details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to home page
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const isPaymentConfirmed = paymentData?.session.paymentStatus === "approved";

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading delivery information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                to="/"
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
              >
                C.E.S GLOBAL MEDICS
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              to="/"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                to="/"
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
              >
                C.E.S GLOBAL MEDICS
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              to="/"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No checkout data available</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600 dark:text-blue-400"
            >
              C.E.S GLOBAL MEDICS
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Session ID</Label>
                <p className="text-lg font-mono">
                  #{paymentData.session.sessionNumber}
                </p>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Badge
                  className={getStatusColor(paymentData.session.paymentStatus)}
                >
                  {paymentData.session.paymentStatus}
                </Badge>
              </div>
              <div>
                <Label>Total Amount</Label>
                <p className="text-xl font-bold text-green-600">
                  ₦
                  {(
                    paymentData.session.totalAmount +
                    paymentData.session.shippingFee
                  ).toLocaleString()}
                </p>
              </div>
              {isPaymentConfirmed ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="w-5 h-5" />
                    <p className="text-sm">
                      Payment confirmed! You can now place your delivery order.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <Clock className="w-5 h-5" />
                    <p className="text-sm">
                      Payment not approved. Please wait for admin to approve
                      payment.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={deliveryInfo.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    disabled={!isPaymentConfirmed}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={deliveryInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isPaymentConfirmed}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  value={deliveryInfo.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  disabled={!isPaymentConfirmed}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={deliveryInfo.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    disabled={!isPaymentConfirmed}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={deliveryInfo.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    disabled={!isPaymentConfirmed}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="state">Zipcode </Label>
                <Input
                  id="state"
                  value={deliveryInfo.zipCode}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  disabled={!isPaymentConfirmed}
                />
              </div>
              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={deliveryInfo.additionalInfo}
                  onChange={(e) =>
                    handleInputChange("additionalInfo", e.target.value)
                  }
                  rows={2}
                  disabled={!isPaymentConfirmed}
                />
              </div>
              <Button
                onClick={handleSubmitDelivery}
                disabled={loading || !isPaymentConfirmed}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : !isPaymentConfirmed ? (
                  "Payment Not Approved"
                ) : (
                  "Place Delivery Order"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentData.session.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {item.product.productName} ({item.brandName})
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Category: {item.product.category}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span>
                    ₦{paymentData.session.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping Fee</span>
                  <span>
                    ₦{paymentData.session.shippingFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>
                    ₦
                    {(
                      paymentData.session.totalAmount +
                      paymentData.session.shippingFee
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={handleSuccessModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Delivery Request Sent Successfully!
            </DialogTitle>
            <DialogDescription>
              Your delivery information has been sent to the admin for
              processing. You will receive a confirmation once your order is
              dispatched.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleSuccessModalClose}>Continue to Home</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Delivery;
