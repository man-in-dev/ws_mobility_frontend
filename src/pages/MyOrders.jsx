
import React, { useState, useEffect } from "react";
import { InventoryOrder } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Calendar, 
  IndianRupee, // Changed from DollarSign to IndianRupee
  Truck,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

export default function MyOrders() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userOrders = await InventoryOrder.filter({ service_provider_id: userData.id }, "-created_date");
      setOrders(userOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle2 className="w-4 h-4" />;
      case "packed":
        return <Package className="w-4 h-4" />;
      case "dispatched":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      packed: "bg-indigo-100 text-indigo-800",
      dispatched: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getStatusSteps = (status) => {
    const steps = [
      { key: "pending", label: "Order Placed", completed: true },
      { key: "approved", label: "Approved", completed: ["approved", "packed", "dispatched", "delivered"].includes(status) },
      { key: "packed", label: "Packed", completed: ["packed", "dispatched", "delivered"].includes(status) },
      { key: "dispatched", label: "Dispatched", completed: ["dispatched", "delivered"].includes(status) },
      { key: "delivered", label: "Delivered", completed: status === "delivered" }
    ];
    return steps;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.item_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          <p className="text-slate-600 mt-1">Track your spare parts orders</p>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Orders Found</h3>
              <p className="text-slate-600 mb-6">
                {orders.length === 0 
                  ? "You haven't placed any orders yet"
                  : "No orders match your current filters"
                }
              </p>
              <Button
                onClick={() => window.location.href = "/order-parts"}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Order Parts
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Order #{order.order_number}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(order.created_date), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" /> {/* Changed icon to IndianRupee */}
                          <span>₹{order.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 lg:mt-0">
                      <Badge className={`${getStatusColor(order.status)} border-0`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                      <Badge className={`${getPriorityColor(order.priority)} border-0`}>
                        {order.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  {order.status !== "cancelled" && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        {getStatusSteps(order.status).map((step, index) => (
                          <div key={step.key} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              step.completed 
                                ? 'bg-green-500 text-white' 
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {step.completed ? '✓' : index + 1}
                            </div>
                            {index < getStatusSteps(order.status).length - 1 && (
                              <div className={`w-12 h-1 mx-2 ${
                                step.completed ? 'bg-green-500' : 'bg-slate-200'
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        {getStatusSteps(order.status).map((step) => (
                          <div key={step.key} className="text-center">
                            <span>{step.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-slate-900">{item.item_name}</p>
                            <p className="text-sm text-slate-600">Qty: {item.quantity} × ₹{item.unit_price}/-</p>
                          </div>
                          <p className="font-medium text-slate-900">₹{item.total_price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  {order.delivery_address && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-slate-900 mb-2">Delivery Address</h4>
                      <p className="text-sm text-slate-700">
                        {order.delivery_address.address}, {order.delivery_address.city} - {order.delivery_address.pincode}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Contact: {order.delivery_address.contact_person} ({order.delivery_address.phone})
                      </p>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                    <div className="text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium ml-2">₹{order.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-600">Commission:</span>
                      <span className="font-medium ml-2 text-red-600">-₹{(order.commission_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-600">You Pay (COD):</span>
                      <span className="font-bold ml-2 text-green-600">₹{order.total_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Tracking Information */}
                  {order.tracking_number && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Tracking Number:</strong> {order.tracking_number}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
