import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, User, ShieldCheck, Loader2, RefreshCw } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { motion } from "framer-motion";
import { getProductReviews } from "@/Api/UserProduct";
import { useToast } from "@/hooks/use-toast";

interface Review {
  _id: string;
  productId: string;
  userName: string;
  rating: number;
  review: string;
  images: string[];
  date: string;
  verified: boolean;
}

const ReviewDetails = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const result = await getProductReviews(id);
      if (result.success) {
        setReviews(result.reviews);
      } else {
        toast({
          title: "Error fetching reviews",
          description: result.error || "Failed to fetch reviews. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error fetching reviews",
        description: "An error occurred while fetching reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id, toast]);

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default: // newest
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

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

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
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
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link
            to={`/product/${id}`}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Product
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                All Reviews
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {renderStars(Math.round(averageRating))}
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {averageRating.toFixed(1)} out of 5 ({reviews.length}{" "}
                    reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={fetchReviews}
                disabled={loading}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
              <Link
                to={`/review/${id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Write Review
              </Link>
              <motion.select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </motion.select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
          ) : sortedReviews.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No reviews yet for this product.
            </p>
          ) : (
            <div className="space-y-6">
              {sortedReviews.map((reviewItem) => (
                <div
                  key={reviewItem._id}
                  className="border-b dark:border-gray-700 pb-6 last:border-b-0"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {reviewItem.userName}
                          </h4>
                          {reviewItem.verified && (
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(reviewItem.date)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 mb-3">
                        {renderStars(reviewItem.rating)}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {reviewItem.review}
                      </p>
                      {reviewItem.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                          {reviewItem.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetails;
