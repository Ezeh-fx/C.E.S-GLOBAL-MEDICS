import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, AlertCircle, User, ShieldCheck, MessageCircle } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { motion } from "framer-motion";
import { getProductById, getProductReviews } from "@/Api/UserProduct";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { 
    addToCart, 
    getTotalItems, 
    operationLoading, 
    error, 
    clearError,
    isItemInCart,
    getItemQuantity 
  } = useCart();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        console.log("Fetched product:", data?.product);
        setProduct(data?.product);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      setReviewsLoading(true);
      try {
        const data = await getProductReviews(id);
        console.log("Fetched reviews:", data?.reviews);
        setReviews(data?.reviews || []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedBrand) {
      alert("Please select a brand first");
      return;
    }

    const selectedBrandData = product.brands.find(
      (b: any) => b.name === selectedBrand
    );
    if (!selectedBrandData) return;

    addToCart({
      id: product._id,
      name: product.productName,
      brand: selectedBrand,
      price: selectedBrandData.price,
      image: product.productImages?.[selectedImage] || "",
    }, quantity);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  if (!product) return null;

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
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                to="/cart"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {getTotalItems()}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/products"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200">{error.message}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <img
              src={product.productImages?.[selectedImage]}
              alt={product.productName}
              className="w-full h-96 object-cover rounded-lg mb-4"
            />
            <div className="flex space-x-2 overflow-x-auto">
              {product.productImages?.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`Product ${index}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                    selectedImage === index
                      ? "border-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {product.productName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {product.category}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Select Brand
              </h3>
              <div className="space-y-3">
                {product.brands?.map((brand: any) => (
                  <label
                    key={brand.name}
                    className="flex items-center justify-between p-3 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        value={brand.name}
                        checked={selectedBrand === brand.name}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium dark:text-white">
                          {brand.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          ({brand.stock} in stock)
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ₦{brand.price.toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Quantity
              </h3>
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4 dark:text-white" />
                </motion.button>
                <input
                  type="number"
                  min="1"
                  max={selectedBrand ? product.brands.find((b: any) => b.name === selectedBrand)?.stock || 1 : 1}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const maxStock = selectedBrand ? product.brands.find((b: any) => b.name === selectedBrand)?.stock || 1 : 1;
                    setQuantity(Math.max(1, Math.min(value, maxStock)));
                  }}
                  className="px-4 py-2 border dark:border-gray-600 rounded-md text-center min-w-[80px] dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  onClick={() => {
                    const maxStock = selectedBrand ? product.brands.find((b: any) => b.name === selectedBrand)?.stock || 1 : 1;
                    setQuantity(Math.min(quantity + 1, maxStock));
                  }}
                  className="p-2 border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedBrand ? quantity >= (product.brands.find((b: any) => b.name === selectedBrand)?.stock || 1) : true}
                >
                  <Plus className="w-4 h-4 dark:text-white" />
                </motion.button>
              </div>
              {selectedBrand && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                  <p>Available: {product.brands.find((b: any) => b.name === selectedBrand)?.stock || 0} units</p>
                  {isItemInCart(product._id, selectedBrand) && (
                    <p className="text-blue-600 dark:text-blue-400">
                      In cart: {getItemQuantity(product._id, selectedBrand)} units
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={
                  !selectedBrand || 
                  operationLoading?.type === 'ADD' ||
                  (selectedBrand && isItemInCart(product._id, selectedBrand))
                }
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {operationLoading?.type === 'ADD' ? 'Adding...' : 
                 selectedBrand && isItemInCart(product._id, selectedBrand) ? 'Already in Cart' : 
                 'Add to Cart'}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Product Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {product.description}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold dark:text-white">
                    Customer Reviews
                  </h3>
                </div>
                <Link
                  to={`/review/${id}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Write a Review
                </Link>
              </div>

              {/* Reviews Summary */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(review => review.rating === star).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                            {star}★
                          </span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews Loading */}
              {reviewsLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Loading reviews...</p>
                </div>
              )}

              {/* Reviews List */}
              {!reviewsLoading && (
                <>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No reviews yet. Be the first to review this product!
                      </p>
                      <Link
                        to={`/review/${id}`}
                        className="inline-block mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Write the first review
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {displayedReviews.map((review) => (
                        <motion.div
                          key={review._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-b dark:border-gray-700 pb-6 last:border-b-0"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {review.userName}
                                  </h4>
                                  {review.verified && (
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(review.date)}
                                </span>
                              </div>
                              <div className="flex items-center mb-3">
                                {renderStars(review.rating)}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {review.review}
                              </p>
                              {review.images && review.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-3">
                                  {review.images.map((image: string, index: number) => (
                                    <img
                                      key={index}
                                      src={image}
                                      alt={`Review image ${index + 1}`}
                                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Show More/Less Button */}
                      {reviews.length > 3 && (
                        <div className="text-center pt-4">
                          <button
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                          >
                            {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
