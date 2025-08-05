import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCustomer } from "@/redux/slices/customer";
import { motion } from "framer-motion";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const API_BASE_URL = import.meta.env.DEV
        ? "/api"
        : "https://med-kit-lab-ces-be.onrender.com/api";
      const res = await axios.post(`${API_BASE_URL}/customers/login`, formData);
      
      // ✅ Assuming the customer is in res.data.data[0]
      const customer = res.data.data[0];

      // ✅ Save only required fields to Redux
      dispatch(
        setCustomer({
          _id: customer._id,
          email: customer.email,
          fullName: customer.fullName,
        })
      );

      console.log("Customer logged in:", customer);
      navigate("/"); // Redirect to home page after successful login
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        setErrors(apiErrors.map((e: any) => e.msg));
      } else {
        const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
        setErrors([errorMessage]);
        console.log(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Login to Customer Account
            </h2>
            <p className="text-gray-600">Access your dashboard</p>
          </div>

          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    {errors.map((err, index) => (
                      <div key={index} className="text-sm">{err}</div>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Enter your password"
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

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </motion.button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have a cusomer account?{" "}
                <Link
                  to="/customer/register"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
