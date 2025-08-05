import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, AlertCircle, Loader2 } from "lucide-react";
import { getFeaturedProducts } from "@/Api/UserProduct";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";

interface FeaturedProduct {
  _id: string;
  productName: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  productImages: string[];
  stock: number;
  isFeatured: boolean;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, isItemInCart, getItemQuantity, operationLoading } =
    useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getFeaturedProducts(8);
        console.log("Fetched featured products:", res);

        if (res.success) {
          setProducts(res.products || []);
        } else {
          setError(res.error || "Failed to fetch featured products");
          setProducts([]);
        }
      } catch (error: any) {
        console.error("Error fetching featured products:", error);
        setError(error?.message || "Failed to fetch featured products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleQuickAddToCart = async (product: FeaturedProduct) => {
    try {
      await addToCart(
        {
          id: product._id,
          name: product.productName,
          brand: product.brand,
          price: product.price,
          image: product.productImages[0] || "",
        },
        1
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600">
            Top-rated medical supplies trusted by professionals
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-500">Loading featured products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No featured products available
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={product.productImages[0]}
                      alt={product.productName}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.originalPrice > product.price && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Save ₦{product.originalPrice - product.price}
                        </span>
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      {product.category}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {product.productName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.brand}
                    </p>

                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          ₦{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₦{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {isItemInCart(product._id, product.brand) && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          In Cart ({getItemQuantity(product._id, product.brand)}
                          )
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        to={`/product/${product._id}`}
                        className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 ${
                          product.stock === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title="View Product Details"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                      {product.stock > 0 && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickAddToCart(product)}
                          disabled={
                            operationLoading?.type === "ADD" ||
                            isItemInCart(product._id, product.brand)
                          }
                          className="bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Quick Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/products"
                className="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                View All Products
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
