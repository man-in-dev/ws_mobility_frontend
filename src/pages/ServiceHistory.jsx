import React, { useState, useEffect } from "react";
import { ServiceRequest, Vehicle, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Calendar,
  MapPin,
  IndianRupee, // Changed from DollarSign to IndianRupee
  Star,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function ServiceHistory() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, statusFilter, vehicleFilter]);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [userServices, userVehicles] = await Promise.all([
        ServiceRequest.filter({ customer_id: userData.id }, "-created_date"),
        Vehicle.filter({ owner_id: userData.id }),
      ]);

      setServices(userServices);
      setVehicles(userVehicles);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterServices = () => {
    let filtered = services;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.service_type
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((service) => service.status === statusFilter);
    }

    // Vehicle filter
    if (vehicleFilter !== "all") {
      filtered = filtered.filter(
        (service) => service.vehicle_id === vehicleFilter
      );
    }

    setFilteredServices(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "requested":
        return <Clock className="w-4 h-4" />;
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
      requested: "bg-yellow-100 text-yellow-800",
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

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle
      ? `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`
      : "Unknown Vehicle";
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

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading service history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Service History</h1>
          <p className="text-slate-600 mt-1">
            Track all your vehicle service requests
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} (
                      {vehicle.registration_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setVehicleFilter("all");
                }}
                className="bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service History */}
        {filteredServices.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Services Found
              </h3>
              <p className="text-slate-600 mb-6">
                {services.length === 0
                  ? "You haven't booked any services yet"
                  : "No services match your current filters"}
              </p>
              <Button
                onClick={() => (window.location.href = "/book-service")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Book Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {service.service_type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h3>
                      <p className="text-slate-600 mb-2">
                        {getVehicleInfo(service.vehicle_id)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        className={`${getStatusColor(service.status)} border-0`}
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
                    {service.actual_cost && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <IndianRupee className="w-4 h-4" />{" "}
                        {/* Changed DollarSign to IndianRupee */}
                        <span>₹{service.actual_cost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="text-sm text-slate-500">
                      {format(new Date(service.created_date), "MMM d, yyyy")}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-slate-700">
                      {service.description}
                    </p>
                  </div>

                  {service.status === "completed" && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Rating:</span>
                        <div className="flex items-center gap-1">
                          {service.rating ? (
                            renderStars(service.rating)
                          ) : (
                            <span className="text-slate-400">Not rated</span>
                          )}
                        </div>
                      </div>
                      {service.feedback && (
                        <div className="text-sm text-slate-600 max-w-md">
                          <span className="font-medium">Feedback:</span>{" "}
                          {service.feedback}
                        </div>
                      )}
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
