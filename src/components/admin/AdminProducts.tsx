import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Loader2,
  AlertCircle,
  Package,
  TrendingUp,
  AlertTriangle,
  Plus,
  Filter,
} from "lucide-react";
import ProductDetailModal from "./ProductDetailModal";
import {
  getAllProducts,
  deleteProduct,
  updateProduct,
} from "@/Api/AdminProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Brand {
  name: string;
  price: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  brands: Brand[];
  description?: string;
  images: (string | File)[];
  createdAt?: string;
  updatedAt?: string;
}

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [outOfStockProducts, setOutOfStockProducts] = useState(0);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllProducts();
      console.log("📦 API Response:", res);

      const fetchedProducts = (res.products || []).map((product: any) => ({
        id: product._id,
        name: product.productName,
        category: product.category,
        brands: Array.isArray(product.brands) ? product.brands : [],
        description: product.description,
        images: product.productImages || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      setProducts(fetchedProducts);
      setTotalProducts(fetchedProducts.length);
      setActiveProducts(
        fetchedProducts.filter((p) => p.brands.some((b) => b.stock > 0)).length
      );
      setOutOfStockProducts(
        fetchedProducts.filter((p) => p.brands.every((b) => b.stock === 0))
          .length
      );
    } catch (err: any) {
      console.error("❌ Failed to fetch products:", err);
      setError(err?.response?.data?.message || "Failed to load products");
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brands?.some((brand) =>
        brand.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async (
    updatedProduct: Product,
    imagesTouched: boolean
  ) => {
    try {
      const form = new FormData();
      form.append("productName", updatedProduct.name || "");
      form.append("category", updatedProduct.category);
      form.append("description", updatedProduct.description || "");
      form.append("brands", JSON.stringify(updatedProduct.brands));

      // Only send images if imagesTouched is true
      if (imagesTouched) {
        const newImages = updatedProduct.images.filter(
          (img) => img instanceof File
        );
        newImages.forEach((img: File) => {
          form.append("productImages", img);
        });
      }

      console.log("📤 Sending update data:", {
        productName: updatedProduct.name,
        category: updatedProduct.category,
        imagesTouched,
        totalImages: updatedProduct.images.length,
        allImages: updatedProduct.images.map((img, idx) => ({
          index: idx,
          type: typeof img,
          isFile: img instanceof File,
          value: img instanceof File ? img.name : img,
        })),
      });

      const response = await updateProduct(updatedProduct.id, form);
      console.log("📥 Update response:", response);

      // Update local state with the response data
      if (response.product) {
        const updatedProductData = {
          id: response.product._id || response.product.id,
          name: response.product.productName || response.product.name,
          category: response.product.category,
          brands: response.product.brands || [],
          description: response.product.description,
          images:
            response.product.productImages || response.product.images || [],
          createdAt: response.product.createdAt,
          updatedAt: response.product.updatedAt,
        };

        setProducts((prev) =>
          prev.map((p) => (p.id === updatedProduct.id ? updatedProductData : p))
        );
      } else {
        // Fallback: update with processed data
        const processedProduct = {
          ...updatedProduct,
          images: updatedProduct.images.map((img) =>
            img instanceof File ? URL.createObjectURL(img) : img
          ),
        };

        setProducts((prev) =>
          prev.map((p) => (p.id === updatedProduct.id ? processedProduct : p))
        );
      }

      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      // Reload products to get the latest data from server
      await loadProducts();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("❌ Update failed:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);

      // Update local state
      setProducts((prev) => prev.filter((p) => p.id !== productId));

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    } catch (err: any) {
      console.error("❌ Failed to delete product:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (product: Product) => {
    const hasStock = product.brands.some((b) => b.stock > 0);
    return hasStock
      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
  };

  const getStatusText = (product: Product) => {
    const hasStock = product.brands.some((b) => b.stock > 0);
    return hasStock ? "In Stock" : "Out of Stock";
  };

  const getLowestPrice = (product: Product) => {
    if (!product.brands.length) return 0;
    return Math.min(...product.brands.map((b) => Number(b.price) || 0));
  };

  const getTotalStock = (product: Product) => {
    return product.brands.reduce((sum, b) => sum + (b.stock || 0), 0);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Product Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and view all products in your inventory
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">All products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">Available products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(products.map((p) => p.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search products by name, category, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Medical Equipment">Medical Equipment</SelectItem>
            <SelectItem value="Laboratory Kits">Laboratory Kits</SelectItem>
            <SelectItem value="Reagents">Reagents</SelectItem>
            <SelectItem value="Disposables">Disposables</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => navigate("/admin/new-product")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading products...</span>
              </div>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || categoryFilter
                  ? "No products found matching your filters."
                  : "No products found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedProducts.map((product) => (
                    <motion.tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images.length > 0 && (
                            <img
                              src={
                                typeof product.images[0] === "string"
                                  ? product.images[0]
                                  : product.images[0] instanceof File
                                  ? URL.createObjectURL(product.images[0])
                                  : product.images[0]
                              }
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  product.images[0]
                                );
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {product.brands.length} brand
                              {product.brands.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₦{getLowestPrice(product).toLocaleString()}
                        {product.brands.length > 1 && (
                          <span className="text-gray-500">
                            {" "}
                            - ₦
                            {Math.max(
                              ...product.brands.map((b) => Number(b.price) || 0)
                            ).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getTotalStock(product)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(product)}>
                          {getStatusText(product)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onUpdate={handleUpdateProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </motion.div>
  );
};

export default AdminProducts;
