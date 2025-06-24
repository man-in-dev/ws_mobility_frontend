import React, { useState, useEffect } from "react";
import { InsuranceLead } from "@/api/entities";
import { Vehicle } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Plus, 
  Calendar, 
  DollarSign,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Car
} from "lucide-react";
import { format } from "date-fns";

export default function Insurance() {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [insuranceLeads, setInsuranceLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    lead_type: "new_policy",
    current_policy: {
      policy_number: "",
      insurer: "",
      expiry_date: "",
      premium: 0
    },
    coverage_required: [],
    budget_range: {
      min: 0,
      max: 0
    },
    contact_preference: "phone",
    best_time_to_call: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const [userVehicles, userLeads] = await Promise.all([
        Vehicle.filter({ owner_id: userData.id }),
        InsuranceLead.filter({ customer_id: userData.id }, "-created_date")
      ]);
      
      setVehicles(userVehicles);
      setInsuranceLeads(userLeads);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await InsuranceLead.create({
        ...formData,
        customer_id: user.id
      });

      setShowNewLeadDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error creating insurance lead:", error);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: "",
      lead_type: "new_policy",
      current_policy: {
        policy_number: "",
        insurer: "",
        expiry_date: "",
        premium: 0
      },
      coverage_required: [],
      budget_range: {
        min: 0,
        max: 0
      },
      contact_preference: "phone",
      best_time_to_call: "",
      notes: ""
    });
  };

  const handleCoverageChange = (coverage, checked) => {
    setFormData(prev => ({
      ...prev,
      coverage_required: checked
        ? [...prev.coverage_required, coverage]
        : prev.coverage_required.filter(c => c !== coverage)
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <AlertCircle className="w-4 h-4" />;
      case "contacted":
        return <Phone className="w-4 h-4" />;
      case "quoted":
        return <DollarSign className="w-4 h-4" />;
      case "converted":
        return <CheckCircle2 className="w-4 h-4" />;
      case "lost":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-yellow-100 text-yellow-800",
      contacted: "bg-blue-100 text-blue-800",
      quoted: "bg-purple-100 text-purple-800",
      converted: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})` : "Unknown Vehicle";
  };

  const coverageOptions = [
    { value: "comprehensive", label: "Comprehensive" },
    { value: "third_party", label: "Third Party" },
    { value: "zero_depreciation", label: "Zero Depreciation" },
    { value: "engine_protection", label: "Engine Protection" },
    { value: "roadside_assistance", label: "Roadside Assistance" }
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading insurance data...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Insurance</h1>
            <p className="text-slate-600 mt-1">Manage your vehicle insurance policies and quotes</p>
          </div>
          <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request Insurance Quote</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicle_id">Select Vehicle</Label>
                    <Select
                      value={formData.vehicle_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_id: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} ({vehicle.registration_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lead_type">Insurance Type</Label>
                    <Select
                      value={formData.lead_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, lead_type: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_policy">New Policy</SelectItem>
                        <SelectItem value="renewal">Policy Renewal</SelectItem>
                        <SelectItem value="claim_assistance">Claim Assistance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.lead_type === "renewal" && (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900">Current Policy Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="policy_number">Policy Number</Label>
                        <Input
                          id="policy_number"
                          value={formData.current_policy.policy_number}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            current_policy: { ...prev.current_policy, policy_number: e.target.value }
                          }))}
                          placeholder="Current policy number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="insurer">Current Insurer</Label>
                        <Input
                          id="insurer"
                          value={formData.current_policy.insurer}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            current_policy: { ...prev.current_policy, insurer: e.target.value }
                          }))}
                          placeholder="Insurance company"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry_date">Expiry Date</Label>
                        <Input
                          id="expiry_date"
                          type="date"
                          value={formData.current_policy.expiry_date}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            current_policy: { ...prev.current_policy, expiry_date: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="premium">Current Premium</Label>
                        <Input
                          id="premium"
                          type="number"
                          value={formData.current_policy.premium}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            current_policy: { ...prev.current_policy, premium: parseInt(e.target.value) }
                          }))}
                          placeholder="Current premium amount"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Coverage Required</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {coverageOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={formData.coverage_required.includes(option.value)}
                          onCheckedChange={(checked) => handleCoverageChange(option.value, checked)}
                        />
                        <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Budget Range</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Input
                        type="number"
                        placeholder="Min budget"
                        value={formData.budget_range.min}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          budget_range: { ...prev.budget_range, min: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Max budget"
                        value={formData.budget_range.max}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          budget_range: { ...prev.budget_range, max: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_preference">Contact Preference</Label>
                    <Select
                      value={formData.contact_preference}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, contact_preference: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="best_time_to_call">Best Time to Call</Label>
                    <Input
                      id="best_time_to_call"
                      value={formData.best_time_to_call}
                      onChange={(e) => setFormData(prev => ({ ...prev, best_time_to_call: e.target.value }))}
                      placeholder="e.g., 10 AM - 6 PM"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any specific requirements or questions..."
                    className="h-20"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewLeadDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isSubmitting ? "Submitting..." : "Request Quote"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Insurance Leads */}
        {insuranceLeads.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Insurance Requests</h3>
              <p className="text-slate-600 mb-6">Start by requesting a quote for your vehicle insurance</p>
              <Button
                onClick={() => setShowNewLeadDialog(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Your First Quote
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {insuranceLeads.map((lead) => (
              <Card key={lead.id} className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {lead.lead_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-slate-600 mb-2">{getVehicleInfo(lead.vehicle_id)}</p>
                    </div>
                    <Badge className={`${getStatusColor(lead.status)} border-0`}>
                      {getStatusIcon(lead.status)}
                      <span className="ml-1">{lead.status.replace(/_/g, ' ')}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(lead.created_date), "MMM d, yyyy")}</span>
                    </div>
                    {lead.budget_range && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        <span>₹{lead.budget_range.min} - ₹{lead.budget_range.max}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {lead.contact_preference === "phone" ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      <span>{lead.contact_preference}</span>
                    </div>
                  </div>

                  {lead.coverage_required && lead.coverage_required.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Coverage Required:</p>
                      <div className="flex flex-wrap gap-2">
                        {lead.coverage_required.map((coverage) => (
                          <Badge key={coverage} variant="outline" className="text-xs">
                            {coverage.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {lead.quotes_provided && lead.quotes_provided.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-slate-900 mb-3">Quotes Received:</h4>
                      <div className="space-y-3">
                        {lead.quotes_provided.map((quote, index) => (
                          <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3">
                            <div>
                              <p className="font-medium text-slate-900">{quote.insurer}</p>
                              <p className="text-sm text-slate-600">{quote.coverage}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">₹{quote.premium}</p>
                              <p className="text-xs text-slate-500">Valid till {format(new Date(quote.validity), "MMM d")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lead.converted_policy && (
                    <div className="bg-green-50 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-green-800 mb-2">✓ Policy Converted</h4>
                      <div className="text-sm text-green-700">
                        <p>Policy: {lead.converted_policy.policy_number}</p>
                        <p>Insurer: {lead.converted_policy.insurer}</p>
                        <p>Premium: ₹{lead.converted_policy.premium}</p>
                      </div>
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