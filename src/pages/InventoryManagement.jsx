import React, { useState, useEffect } from "react";
import { Inventory } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    item_name: "",
    item_code: "",
    category: "",
    subcategory: "",
    compatible_vehicles: [],
    brand: "",
    description: "",
    unit_price: 0,
    mrp: 0,
    stock_quantity: 0,
    minimum_stock: 0,
    unit_of_measure: "piece",
    warranty_period: 0,
    is_active: true
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const items = await Inventory.list("-created_date");
      setInventory(items);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingItem) {
        await Inventory.update(editingItem.id, formData);
      } else {
        await Inventory.create(formData);
      }

      setShowAddDialog(false);
      setEditingItem(null);
      resetForm();
      loadInventory();
    } catch (error) {
      console.error("Error saving item:", error);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      item_name: "",
      item_code: "",
      category: "",
      subcategory: "",
      compatible_vehicles: [],
      brand: "",
      description: "",
      unit_price: 0,
      mrp: 0,
      stock_quantity: 0,
      minimum_stock: 0,
      unit_of_measure: "piece",
      warranty_period: 0,
      is_active: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddDialog(true);
  };

  const handleDelete = async (itemId) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await Inventory.delete(itemId);
        loadInventory();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const toggleActiveStatus = async (itemId, currentStatus) => {
    try {
      await Inventory.update(itemId, { is_active: !currentStatus });
      loadInventory();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const categories = [
    "engine_parts", "brake_parts", "electrical", "body_parts", "filters", 
    "oils_lubricants", "batteries", "tires", "tools", "accessories"
  ];

  const vehicleTypes = ["2W", "3W", "4W"];
  const unitMeasures = ["piece", "liter", "kg", "meter", "set"];

  const getStockStatus = (item) => {
    if (item.stock_quantity === 0) return "out_of_stock";
    if (item.stock_quantity <= item.minimum_stock) return "low_stock";
    return "in_stock";
  };

  const getStockStatusColor = (status) => {
    const colors = {
      out_of_stock: "bg-red-100 text-red-800",
      low_stock: "bg-yellow-100 text-yellow-800",
      in_stock: "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStockStatusIcon = (status) => {
    switch (status) {
      case "out_of_stock":
        return <XCircle className="w-4 h-4" />;
      case "low_stock":
        return <AlertTriangle className="w-4 h-4" />;
      case "in_stock":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const stockStatus = getStockStatus(item);
    const matchesStock = stockFilter === "all" || stockStatus === stockFilter;
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-slate-600 mt-1">Manage spare parts and tools inventory</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm();
                  setEditingItem(null);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Item" : "Add New Item"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item_name">Item Name</Label>
                    <Input
                      id="item_name"
                      value={formData.item_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, item_name: e.target.value }))}
                      placeholder="Item name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="item_code">Item Code</Label>
                    <Input
                      id="item_code"
                      value={formData.item_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, item_code: e.target.value.toUpperCase() }))}
                      placeholder="Unique item code"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                      placeholder="Subcategory"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Brand name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Item description"
                    className="h-20"
                  />
                </div>

                <div>
                  <Label>Compatible Vehicles</Label>
                  <div className="flex gap-4 mt-2">
                    {vehicleTypes.map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.compatible_vehicles.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                compatible_vehicles: [...prev.compatible_vehicles, type]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                compatible_vehicles: prev.compatible_vehicles.filter(v => v !== type)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit_price">Unit Price (₹)</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mrp">MRP (₹)</Label>
                    <Input
                      id="mrp"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.mrp}
                      onChange={(e) => setFormData(prev => ({ ...prev, mrp: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum_stock">Minimum Stock</Label>
                    <Input
                      id="minimum_stock"
                      type="number"
                      min="0"
                      value={formData.minimum_stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                    <Select
                      value={formData.unit_of_measure}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, unit_of_measure: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unitMeasures.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="warranty_period">Warranty Period (months)</Label>
                  <Input
                    id="warranty_period"
                    type="number"
                    min="0"
                    value={formData.warranty_period}
                    onChange={(e) => setFormData(prev => ({ ...prev, warranty_period: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isSubmitting ? "Saving..." : (editingItem ? "Update" : "Add Item")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setStockFilter("all");
                }}
                className="bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Grid */}
        {filteredInventory.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Items Found</h3>
              <p className="text-slate-600 mb-6">
                {inventory.length === 0 
                  ? "Start by adding your first inventory item"
                  : "No items match your current filters"
                }
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item);
              return (
                <Card key={item.id} className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-slate-900 mb-2">
                          {item.item_name}
                        </CardTitle>
                        <p className="text-sm text-slate-600 mb-2">{item.item_code}</p>
                        <div className="flex gap-2 mb-2">
                          <Badge className="bg-slate-100 text-slate-700 border-0 text-xs">
                            {item.category.replace(/_/g, ' ')}
                          </Badge>
                          <Badge className={`${getStockStatusColor(stockStatus)} border-0 text-xs`}>
                            {getStockStatusIcon(stockStatus)}
                            <span className="ml-1">{stockStatus.replace(/_/g, ' ')}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Brand:</span>
                        <span className="font-medium">{item.brand}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Price:</span>
                        <div className="text-right">
                          <span className="font-bold text-lg">₹{item.unit_price}</span>
                          {item.mrp > item.unit_price && (
                            <span className="text-xs text-slate-500 line-through ml-2">₹{item.mrp}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Stock:</span>
                        <span className={`font-medium ${stockStatus === 'out_of_stock' ? 'text-red-600' : stockStatus === 'low_stock' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {item.stock_quantity} {item.unit_of_measure}
                        </span>
                      </div>
                      {item.compatible_vehicles?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.compatible_vehicles.map((vehicle) => (
                            <Badge key={vehicle} variant="outline" className="text-xs">
                              {vehicle}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <Button
                        onClick={() => toggleActiveStatus(item.id, item.is_active)}
                        variant={item.is_active ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                      >
                        {item.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}