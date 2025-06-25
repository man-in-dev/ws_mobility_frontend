
import React, { useState, useEffect } from "react";
import { ServiceRequest } from "@/api/entities";
import { Vehicle } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Wrench, 
  Calendar, 
  MapPin, 
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
  IndianRupee // Changed from DollarSign to IndianRupee
} from "lucide-react";
import { format } from "date-fns";

export default function ServiceRequests() {
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    service_provider_id: "",
    estimated_cost: 0,
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allServices, allUsers, allVehicles] = await Promise.all([
        ServiceRequest.list("-created_date"),
        User.list(),
        Vehicle.list()
      ]);
      
      setServices(allServices);
      setUsers(allUsers);
      setVehicles(allVehicles);
      setServiceProviders(allUsers.filter(user => user.user_type === "service_provider"));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleStatusUpdate = async (serviceId, newStatus) => {
    try {
      await ServiceRequest.update(serviceId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAssignProvider = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      await ServiceRequest.update(selectedService.id, {
        service_provider_id: assignFormData.service_provider_id,
        estimated_cost: assignFormData.estimated_cost,
        status: "assigned",
        notes: assignFormData.notes
      });
      
      setShowAssignDialog(false);
      setSelectedService(null);
      setAssignFormData({ service_provider_id: "", estimated_cost: 0, notes: "" });
      loadData();
    } catch (error) {
      console.error("Error assigning provider:", error);
    }
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
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      emergency: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getUserInfo = (userId) => {
    const user = users.find(u => u.id === userId);
    return user || { full_name: "Unknown User", email: "", phone: "" };
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})` : "Unknown Vehicle";
  };

  const getProviderInfo = (providerId) => {
    const provider = serviceProviders.find(p => p.id === providerId);
    return provider || { full_name: "Unassigned", business_name: "" };
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
          <p className="text-slate-600 mt-1">Manage all customer service requests</p>
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
                  <SelectItem value="requested">Requested</SelectItem>
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

        {/* Service Requests */}
        {filteredServices.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Service Requests</h3>
              <p className="text-slate-600">No service requests match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredServices.map((service) => {
              const customer = getUserInfo(service.customer_id);
              const provider = getProviderInfo(service.service_provider_id);
              
              return (
                <Card key={service.id} className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {service.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-slate-600 mb-2">{getVehicleInfo(service.vehicle_id)}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <UserIcon className="w-4 h-4" />
                          <span>{customer.full_name}</span>
                          {customer.email && (
                            <>
                              <Mail className="w-4 h-4 ml-2" />
                              <span>{customer.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <Badge className={`${getStatusColor(service.status)} border-0`}>
                          {getStatusIcon(service.status)}
                          <span className="ml-1">{service.status.replace(/_/g, ' ')}</span>
                        </Badge>
                        <Badge className={`${getPriorityColor(service.priority)} border-0`}>
                          {service.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {service.scheduled_date 
                            ? format(new Date(service.scheduled_date), "MMM d, yyyy")
                            : "Not scheduled"
                          }
                        </span>
                      </div>
                      {service.location?.address && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{service.location.address}</span>
                        </div>
                      )}
                      {service.estimated_cost && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <IndianRupee className="w-4 h-4" /> {/* Changed icon to IndianRupee */}
                          <span>₹{service.estimated_cost.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="text-sm text-slate-500">
                        {format(new Date(service.created_date), "MMM d, yyyy")}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-slate-700">{service.description}</p>
                    </div>

                    {service.service_provider_id && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-blue-800 mb-1">Assigned Provider:</p>
                        <p className="text-sm text-blue-700">
                          {provider.business_name || provider.full_name}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                      {service.status === "requested" && (
                        <Button
                          onClick={() => {
                            setSelectedService(service);
                            setShowAssignDialog(true);
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Assign Provider
                        </Button>
                      )}
                      
                      {service.status === "assigned" && (
                        <Button
                          onClick={() => handleStatusUpdate(service.id, "in_progress")}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Mark In Progress
                        </Button>
                      )}
                      
                      {service.status === "in_progress" && (
                        <Button
                          onClick={() => handleStatusUpdate(service.id, "completed")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Completed
                        </Button>
                      )}
                      
                      {service.status !== "completed" && service.status !== "cancelled" && (
                        <Button
                          onClick={() => handleStatusUpdate(service.id, "cancelled")}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Assign Provider Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Service Provider</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Service Provider
                </label>
                <Select
                  value={assignFormData.service_provider_id}
                  onValueChange={(value) => setAssignFormData(prev => ({ ...prev, service_provider_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.business_name || provider.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estimated Cost (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={assignFormData.estimated_cost}
                  onChange={(e) => setAssignFormData(prev => ({ ...prev, estimated_cost: parseInt(e.target.value) }))}
                  placeholder="Enter estimated cost"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <Textarea
                  value={assignFormData.notes}
                  onChange={(e) => setAssignFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the provider..."
                  className="h-20"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Assign Provider
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
