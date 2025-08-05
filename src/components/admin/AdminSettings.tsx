import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, User, Settings as SettingsIcon, CreditCard, Building2, Shield, AlertCircle } from "lucide-react";
import {
  getAdminSetting,
  updateBankDetails,
  updateStoreDetails,
} from "@/Api/AdminSetting";
import { getAdminInfo, updateAdminEmail } from "@/Api/AdminAuth";
import { Eye, EyeOff, Pencil, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminSettings = () => {
  const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Super Admin",
  });
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(""); // For confirming identity
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [storeInfo, setStoreInfo] = useState({
    storeName: "",
    storeDescription: "",
    storeAddress: "",
    storePhone: "",
    storeEmail: "",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    sortCode: "",
  });

  const [isPaymentEditable, setIsPaymentEditable] = useState(false);
  const [isStoreEditable, setIsStoreEditable] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, adminRes] = await Promise.all([
          getAdminSetting(),
          getAdminInfo(),
        ]);

        const data = settingsRes?.data || settingsRes.settings;
        const admin = adminRes?.user;

        if (data?.storeInfo) {
          setStoreInfo({
            storeName: data.storeInfo.name || "",
            storeEmail: data.storeInfo.email || "",
            storePhone: data.storeInfo.phone || "",
            storeAddress: data.storeInfo.address || "",
            storeDescription: data.storeInfo.description || "",
          });
        }

        if (data?.bankInfo) {
          setPaymentInfo({
            bankName: data.bankInfo.bankName || "",
            accountNumber: data.bankInfo.accountNumber || "",
            accountName: data.bankInfo.accountName || "",
            sortCode: "",
          });
        }

        if (admin) {
          setAdminInfo({
            name: admin.name || "", // not provided in API
            email: admin.email || "",
            phone: admin.phoneNumber || "",
            role: "Super Admin",
          });
        }
      } catch (error) {
        console.error("Failed to fetch admin or settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleAdminInfoChange = (field: string, value: string) => {
    setAdminInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleStoreInfoChange = (field: string, value: string) => {
    setStoreInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentInfoChange = (field: string, value: string) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      setSaveStatus("idle");
      localStorage.setItem("adminInfo", JSON.stringify(adminInfo));
      localStorage.setItem("storeInfo", JSON.stringify(storeInfo));
      localStorage.setItem("paymentInfo", JSON.stringify(paymentInfo));

      if (isEmailEditable) {
        if (!currentPassword) {
          setSaveStatus("error");
          return;
        }
      }

      // Update Email
      if (isEmailEditable && currentPassword) {
        await updateAdminEmail({
          email: adminInfo.email,
          password: currentPassword,
        });
        setIsEmailEditable(false);
        setCurrentPassword("");
      }

      // Update store details
      if (isStoreEditable) {
        await updateStoreDetails(storeInfo);
        setIsStoreEditable(false);
      }

      // Update payment details
      if (isPaymentEditable) {
        await updateBankDetails(paymentInfo);
        setIsPaymentEditable(false);
      }

      setSaveStatus("success");
      setIsLoading(false);
      
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setIsLoading(false);
      setSaveStatus("error");
      console.error("Update failed:", error.response?.data || error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account, store, and payment information
        </p>
      </div>

      {/* Save Status Alert */}
      {saveStatus === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {saveStatus === "error" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to save settings. Please try again.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Admin Information
              </CardTitle>
              <CardDescription>
                Update your personal admin account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminName">Full Name</Label>
                <Input
                  id="adminName"
                  value={adminInfo.name}
                  disabled={true} // Admin name is not editable
                  onChange={(e) => handleAdminInfoChange("name", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div className="relative">
                <Label
                  htmlFor="adminEmail"
                  className="flex justify-between items-center"
                >
                  Email
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEmailEditable(!isEmailEditable)}
                    className="h-6 w-6 p-0"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminInfo.email}
                  disabled={!isEmailEditable}
                  onChange={(e) => handleAdminInfoChange("email", e.target.value)}
                />
              </div>

              {isEmailEditable && (
                <div className="relative">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="adminPhone">Phone Number</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  value={adminInfo.phone}
                  disabled={true} // Phone number is not editable
                  onChange={(e) => handleAdminInfoChange("phone", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <Label htmlFor="adminRole">Role</Label>
                <Input
                  id="adminRole"
                  value={adminInfo.role}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Store Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                Store Information
              </CardTitle>
              <CardDescription>
                Manage your store details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["storeName", "Store Name"],
                ["storeEmail", "Store Email"],
                ["storePhone", "Store Phone"],
              ].map(([field, label]) => (
                <div key={field}>
                  <Label htmlFor={field}>{label}</Label>
                  <Input
                    id={field}
                    value={storeInfo[field as keyof typeof storeInfo]}
                    disabled={!isStoreEditable}
                    onChange={(e) => handleStoreInfoChange(field, e.target.value)}
                  />
                </div>
              ))}
              <div>
                <Label htmlFor="storeDescription">Description</Label>
                <Textarea
                  id="storeDescription"
                  rows={2}
                  value={storeInfo.storeDescription}
                  onChange={(e) =>
                    handleStoreInfoChange("storeDescription", e.target.value)
                  }
                  disabled={!isStoreEditable}
                  placeholder="Enter store description..."
                />
              </div>
              <div>
                <Label htmlFor="storeAddress">Address</Label>
                <Textarea
                  id="storeAddress"
                  rows={2}
                  value={storeInfo.storeAddress}
                  onChange={(e) =>
                    handleStoreInfoChange("storeAddress", e.target.value)
                  }
                  disabled={!isStoreEditable}
                  placeholder="Enter store address..."
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStoreEditable(!isStoreEditable)}
                >
                  {isStoreEditable ? "Cancel" : "Edit Store Info"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Payment Information
              </CardTitle>
              <CardDescription>
                Bank details for customer payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["bankName", "Bank Name"],
                  ["accountName", "Account Name"],
                  ["accountNumber", "Account Number"],
                  ["sortCode", "Sort Code"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <Label htmlFor={field}>{label}</Label>
                    <Input
                      id={field}
                      value={paymentInfo[field as keyof typeof paymentInfo]}
                      onChange={(e) =>
                        handlePaymentInfoChange(field, e.target.value)
                      }
                      disabled={!isPaymentEditable}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaymentEditable(!isPaymentEditable)}
                >
                  {isPaymentEditable ? "Cancel" : "Edit Payment Info"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Separator />

      <motion.div 
        className="flex justify-end"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button
          onClick={handleSaveSettings}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Save className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AdminSettings;
