import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  User,
  ShieldCheck,
  PhoneCall,
  Loader2,
  MapPin,
  Building,
  Landmark,
  Locate,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { setCustomer } from "@/redux/slices/customer";
import { motion } from "framer-motion";

const CustomerSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const API_BASE_URL = import.meta.env.DEV
        ? "/api"
        : "https://med-kit-lab-ces-be.onrender.com/api";
      const res = await axios.post(`${API_BASE_URL}/customers`, formData);
      //   const customer = res.data;

      const { customer } = res.data;
      dispatch(
        setCustomer({
          _id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
        })
      );
      console.log("Customer created", customer);

      localStorage.setItem(
        "customer",
        JSON.stringify({
          _id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
        })
      );

      console.log("Customer created", customer);
      navigate("/"); // Redirect to home page after successful signup
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        setErrors(apiErrors.map((e: any) => e.msg));
      } else {
        const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
        setErrors([errorMessage]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6 bg-white shadow-md p-8 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="text-blue-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create Customer Account
          </h2>
          <p className="text-gray-600 text-sm">
            Fill in your details to register
          </p>
        </div>

        {/* Display errors */}
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  {errors.map((err, idx) => (
                    <div key={idx} className="text-sm">{err}</div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setErrors([])}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <InputField
            label="Full Name"
            icon={<User />}
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="Enter your full name"
          />

          {/* Email */}
          <InputField
            label="Email"
            icon={<Mail />}
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter your email"
          />

          {/* Phone */}
          <InputField
            label="Phone Number"
            icon={<PhoneCall />}
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="Enter your phone"
          />

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Create a password"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Address Section */}
          <div className="text-center font-semibold text-gray-700 text-lg mt-6">
            Address Details
          </div>

          {/* Street */}
          <InputField
            label="Street"
            icon={<MapPin />}
            value={formData.address.street}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value },
              })
            }
            placeholder="123 Main Street"
          />

          {/* City */}
          <InputField
            label="City"
            icon={<Building />}
            value={formData.address.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, city: e.target.value },
              })
            }
            placeholder="Lagos"
          />

          {/* State */}
          <InputField
            label="State"
            icon={<Landmark />}
            value={formData.address.state}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, state: e.target.value },
              })
            }
            placeholder="Lagos"
          />

          {/* Zip Code */}
          <InputField
            label="Zip Code"
            icon={<Locate />}
            value={formData.address.zipCode}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, zipCode: e.target.value },
              })
            }
            placeholder="100001"
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default CustomerSignup;

// Reusable input field component
const InputField = ({
  label,
  icon,
  ...props
}: {
  label: string;
  icon: React.ReactNode;
  [key: string]: any;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
        {...props}
      />
    </div>
  </div>
);
