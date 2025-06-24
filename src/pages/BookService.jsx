import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { ServiceRequest } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Car, 
  Wrench, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BookService() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    service_type: "",
    description: "",
    priority: "medium",
    scheduled_date: null,
    location: {
      address: "",
      latitude: null,
      longitude: null
    }
  });

  useEffect(() => {
    loadUserAndVehicles();
  }, []);

  const loadUserAndVehicles = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userVehicles = await Vehicle.filter({ owner_id: userData.id });
      setVehicles(userVehicles);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    setIsSubmitting(true);
    try {
      await ServiceRequest.create({
        customer_id: user.id,
        vehicle_id: selectedVehicle.id,
        service_type: formData.service_type,
        description: formData.description,
        priority: formData.priority,
        scheduled_date: formData.scheduled_date,
        location: formData.location
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("ServiceHistory"));
      }, 2000);
    } catch (error) {
      console.error("Error booking service:", error);
    }
    setIsSubmitting(false);
  };

  const serviceTypes = [
    { value: "general_service", label: "General Service", icon: "🔧" },
    { value: "oil_change", label: "Oil Change", icon: "🛢️" },
    { value: "brake_service", label: "Brake Service", icon: "🛑" },
    { value: "engine_repair", label: "Engine Repair", icon: "⚙️" },
    { value: "electrical", label: "Electrical Work", icon: "⚡" },
    { value: "ac_service", label: "AC Service", icon: "❄️" },
    { value: "battery_replacement", label: "Battery Replacement", icon: "🔋" },
    { value: "tire_service", label: "Tire Service", icon: "🛞" },
    { value: "emergency_repair", label: "Emergency Repair", icon: "🚨" }
  ];

  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "emergency", label: "Emergency", color: "bg-red-100 text-red-800" }
  ];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Booked!</h2>
            <p className="text-slate-600 mb-4">Your service request has been submitted successfully. You'll be notified once a service provider is assigned.</p>
            <div className="animate-pulse text-sm text-slate-500">Redirecting to service history...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Book a Service</h1>
            <p className="text-slate-600 mt-1">Request professional service for your vehicle</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Vehicle Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Select Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No vehicles found</p>
                    <Button 
                      onClick={() => navigate(createPageUrl("MyVehicles"))}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add Vehicle
                    </Button>
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedVehicle?.id === vehicle.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <Badge className="bg-slate-100 text-slate-700">
                          {vehicle.vehicle_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{vehicle.registration_number}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {vehicle.fuel_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {vehicle.year}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Service Booking Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <Label htmlFor="service_type">Service Type</Label>
                    <Select
                      value={formData.service_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                      required
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Service Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue or service needed..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-2 h-24"
                      required
                    />
                  </div>

                  {/* Priority and Date */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <Badge className={`${option.color} border-0`}>
                                {option.label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Preferred Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full mt-2 justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.scheduled_date 
                              ? format(new Date(formData.scheduled_date), "PPP")
                              : "Select date"
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.scheduled_date ? new Date(formData.scheduled_date) : undefined}
                            onSelect={(date) => setFormData(prev => ({ ...prev, scheduled_date: date }))}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="address">Service Location</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Textarea
                        id="address"
                        placeholder="Enter full address where service is needed..."
                        value={formData.location.address}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, address: e.target.value }
                        }))}
                        className="pl-10 h-20"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(createPageUrl("Dashboard"))}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!selectedVehicle || isSubmitting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Book Service
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}