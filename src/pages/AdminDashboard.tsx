import React, { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  Plus,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import AdminAuthCheck from "../components/AdminAuthCheck";
import AdminBuyers from "../components/admin/AdminBuyers";
import AdminProducts from "../components/admin/AdminProducts";
import AdminOrders from "../components/admin/AdminOrders";
import AdminPayments from "../components/admin/AdminPayments";
import AdminNewProduct from "../components/admin/AdminNewProduct";
import AdminSettings from "../components/admin/AdminSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getAdminInfo } from "@/Api/AdminAuth";
import { fetchDashboardStats, DashboardStats } from "@/Api/AdminDashboard";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/adminSlices";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const adminSession = localStorage.getItem("adminSession");
        if (adminSession) {
          setAdminInfo(JSON.parse(adminSession));
        } else {
          throw new Error("No admin session found");
        }
      } catch (err) {
        console.error("Error fetching admin info:", err);
        setError("Failed to load admin information");
      } finally {
        setLoading(false);
      }
    };

    const fetchDashboardData = async () => {
      try {
        const stats = await fetchDashboardStats();
        setDashboardStats(stats);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        // Set fallback stats if API fails
        setDashboardStats({
          totalBuyers: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          buyersChange: "+0%",
          productsChange: "+0%",
          ordersChange: "+0%",
          revenueChange: "+0%",
        });
      }
    };

    fetchAdminInfo();
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    dispatch(logout());
    navigate("/admin/login");
  };

  const navigation = [
    { name: "Overview", href: "/admin", icon: BarChart3 },
    { name: "Buyers", href: "/admin/buyers", icon: Users },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "New Product", href: "/admin/new-product", icon: Plus },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const stats = [
    {
      name: "Total Buyers",
      value: dashboardStats ? dashboardStats.totalBuyers.toLocaleString() : "0",
      change: dashboardStats?.buyersChange || "+0%",
      changeType: "positive",
      icon: Users,
    },
    {
      name: "Total Products",
      value: dashboardStats ? dashboardStats.totalProducts.toLocaleString() : "0",
      change: dashboardStats?.productsChange || "+0%",
      changeType: "positive",
      icon: Package,
    },
    {
      name: "Total Orders",
      value: dashboardStats ? dashboardStats.totalOrders.toLocaleString() : "0",
      change: dashboardStats?.ordersChange || "+0%",
      changeType: "positive",
      icon: ShoppingBag,
    },
    {
      name: "Revenue",
      value: dashboardStats ? `₦${dashboardStats.totalRevenue.toLocaleString()}` : "₦0",
      change: dashboardStats?.revenueChange || "+0%",
      changeType: "positive",
      icon: CreditCard,
    },
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="max-w-md mx-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate("/admin/login")} 
            className="mt-4 w-full"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthCheck>
      <div
        className={`min-h-screen ${
          theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
        }`}
      >
        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 z-50 lg:hidden ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.div 
            className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Admin Panel
              </h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveRoute(item.href)
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t dark:border-gray-700">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to logout? You will be redirected to
                      the login page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r dark:border-gray-700">
            <div className="flex h-16 items-center px-4">
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Admin Panel
              </h1>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveRoute(item.href)
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t dark:border-gray-700">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to logout? You will be redirected to
                      the login page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-500" />
            </button>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {adminInfo?.name || "Admin"}
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="p-6">
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard Overview
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        Welcome to your admin dashboard
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {stats.map((stat, index) => (
                        <motion.div
                          key={stat.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                {stat.name}
                              </CardTitle>
                              <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {!dashboardStats ? (
                                  <div className="flex items-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Loading...</span>
                                  </div>
                                ) : (
                                  stat.value
                                )}
                              </div>
                              <Badge 
                                variant={stat.changeType === "positive" ? "default" : "destructive"}
                                className="mt-1"
                              >
                                {stat.change}
                              </Badge>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-400">
                            No recent activity to display.
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button asChild className="w-full">
                            <Link to="/admin/new-product">
                              <Plus className="w-4 h-4 mr-2" />
                              Add New Product
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="w-full">
                            <Link to="/admin/orders">
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              View Orders
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="w-full">
                            <Link to="/admin/buyers">
                              <Users className="w-4 h-4 mr-2" />
                              Manage Buyers
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                }
              />
              <Route path="/buyers" element={<AdminBuyers />} />
              <Route path="/products" element={<AdminProducts />} />
              <Route path="/new-product" element={<AdminNewProduct />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/payments" element={<AdminPayments />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </AdminAuthCheck>
  );
};

export default AdminDashboard;
