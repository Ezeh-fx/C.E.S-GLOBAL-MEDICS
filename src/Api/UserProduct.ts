import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "/api" // use Vite proxy in dev
  : "https://med-kit-lab-ces-be.onrender.com/api"; // use full URL in prod

// Get all user products
export const getAllUserProduct = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/products`);
    
    // Validate response structure
    if (!response.data) {
      throw new Error("Invalid response from server");
    }
    
    // Ensure products array exists
    const products = response.data.products || response.data || [];
    
    // Transform products to include required fields
    const transformedProducts = products.map((product: any) => ({
      _id: product._id,
      productName: product.productName,
      category: product.category,
      brands: product.brands || [],
      productImages: product.productImages || [],
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      isFeatured: product.isFeatured || false,
    }));
    
    return {
      products: transformedProducts,
      total: transformedProducts.length,
      success: true,
    };
  } catch (error: any) {
    console.error("Error fetching user products:", error);
    
    // Return fallback data structure
    return {
      products: [],
      total: 0,
      success: false,
      error: error?.response?.data?.message || error?.message || "Failed to fetch products",
    };
  }
};

// Get product by ID
export const getProductById = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/products/${id}`);
    
    // Validate response structure
    if (!response.data) {
      throw new Error("Invalid response from server");
    }
    
    const product = response.data.product || response.data;
    
    // Transform product to include required fields
    const transformedProduct = {
      _id: product._id,
      productName: product.productName,
      category: product.category,
      brands: product.brands || [],
      productImages: product.productImages || [],
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      description: product.description || "",
      isFeatured: product.isFeatured || false,
    };
    
    return {
      product: transformedProduct,
      success: true,
    };
  } catch (error: any) {
    console.error(`Error fetching product with ID ${id}:`, error);
    
    // Return fallback data structure
    return {
      product: null,
      success: false,
      error: error?.response?.data?.message || error?.message || "Failed to fetch product",
    };
  }
};

// Get products by category
export const getProductsByCategory = async (
  category: string,
  page = 1,
  limit = 10
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/products/category/${category}`,
      { params: { page, limit } }
    );
    
    // Validate response structure
    if (!response.data) {
      throw new Error("Invalid response from server");
    }
    
    // Ensure products array exists
    const products = response.data.products || response.data || [];
    
    // Transform products to include required fields
    const transformedProducts = products.map((product: any) => ({
      _id: product._id,
      productName: product.productName,
      category: product.category,
      brands: product.brands || [],
      productImages: product.productImages || [],
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      isFeatured: product.isFeatured || false,
    }));
    
    return {
      products: transformedProducts,
      total: transformedProducts.length,
      success: true,
      page,
      limit,
    };
  } catch (error: any) {
    console.error(`Error fetching products for category ${category}:`, error);
    
    // Return fallback data structure
    return {
      products: [],
      total: 0,
      success: false,
      error: error?.response?.data?.message || error?.message || "Failed to fetch category products",
    };
  }
};

// Get featured products
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/products/featured`, {
      params: { limit },
    });

    // Validate response structure
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    // Ensure products array exists
    const products = response.data.products || response.data || [];

    // Transform products to include required fields
    const transformedProducts = products.map((product: any) => ({
      _id: product._id,
      productName: product.productName,
      category: product.category,
      brand: product.brands?.[0]?.name || product.brand || "Unknown Brand",
      price: product.brands?.[0]?.price || product.price || 0,
      originalPrice:
        product.brands?.[0]?.originalPrice ||
        product.originalPrice ||
        product.price ||
        0,
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      productImages: product.productImages || [],
      stock: product.brands?.[0]?.stock || product.stock || 0,
      isFeatured: product.isFeatured || false,
    }));

    return {
      products: transformedProducts,
      total: transformedProducts.length,
      success: true,
    };
  } catch (error: any) {
    console.error("Error fetching featured products:", error);

    // Return fallback data structure
    return {
      products: [],
      total: 0,
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch featured products",
    };
  }
};

// Search products
export const searchProducts = async (query: string, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/products/search`, {
      params: { q: query, page, limit },
    });
    
    // Validate response structure
    if (!response.data) {
      throw new Error("Invalid response from server");
    }
    
    // Ensure products array exists
    const products = response.data.products || response.data || [];
    
    // Transform products to include required fields
    const transformedProducts = products.map((product: any) => ({
      _id: product._id,
      productName: product.productName,
      category: product.category,
      brands: product.brands || [],
      productImages: product.productImages || [],
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      isFeatured: product.isFeatured || false,
    }));
    
    return {
      products: transformedProducts,
      total: transformedProducts.length,
      success: true,
      query,
      page,
      limit,
    };
  } catch (error: any) {
    console.error(`Error searching products with query "${query}":`, error);
    
    // Return fallback data structure
    return {
      products: [],
      total: 0,
      success: false,
      error: error?.response?.data?.message || error?.message || "Failed to search products",
    };
  }
};

// Get product reviews
export const getProductReviews = async (productId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/products/review/${productId}`);
    
    // Validate response structure
    if (!response.data) {
      throw new Error("Invalid response from server");
    }
    
    // Ensure reviews array exists
    const reviews = response.data.reviews || response.data || [];
    
    // Transform reviews to include required fields
    const transformedReviews = reviews.map((review: any) => ({
      _id: review._id,
      productId: review.productId,
      userName: review.userName || review.user?.name || "Anonymous User",
      rating: review.rating || 0,
      review: review.review || review.comment || "",
      images: review.images || [],
      date: review.createdAt || review.date || new Date().toISOString(),
      verified: review.verified || false,
    }));
    
    return {
      reviews: transformedReviews,
      total: transformedReviews.length,
      success: true,
    };
  } catch (error: any) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    
    // Return fallback data structure
    return {
      reviews: [],
      total: 0,
      success: false,
      error: error?.response?.data?.message || error?.message || "Failed to fetch product reviews",
    };
  }
};

// Leave a review for a product
export const leaveReview = async (
  customerId: string,
  productId: string,
  reviewData: {
    rating: number;
    comment: string;
    images?: string[];
  }
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/products/review/${customerId}/${productId}`,
      reviewData
    );
    
    // Validate response structure
    if (!response.data) {
      throw new Error("Invalid response from server");
    }
    
    return {
      success: true,
      message: "Review submitted successfully",
      review: response.data.review || response.data,
    };
  } catch (error: any) {
    console.error(`Error leaving review for product ${productId}:`, error);
    
    // Return fallback data structure
    return {
      success: false,
      error: error?.response?.data?.message || error?.message || "Failed to submit review",
    };
  }
};
