import React, { useState, useEffect } from "react";
import { ServiceRequest, Vehicle, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wrench,
  Calendar,
  MapPin,
  IndianRupee,
  User as UserIcon,
  Phone,
  Mail,
  Edit,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { format } from "date-fns";

export default function MyServices() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    status: "",
    actual_cost: 0,
    notes: "",
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [allServices, allUsers, allVehicles] = await Promise.all([
        ServiceRequest.list("-created_date", 50),
        User.list(),
        Vehicle.list(),
      ]);

      let myServices = allServices.filter(
        (s) => s.service_provider_id === userData.id
      );

      if (myServices.length === 0) {
        myServices = allServices.slice(0, 3); // Show 3 sample services if none are assigned
      }

      setServices(myServices);
      setCustomers(
        allUsers.filter((user) => user.user_type === "vehicle_owner")
      );
      setVehicles(allVehicles);
    } catch (error) {
      console.error("Error loading services:", error);
    }
    setIsLoading(false);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      const updateData = {
        status: updateFormData.status,
        notes: updateFormData.notes,
      };

      if (updateFormData.actual_cost > 0) {
        updateData.actual_cost = updateFormData.actual_cost;
        updateData.commission_amount = updateFormData.actual_cost * 0.1; // 10% commission
      }

      if (updateFormData.status === "completed") {
        updateData.completed_date = new Date().toISOString();
      }

      await ServiceRequest.update(selectedService.id, updateData);

      setShowUpdateDialog(false);
      setSelectedService(null);
      setUpdateFormData({ status: "", actual_cost: 0, notes: "" });
      loadServices();
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "assigned":
        return <AlertCircle className="w-4 h-4" />;
      case "in_progress":
        return <Wrench className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      emergency: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getCustomerInfo = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return (
      customer || {
        full_name: "Sample Customer",
        email: "",
        phone: "9876543210",
      }
    );
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle
      ? `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`
      : "Sample Vehicle (MH-01-AB-1234)";
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const filteredServices = services.filter((service) => {
    const customer = getCustomerInfo(service.customer_id);
    const matchesSearch =
      service.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Services</h1>
          <p className="text-slate-600 mt-1">
            Manage your assigned service requests
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search services..."
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
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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

        {/* Services */}
        {filteredServices.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Services Found
              </h3>
              <p className="text-slate-600">
                {services.length === 0
                  ? "You don't have any assigned services yet"
                  : "No services match your current filters"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredServices.map((service) => {
              const customer = getCustomerInfo(service.customer_id);

              return (
                <Card
                  key={service.id}
                  className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {service.service_type
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h3>
                        <p className="text-slate-600 mb-2">
                          {getVehicleInfo(service.vehicle_id)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <UserIcon className="w-4 h-4" />
                          <span>{customer.full_name}</span>
                          {customer.phone && (
                            <>
                              <Phone className="w-4 h-4 ml-2" />
                              <span>{customer.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <Badge
                          className={`${getStatusColor(
                            service.status
                          )} border-0`}
                        >
                          {getStatusIcon(service.status)}
                          <span className="ml-1">
                            {service.status.replace(/_/g, " ")}
                          </span>
                        </Badge>
                        <Badge
                          className={`${getPriorityColor(
                            service.priority
                          )} border-0`}
                        >
                          {service.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {service.scheduled_date
                            ? format(
                                new Date(service.scheduled_date),
                                "MMM d, yyyy"
                              )
                            : "Not scheduled"}
                        </span>
                      </div>
                      {service.location?.address && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">
                            {service.location.address}
                          </span>
                        </div>
                      )}
                      {service.estimated_cost && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <IndianRupee className="w-4 h-4" />
                          <span>
                            Est: ₹{service.estimated_cost.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {service.actual_cost && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <IndianRupee className="w-4 h-4" />
                          <span>
                            Actual: ₹{service.actual_cost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-slate-700">
                        {service.description}
                      </p>
                    </div>

                    {service.status === "completed" && service.rating && (
                      <div className="bg-green-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-green-800">
                            Customer Rating:
                          </span>
                          <div className="flex items-center gap-1">
                            {renderStars(service.rating)}
                          </div>
                        </div>
                        {service.feedback && (
                          <p className="text-sm text-green-700">
                            "{service.feedback}"
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                      {service.status === "assigned" && (
                        <Button
                          onClick={() => {
                            setSelectedService(service);
                            setUpdateFormData({
                              status: "in_progress",
                              actual_cost: service.estimated_cost || 0,
                              notes: "",
                            });
                            setShowUpdateDialog(true);
                          }}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Start Service
                        </Button>
                      )}

                      {service.status === "in_progress" && (
                        <Button
                          onClick={() => {
                            setSelectedService(service);
                            setUpdateFormData({
                              status: "completed",
                              actual_cost: service.estimated_cost || 0,
                              notes: "",
                            });
                            setShowUpdateDialog(true);
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete Service
                        </Button>
                      )}

                      {(service.status === "assigned" ||
                        service.status === "in_progress") && (
                        <Button
                          onClick={() => {
                            setSelectedService(service);
                            setUpdateFormData({
                              status: service.status,
                              actual_cost:
                                service.actual_cost ||
                                service.estimated_cost ||
                                0,
                              notes: "",
                            });
                            setShowUpdateDialog(true);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Update
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Update Service Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <Select
                  value={updateFormData.status}
                  onValueChange={(value) =>
                    setUpdateFormData((prev) => ({ ...prev, status: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Actual Cost (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={updateFormData.actual_cost}
                  onChange={(e) =>
                    setUpdateFormData((prev) => ({
                      ...prev,
                      actual_cost: parseFloat(e.target.value),
                    }))
                  }
                  placeholder="Enter actual service cost"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <Textarea
                  value={updateFormData.notes}
                  onChange={(e) =>
                    setUpdateFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Any additional notes..."
                  className="h-20"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUpdateDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Update Service
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
