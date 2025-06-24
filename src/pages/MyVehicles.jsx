import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Fuel,
  Calendar,
  Hash,
  Palette
} from "lucide-react";

export default function MyVehicles() {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: "",
    fuel_type: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    registration_number: "",
    engine_number: "",
    chassis_number: "",
    color: "",
    mileage: 0
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
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const vehicleData = {
        ...formData,
        owner_id: user.id
      };

      if (editingVehicle) {
        await Vehicle.update(editingVehicle.id, vehicleData);
      } else {
        await Vehicle.create(vehicleData);
      }

      setShowAddDialog(false);
      setEditingVehicle(null);
      resetForm();
      loadUserAndVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      vehicle_type: "",
      fuel_type: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      registration_number: "",
      engine_number: "",
      chassis_number: "",
      color: "",
      mileage: 0
    });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setShowAddDialog(true);
  };

  const handleDelete = async (vehicleId) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await Vehicle.delete(vehicleId);
        loadUserAndVehicles();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
      }
    }
  };

  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case "2W": return "🏍️";
      case "3W": return "🛺";
      case "4W": return "🚗";
      default: return "🚙";
    }
  };

  const getFuelTypeColor = (fuelType) => {
    const colors = {
      petrol: "bg-red-100 text-red-800",
      diesel: "bg-blue-100 text-blue-800",
      cng: "bg-green-100 text-green-800",
      electric: "bg-purple-100 text-purple-800"
    };
    return colors[fuelType] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading vehicles...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">My Vehicles</h1>
            <p className="text-slate-600 mt-1">Manage your registered vehicles</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm();
                  setEditingVehicle(null);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicle_type">Vehicle Type</Label>
                    <Select
                      value={formData.vehicle_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_type: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2W">2 Wheeler</SelectItem>
                        <SelectItem value="3W">3 Wheeler</SelectItem>
                        <SelectItem value="4W">4 Wheeler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fuel_type">Fuel Type</Label>
                    <Select
                      value={formData.fuel_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, fuel_type: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="cng">CNG</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={formData.make}
                      onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="e.g., Maruti Suzuki"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="e.g., Swift"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1980"
                      max={new Date().getFullYear()}
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="e.g., Pearl White"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="registration_number">Registration Number</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value.toUpperCase() }))}
                    placeholder="e.g., MH12AB1234"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="engine_number">Engine Number</Label>
                    <Input
                      id="engine_number"
                      value={formData.engine_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, engine_number: e.target.value }))}
                      placeholder="Engine number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chassis_number">Chassis Number</Label>
                    <Input
                      id="chassis_number"
                      value={formData.chassis_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, chassis_number: e.target.value }))}
                      placeholder="Chassis number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="mileage">Current Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    value={formData.mileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                    placeholder="Current odometer reading"
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
                    {isSubmitting ? "Saving..." : (editingVehicle ? "Update" : "Add Vehicle")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Vehicles Added</h3>
              <p className="text-slate-600 mb-6">Add your first vehicle to start booking services</p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">{getVehicleTypeIcon(vehicle.vehicle_type)}</div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(vehicle)}
                        className="text-slate-400 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                    {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <div className="flex gap-2 mb-4">
                    <Badge className="bg-slate-100 text-slate-700 border-0">
                      {vehicle.vehicle_type}
                    </Badge>
                    <Badge className={`${getFuelTypeColor(vehicle.fuel_type)} border-0`}>
                      {vehicle.fuel_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{vehicle.registration_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{vehicle.year}</span>
                    </div>
                    {vehicle.color && (
                      <div className="flex items-center gap-2 text-sm">
                        <Palette className="w-4 h-4 text-slate-400" />
                        <span>{vehicle.color}</span>
                      </div>
                    )}
                    {vehicle.mileage > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Fuel className="w-4 h-4 text-slate-400" />
                        <span>{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}