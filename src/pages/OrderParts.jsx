import React, { useState, useEffect } from "react";
import { Inventory, InventoryOrder, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Minus,
  ShoppingCart,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function OrderParts() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: "",
    city: "",
    pincode: "",
    contact_person: "",
    phone: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, items] = await Promise.all([
        User.me(),
        Inventory.list(),
      ]);

      setUser(userData);
      setInventory(
        items.filter((item) => item.stock_quantity > 0 && item.is_active)
      );

      // Pre-fill delivery address from user data
      setDeliveryAddress({
        address: userData.address || "",
        city: userData.city || "",
        pincode: userData.pincode || "",
        contact_person: userData.full_name || "",
        phone: userData.phone || "",
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: Math.min(cartItem.quantity + 1, item.stock_quantity),
              }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = inventory.find((item) => item.id === itemId);
    const maxQuantity = item ? item.stock_quantity : 1;

    setCart(
      cart.map((cartItem) =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: Math.min(newQuantity, maxQuantity) }
          : cartItem
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderNumber = `ORD-${Date.now()}`;
      const totalAmount = getCartTotal();
      const commissionAmount = totalAmount * 0.1; // 10% commission

      const orderData = {
        order_number: orderNumber,
        service_provider_id: user.id,
        items: cart.map((item) => ({
          inventory_id: item.id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
        })),
        total_amount: totalAmount,
        commission_amount: commissionAmount,
        net_amount: totalAmount - commissionAmount,
        delivery_address: deliveryAddress,
        status: "pending",
        priority: "medium",
      };

      await InventoryOrder.create(orderData);

      setShowCheckout(false);
      setShowSuccess(true);
      setCart([]);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating order:", error);
    }
    setIsSubmitting(false);
  };

  const categories = [
    "engine_parts",
    "brake_parts",
    "electrical",
    "body_parts",
    "filters",
    "oils_lubricants",
    "batteries",
    "tires",
    "tools",
    "accessories",
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading parts catalog...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Order Placed!
            </h2>
            <p className="text-slate-600 mb-4">
              Your parts order has been submitted successfully. You'll receive
              updates on the order status.
            </p>
            <div className="animate-pulse text-sm text-slate-500">
              Redirecting...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Order Parts</h1>
            <p className="text-slate-600 mt-1">
              Browse and order spare parts for your services
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
              className="bg-white relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({getCartItemCount()})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-0 text-xs">
                  {getCartItemCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search parts..."
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
                      {category
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
                className="bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Parts Catalog */}
        {filteredInventory.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Parts Available
              </h3>
              <p className="text-slate-600">
                No parts match your current search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventory.map((item) => {
              const cartItem = cart.find((cartItem) => cartItem.id === item.id);
              const quantityInCart = cartItem ? cartItem.quantity : 0;

              return (
                <Card
                  key={item.id}
                  className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                        {item.item_name}
                      </CardTitle>
                      <Badge className="bg-slate-100 text-slate-700 border-0 text-xs">
                        {item.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{item.item_code}</p>
                    <p className="text-sm text-slate-500">{item.brand}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-slate-900">
                          ₹{item.unit_price}
                        </span>
                        {item.mrp > item.unit_price && (
                          <span className="text-sm text-slate-500 line-through">
                            ₹{item.mrp}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Stock:</span>
                        <span className="font-medium">
                          {item.stock_quantity} {item.unit_of_measure}
                        </span>
                      </div>

                      {item.compatible_vehicles?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.compatible_vehicles.map((vehicle) => (
                            <Badge
                              key={vehicle}
                              variant="outline"
                              className="text-xs"
                            >
                              {vehicle}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {quantityInCart > 0 ? (
                        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, quantityInCart - 1)
                            }
                            className="h-8 w-8"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-medium px-3">
                            {quantityInCart}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, quantityInCart + 1)
                            }
                            disabled={quantityInCart >= item.stock_quantity}
                            className="h-8 w-8"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          disabled={item.stock_quantity === 0}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Checkout Dialog */}
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Your Order</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Cart Items */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">
                  Order Items
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {item.item_name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.item_code}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="h-8 w-8"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-medium px-2">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="h-8 w-8"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-right min-w-20">
                          <p className="font-medium">
                            ₹
                            {(item.unit_price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">
                  Delivery Address
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={deliveryAddress.address}
                      onChange={(e) =>
                        setDeliveryAddress((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Complete delivery address"
                      className="h-20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={deliveryAddress.city}
                      onChange={(e) =>
                        setDeliveryAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={deliveryAddress.pincode}
                      onChange={(e) =>
                        setDeliveryAddress((prev) => ({
                          ...prev,
                          pincode: e.target.value,
                        }))
                      }
                      placeholder="Pincode"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={deliveryAddress.contact_person}
                      onChange={(e) =>
                        setDeliveryAddress((prev) => ({
                          ...prev,
                          contact_person: e.target.value,
                        }))
                      }
                      placeholder="Contact person name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={deliveryAddress.phone}
                      onChange={(e) =>
                        setDeliveryAddress((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (10%):</span>
                    <span>₹{(getCartTotal() * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>You'll Pay:</span>
                    <span>₹{getCartTotal().toLocaleString()} (COD)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={isSubmitting || cart.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
