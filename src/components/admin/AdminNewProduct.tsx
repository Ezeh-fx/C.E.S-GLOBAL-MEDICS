import React, { useState } from "react";
import {
  Upload,
  X,
  Save,
  Package,
  DollarSign,
  TrendingUp,
  ImageIcon,
  Plus,
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { addProduct } from "@/Api/AdminProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface Brand {
  name: string;
  price: string;
  stock: string;
}

interface FormData {
  name: string;
  category: string;
  description: string;
  brands: Brand[];
}

const AdminNewProduct = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    description: "",
    brands: [{ name: "", price: "", stock: "" }],
  });
  const [images, setImages] = useState<File[]>([]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Product name validation
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    // Category validation
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Images validation
    if (images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    // Brands validation
    if (formData.brands.length === 0) {
      newErrors.brands = "At least one brand is required";
    }

    formData.brands.forEach((brand, index) => {
      if (!brand.name.trim()) {
        newErrors[`brand${index}Name`] = "Brand name is required";
      }
      if (!brand.price || Number(brand.price) <= 0) {
        newErrors[`brand${index}Price`] = "Valid price is required";
      }
      if (!brand.stock || Number(brand.stock) < 0) {
        newErrors[`brand${index}Stock`] = "Valid stock quantity is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof Omit<FormData, "brands">,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleBrandChange = (index: number, field: keyof Brand, value: string) => {
    const newBrands = [...formData.brands];
    newBrands[index] = { ...newBrands[index], [field]: value };
    setFormData({ ...formData, brands: newBrands });

    // Clear error for this field
    const errorKey = `brand${index}${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  };

  const addBrand = () => {
    setFormData({
      ...formData,
      brands: [...formData.brands, { name: "", price: "", stock: "" }],
    });
  };

  const removeBrand = (index: number) => {
    if (formData.brands.length <= 1) {
      toast({
        title: "Error",
        description: "At least one brand is required",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      brands: formData.brands.filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      const totalImages = images.length + newImages.length;

      if (totalImages > 3) {
        toast({
          title: "Too many images",
          description: "You can only upload up to 3 images per product.",
          variant: "destructive",
        });
        return;
      }

      // Validate file types and sizes
      const validImages = newImages.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          return false;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB.`,
            variant: "destructive",
          });
          return false;
        }

        return true;
      });

      setImages(prev => [...prev, ...validImages]);

      if (errors.images) {
        setErrors(prev => ({ ...prev, images: "" }));
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveProduct = async (status: "draft" | "published") => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();

      // Append all images
      images.forEach((img) => {
        form.append("productImages", img);
      });

      form.append("productName", formData.name);
      form.append("category", formData.category);
      form.append("description", formData.description);
      form.append(
        "brands",
        JSON.stringify(
          formData.brands
            .filter((b) => b.name.trim()) // remove empty brands
            .map((b) => ({
              name: b.name,
              price: parseFloat(b.price),
              stock: parseInt(b.stock),
            }))
        )
      );

      const res = await addProduct(form);

      toast({
        title: "Success",
        description: `Product ${status === "published" ? "published" : "saved as draft"} successfully!`,
      });

      // Reset form
      setFormData({
        name: "",
        category: "",
        description: "",
        brands: [{ name: "", price: "", stock: "" }],
      });
      setImages([]);
      setErrors({});

      // Navigate back to products list
      navigate("/admin/products");
    } catch (err: any) {
      toast({
        title: "Error adding product",
        description: err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProduct("published");
  };

  const handleSaveDraft = () => {
    saveProduct("draft");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Add New Product
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new product with multiple brands and pricing options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={errors.name ? "text-red-600" : ""}>
                      Product Name *
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter product name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className={errors.category ? "text-red-600" : ""}>
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medical Equipment">Medical Equipment</SelectItem>
                        <SelectItem value="Laboratory Kits">Laboratory Kits</SelectItem>
                        <SelectItem value="Reagents">Reagents</SelectItem>
                        <SelectItem value="Disposables">Disposables</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className={errors.description ? "text-red-600" : ""}>
                    Description *
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter product description..."
                    rows={4}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <Separator />

                {/* Brands Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="font-semibold">Brands & Pricing</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBrand}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Brand
                    </Button>
                  </div>

                  {errors.brands && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.brands}</AlertDescription>
                    </Alert>
                  )}

                  {formData.brands.map((brand, index) => (
                    <motion.div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <Label className={errors[`brand${index}Name`] ? "text-red-600" : ""}>
                          Brand Name *
                        </Label>
                        <Input
                          value={brand.name}
                          placeholder="Brand name"
                          onChange={(e) => handleBrandChange(index, "name", e.target.value)}
                          className={errors[`brand${index}Name`] ? "border-red-500" : ""}
                        />
                        {errors[`brand${index}Name`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`brand${index}Name`]}</p>
                        )}
                      </div>
                      <div>
                        <Label className={errors[`brand${index}Price`] ? "text-red-600" : ""}>
                          Price (₦) *
                        </Label>
                        <Input
                          type="number"
                          value={brand.price}
                          placeholder="0.00"
                          onChange={(e) => handleBrandChange(index, "price", e.target.value)}
                          className={errors[`brand${index}Price`] ? "border-red-500" : ""}
                        />
                        {errors[`brand${index}Price`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`brand${index}Price`]}</p>
                        )}
                      </div>
                      <div>
                        <Label className={errors[`brand${index}Stock`] ? "text-red-600" : ""}>
                          Stock *
                        </Label>
                        <Input
                          type="number"
                          value={brand.stock}
                          placeholder="0"
                          onChange={(e) => handleBrandChange(index, "stock", e.target.value)}
                          className={errors[`brand${index}Stock`] ? "border-red-500" : ""}
                        />
                        {errors[`brand${index}Stock`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`brand${index}Stock`]}</p>
                        )}
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBrand(index)}
                          disabled={formData.brands.length <= 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Separator />

                {/* Images Section */}
                <div>
                  <Label className={`font-semibold flex items-center gap-2 ${errors.images ? "text-red-600" : ""}`}>
                    <ImageIcon className="w-4 h-4" />
                    Product Images (Up to 3) *
                  </Label>

                  {errors.images && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.images}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4">
                    <Label className="cursor-pointer">
                      <div className="flex items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Click to upload images ({images.length}/3)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG up to 5MB each
                          </p>
                        </div>
                      </div>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={images.length >= 3}
                      />
                    </Label>
                  </div>

                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <motion.div
                          key={index}
                          className="relative"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Product"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Product Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Product Name:</span>
                <span className="text-sm font-medium">
                  {formData.name || "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm font-medium">
                  {formData.category || "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Brands:</span>
                <span className="text-sm font-medium">
                  {formData.brands.filter(b => b.name.trim()).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Images:</span>
                <span className="text-sm font-medium">
                  {images.length}/3
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.brands.filter(b => b.name.trim()).map((brand, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-sm">{brand.name}</div>
                  <div className="text-sm text-gray-600">
                    ₦{Number(brand.price || 0).toLocaleString()} | Stock: {brand.stock || 0}
                  </div>
                </div>
              ))}
              {formData.brands.filter(b => b.name.trim()).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No brands added yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminNewProduct;
