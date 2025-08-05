import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope, TestTube, Package, Syringe } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Medical Equipment",
    description: "Professional medical devices and instruments",
    icon: Stethoscope,
    image:
      "https://i.pinimg.com/736x/30/bd/23/30bd238f2e242aa6a84692a42c195479.jpg",
    link: "/products?category=equipment",
  },
  {
    id: 2,
    name: "Laboratory Kits",
    description: "Complete testing and diagnostic kits",
    icon: TestTube,
    image:
      "https://i.pinimg.com/736x/18/23/87/182387bf07175e7e2fb3b0d391b2641f.jpg",
    link: "/products?category=kits",
  },
  {
    id: 3,
    name: "Reagents",
    description: "High-quality chemical reagents and solutions",
    icon: Package,
    image:
      "https://i.pinimg.com/736x/f5/81/e0/f581e0b326de010cc722713ac824fa43.jpg",
    link: "/products?category=reagents",
  },
  {
    id: 4,
    name: "Laboratory Disposables",
    description: "Single-use laboratory supplies and consumables",
    icon: Syringe,
    image:
      "https://i.pinimg.com/736x/c7/46/4f/c7464f2b6ecf1cef8407e8d38fe904ef.jpg",
    link: "/products?category=disposables",
  },
];

const ProductCategories = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Product Categories
          </h2>
          <p className="text-lg text-gray-600">
            Explore our comprehensive range of medical supplies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                to={category.link}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                  <div className="absolute top-4 left-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
