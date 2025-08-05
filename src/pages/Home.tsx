import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import ProductCategories from "../components/ProductCategories";
import FeaturedProducts from "../components/FeaturedProducts";
import { searchProducts } from "@/Api/UserProduct";

const Home = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Search only on Enter
  const handleSearchKeyDown = async (e) => {
    if (e.key === "Enter" && query.trim()) {
      setSearching(true);
      try {
        const res = await searchProducts(query, 1, 6);
        setSearchResults(res.products || []);
        setShowDropdown(true);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }
  };

  // Hide dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".search-dropdown-parent")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                C.E.S GLOBAL MEDICS
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8 relative search-dropdown-parent">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search medical equipment, kits, reagents..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => query && setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black focus:outline-none"
                />
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && query && (
                <div className="absolute z-50 w-full bg-white shadow-lg rounded-b-md mt-1 max-h-80 overflow-y-auto border border-t-0 border-gray-200">
                  {searching ? (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No results found
                    </div>
                  ) : (
                    <>
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          to={`/product/${product._id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                          onClick={() => {
                            setQuery("");
                            setShowDropdown(false);
                          }}
                        >
                          <img
                            src={product.productImages?.[0] || "/placeholder.svg"}
                            alt={product.productName}
                            className="w-12 h-12 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {product.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.category}
                            </div>
                          </div>
                          {product.brands?.[0]?.price && (
                            <div className="text-blue-600 font-bold whitespace-nowrap">
                              ₦{product.brands[0].price.toLocaleString()}
                            </div>
                          )}
                        </Link>
                      ))}
                      <Link
                        to={`/products?q=${encodeURIComponent(query)}`}
                        className="block text-center text-blue-600 font-semibold py-2 hover:underline border-t border-gray-200"
                        onClick={() => setShowDropdown(false)}
                      >
                        View all results
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link
                to="/cart"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              Welcome to C.E.S GLOBAL MEDICS
            </h2>
            <p className="text-xl mb-8">
              Your trusted partner for medical equipment, laboratory supplies,
              and healthcare solutions
            </p>
            <Link
              to="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-blue-700">Why Choose Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg shadow text-center">
              <div className="text-4xl mb-2">🌍</div>
              <h4 className="font-semibold text-lg mb-2">Global Reach</h4>
              <p>Supplying quality medical products to professionals worldwide.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg shadow text-center">
              <div className="text-4xl mb-2">🔒</div>
              <h4 className="font-semibold text-lg mb-2">Trusted & Certified</h4>
              <p>All products are certified and sourced from reputable brands.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg shadow text-center">
              <div className="text-4xl mb-2">🚚</div>
              <h4 className="font-semibold text-lg mb-2">Fast Delivery</h4>
              <p>Swift and reliable shipping to your doorstep, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <ProductCategories />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-blue-700">Testimonials</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="italic mb-4">“C.E.S Global Medics has been our go-to for reliable medical supplies. Fast delivery and great customer service!”</p>
              <div className="font-semibold">Dr. A. Johnson</div>
              <div className="text-sm text-gray-500">Lagos, Nigeria</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="italic mb-4">“Excellent range of products and always top quality. Highly recommended.”</p>
              <div className="font-semibold">Lab Manager, MedLabs</div>
              <div className="text-sm text-gray-500">Accra, Ghana</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="italic mb-4">“Ordering was easy and the support team was very helpful. Will buy again!”</p>
              <div className="font-semibold">Nurse E. Okafor</div>
              <div className="text-sm text-gray-500">Abuja, Nigeria</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                C.E.S GLOBAL MEDICS
              </h3>
              <p className="text-gray-300">
                Quality medical supplies for healthcare professionals worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Medical Equipment</li>
                <li>Laboratory Kits</li>
                <li>Reagents</li>
                <li>Disposables</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Contact Us</li>
                <li>Help Center</li>
                <li>Shipping Info</li>
                <li>Returns</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
