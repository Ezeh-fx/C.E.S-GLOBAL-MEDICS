import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash2,
  ImageIcon,
  Package,
  DollarSign,
  TrendingUp,
  Save,
  X,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (product: Product, imagesTouched: boolean) => void;
  onDelete: (productId: string) => void;
}

const ProductDetailModal: React.FC<Props> = ({
  product,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagesTouched, setImagesTouched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      const deep = JSON.parse(JSON.stringify(product));
      setEditedProduct({
        ...deep,
        description:
          product.description || "No description available for this product.",
      });
    }
    setIsEditing(false);
    setErrors({});
  }, [product]);

  if (!product || !editedProduct) return null;

  const totalStock = editedProduct.brands.reduce(
    (sum, b) => sum + (b.stock || 0),
    0
  );
  const status = totalStock > 0 ? "In Stock" : "Out of Stock";
  const statusColor =
    totalStock > 0
      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editedProduct.name?.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!editedProduct.category?.trim()) {
      newErrors.category = "Category is required";
    }

    if (editedProduct.brands.length === 0) {
      newErrors.brands = "At least one brand is required";
    }

    // Images validation
    if (editedProduct.images.length === 0) {
      newErrors.images = "At least one product image is required";
    } else {
      // Check if all images are valid files (for new uploads)
      const invalidImages = editedProduct.images.filter(
        (img) => !(img instanceof File)
      );
      if (
        invalidImages.length > 0 &&
        editedProduct.images.length === invalidImages.length
      ) {
        newErrors.images = "Please select valid image files";
      }
    }

    editedProduct.brands.forEach((brand, index) => {
      if (!brand.name?.trim()) {
        newErrors[`brand${index}Name`] = "Brand name is required";
      }
      if (!brand.price || Number(brand.price) <= 0) {
        newErrors[`brand${index}Price`] = "Valid price is required";
      }
      if (brand.stock < 0) {
        newErrors[`brand${index}Stock`] = "Stock cannot be negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof Omit<Product, "brands" | "images" | "id">,
    value: string
  ) => {
    setEditedProduct((prev) => prev && { ...prev, [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updateBrandField = (idx: number, field: keyof Brand, value: string) => {
    const updated = editedProduct.brands.map((b, i) =>
      i === idx
        ? { ...b, [field]: field === "stock" ? parseInt(value) || 0 : value }
        : b
    );
    setEditedProduct({ ...editedProduct, brands: updated });

    // Clear error for this field
    const errorKey = `brand${idx}${
      field.charAt(0).toUpperCase() + field.slice(1)
    }`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const addBrand = () => {
    setEditedProduct({
      ...editedProduct,
      brands: [...editedProduct.brands, { name: "", price: "", stock: 0 }],
    });
  };

  const removeBrand = (index: number) => {
    if (editedProduct.brands.length <= 1) {
      toast({
        title: "Error",
        description: "At least one brand is required",
        variant: "destructive",
      });
      return;
    }

    const updated = editedProduct.brands.filter((_, i) => i !== index);
    setEditedProduct({ ...editedProduct, brands: updated });
  };

  const handleSave = async () => {
    // if (!validateForm()) {
    //   toast({
    //     title: "Validation Error",
    //     description: "Please fix the errors before saving",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setLoading(true);
    try {
      await onUpdate(editedProduct, imagesTouched);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset to original product data
    if (product) {
      const deep = JSON.parse(JSON.stringify(product));
      setEditedProduct({
        ...deep,
        description:
          product.description || "No description available for this product.",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Details
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                </>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{product.name}"? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(product.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the product details below. All changes will be saved when you click Save."
              : "View and manage the product details."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  Product ID
                </span>
              </div>
              <p className="text-lg font-mono">#{product.id.slice(-8)}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Status
                </span>
              </div>
              <Badge className={statusColor}>{status}</Badge>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">
                  Total Stock
                </span>
              </div>
              <p className="text-lg font-bold">{totalStock}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">
                  Brands
                </span>
              </div>
              <p className="text-lg font-bold">{editedProduct.brands.length}</p>
            </div>
          </div>

          <Separator />

          {/* Images section */}
          <div>
            <Label className="font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Product Images
            </Label>
            {editedProduct.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {editedProduct.images.map((img, i) => {
                  const src =
                    typeof img === "string"
                      ? img
                      : img instanceof File
                      ? URL.createObjectURL(img)
                      : img;
                  return (
                    <motion.div
                      key={i}
                      className="relative group"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={src}
                        alt={`Product image ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          console.error("Image failed to load:", img);
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {isEditing && (
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          onClick={() => {
                            setImagesTouched(true);
                            const copy = [...editedProduct.images];
                            copy.splice(i, 1);

                            if (copy.length === 0) {
                              toast({
                                title: "Warning",
                                description:
                                  "You must add at least one new image before saving",
                                variant: "destructive",
                              });
                            }

                            setEditedProduct({
                              ...editedProduct,
                              images: copy,
                            });

                            // Clear image error if it exists
                            if (errors.images) {
                              setErrors((prev) => ({ ...prev, images: "" }));
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No images available</p>
              </div>
            )}
            {isEditing && (
              <div className="mt-4">
                <Label>Replace Images</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    setImagesTouched(true);
                    const files = Array.from(e.target.files || []);

                    if (files.length > 3) {
                      toast({
                        title: "Too many images",
                        description: `You can only have up to 3 images. ${
                          files.length - 3
                        } image(s) were not added.`,
                        variant: "destructive",
                      });
                      // Only take the first 3 files
                      const limitedFiles = files.slice(0, 3);
                      setEditedProduct({
                        ...editedProduct,
                        images: limitedFiles,
                      });
                    } else {
                      setEditedProduct({
                        ...editedProduct,
                        images: files,
                      });
                    }
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {editedProduct.images.length}/3 images selected.
                  <span className="text-orange-600">
                    Note: This will replace all existing images.
                  </span>
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Core fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={errors.name ? "text-red-600" : ""}>
                Product Name *
              </Label>
              <Input
                disabled={!isEditing}
                value={editedProduct.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
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
                disabled={!isEditing}
                value={editedProduct.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger
                  className={errors.category ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medical Equipment">
                    Medical Equipment
                  </SelectItem>
                  <SelectItem value="Laboratory Kits">
                    Laboratory Kits
                  </SelectItem>
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
            <Label>Description</Label>
            <Textarea
              disabled={!isEditing}
              value={editedProduct.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description..."
              rows={3}
            />
          </div>

          {/* Brands */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Brands</Label>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBrand}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Brand
                </Button>
              )}
            </div>

            {errors.brands && (
              <p className="text-red-500 text-sm">{errors.brands}</p>
            )}

            {editedProduct.brands.map((brand, i) => (
              <motion.div
                key={i}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <Label
                    className={errors[`brand${i}Name`] ? "text-red-600" : ""}
                  >
                    Brand Name *
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={brand.name}
                    placeholder="Brand name"
                    onChange={(e) =>
                      updateBrandField(i, "name", e.target.value)
                    }
                    className={errors[`brand${i}Name`] ? "border-red-500" : ""}
                  />
                  {errors[`brand${i}Name`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`brand${i}Name`]}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    className={errors[`brand${i}Price`] ? "text-red-600" : ""}
                  >
                    Price (₦) *
                  </Label>
                  <Input
                    disabled={!isEditing}
                    type="number"
                    value={brand.price}
                    placeholder="0.00"
                    onChange={(e) =>
                      updateBrandField(i, "price", e.target.value)
                    }
                    className={errors[`brand${i}Price`] ? "border-red-500" : ""}
                  />
                  {errors[`brand${i}Price`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`brand${i}Price`]}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    className={errors[`brand${i}Stock`] ? "text-red-600" : ""}
                  >
                    Stock *
                  </Label>
                  <Input
                    disabled={!isEditing}
                    type="number"
                    value={brand.stock}
                    placeholder="0"
                    onChange={(e) =>
                      updateBrandField(i, "stock", e.target.value)
                    }
                    className={errors[`brand${i}Stock`] ? "border-red-500" : ""}
                  />
                  {errors[`brand${i}Stock`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`brand${i}Stock`]}
                    </p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeBrand(i)}
                      disabled={editedProduct.brands.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <Separator />

          {/* Product Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Created</Label>
              <Input disabled value={formatDate(product.createdAt)} />
            </div>
            <div>
              <Label>Last Updated</Label>
              <Input disabled value={formatDate(product.updatedAt)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
