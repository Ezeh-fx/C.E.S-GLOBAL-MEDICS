import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  CreditCard,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadPaymentProof, getCheckoutSummary } from "@/Api/CheckOutApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface CheckoutSummaryData {
  cart: {
    _id: string;
    sessionId: string;
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
  };
  customer: {
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
  storeInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    description: string;
  };
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  summary: {
    subtotal: number;
    shippingFee: number;
    total: number;
  };
}

const Checkout = () => {
  const { clearCart } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutSummaryData | null>(
    null
  );

  const customerId = useSelector(
    (state: RootState) => state.customer.customer._id
  );
  const sessionId = useSelector((state: RootState) => state?.cart.sessionId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  useEffect(() => {
    const fetchCheckoutSummary = async () => {
      if (!customerId || !sessionId) {
        setError("Missing customer ID or session ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getCheckoutSummary(customerId, sessionId);
        console.log("Checkout Summary Data:", data);
        setCheckoutData(data);
      } catch (error) {
        console.error("Error fetching checkout summary:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch checkout summary"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutSummary();
  }, [customerId, sessionId]);

  const handleCheckout = async () => {
    if (!paymentProof) {
      setError("Please upload proof of payment");
      return;
    }

    if (!customerId) {
      setError("Session ID not found");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("paymentProof", paymentProof);

      const res = await uploadPaymentProof(customerId, formData);
      console.log("Payment proof uploaded successfully:", res);
      localStorage.setItem("paymentProof", res?.session?._id);
      // console.log(state);
      clearCart();
      setIsUploading(false);
      navigate("/delivery-details");
    } catch (error) {
      console.error("Checkout error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Checkout failed. Please try again."
      );
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading checkout summary...</span>
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
              to="/cart"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
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

  if (!checkoutData) {
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
              to="/cart"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
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
            to="/cart"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bank Name</Label>
                <p className="text-lg font-medium">
                  {checkoutData.bankInfo.bankName}
                </p>
              </div>
              <div>
                <Label>Account Name</Label>
                <p className="text-lg font-medium">
                  {checkoutData.bankInfo.accountName}
                </p>
              </div>
              <div>
                <Label>Account Number</Label>
                <p className="text-lg font-medium">
                  {checkoutData.bankInfo.accountNumber}
                </p>
              </div>
              <div>
                <Label>Amount to Pay</Label>
                <p className="text-2xl font-bold text-green-600">
                  ₦{checkoutData.summary.total.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Proof */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Upload Proof of Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentProof">Upload Screenshot/Receipt</Label>
                <Input
                  id="paymentProof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                />
              </div>
              {paymentProof && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {paymentProof.name}
                  </p>
                </div>
              )}
              <Button
                onClick={handleCheckout}
                disabled={!paymentProof || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Delivery Details"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Customer Information
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <p className="font-medium">{checkoutData.customer.fullName}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="font-medium">{checkoutData.customer.email}</p>
              </div>
              <div>
                <Label>Phone</Label>
                <p className="font-medium">{checkoutData.customer.phone}</p>
              </div>
              <div>
                <Label>Address</Label>
                <p className="font-medium">
                  {checkoutData.customer.address.street}, {checkoutData.customer.address.city}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {checkoutData.customer.address.state}, {checkoutData.customer.address.zipCode}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {checkoutData.customer.address.country}
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Order Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkoutData.cart.items.map((item, index) => (
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
                  <span>₦{checkoutData.summary.subtotal.toLocaleString()}</span>
                </div>
                {/* <div className="flex justify-between items-center">
                  <span>Shipping Fee</span>
                  <span>
                    ₦{checkoutData.summary.shippingFee.toLocaleString()}
                  </span>
                </div> */}
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₦{checkoutData.summary.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
