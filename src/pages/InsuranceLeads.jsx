
import React, { useState, useEffect } from "react";
import { InsuranceLead } from "@/api/entities";
import { Vehicle } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Shield, 
  Calendar, 
  DollarSign, 
  User as UserIcon,
  Phone,
  Mail,
  Edit,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

export default function InsuranceLeads() {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    insurance_agent_id: "",
    priority: "medium",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get all data for demo purposes
      const [allLeads, allUsers, allVehicles] = await Promise.all([
        InsuranceLead.list("-created_date"),
        User.list(),
        Vehicle.list()
      ]);
      
      setLeads(allLeads);
      setCustomers(allUsers.filter(user => user.user_type === "vehicle_owner" || !user.user_type));
      setAgents(allUsers.filter(user => user.user_type === "insurance_agent"));
      setVehicles(allVehicles);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      await InsuranceLead.update(leadId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAssignAgent = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      await InsuranceLead.update(selectedLead.id, {
        insurance_agent_id: assignFormData.insurance_agent_id,
        priority: assignFormData.priority,
        status: "contacted",
        notes: assignFormData.notes
      });
      
      setShowAssignDialog(false);
      setSelectedLead(null);
      setAssignFormData({ insurance_agent_id: "", priority: "medium", notes: "" });
      loadData();
    } catch (error) {
      console.error("Error assigning agent:", error);
    }
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
        return <XCircle className="w-4 h-4" />;
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getCustomerInfo = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer || { 
      full_name: "Sample Customer", 
      email: "customer@example.com", 
      phone: "+91 98765 43210" 
    };
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})` : "Maruti Swift (MH-01-AB-1234)";
  };

  const getAgentInfo = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    return agent || { full_name: "Unassigned" };
  };

  const filteredLeads = leads.filter(lead => {
    const customer = getCustomerInfo(lead.customer_id);
    const matchesSearch = customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.lead_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesType = typeFilter === "all" || lead.lead_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading insurance leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Insurance Leads</h1>
          <p className="text-slate-600 mt-1">Manage customer insurance leads and assignments</p>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search leads..."
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
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="new_policy">New Policy</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="claim_assistance">Claim Assistance</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads */}
        {filteredLeads.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Insurance Leads</h3>
              <p className="text-slate-600">No insurance leads match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredLeads.map((lead) => {
              const customer = getCustomerInfo(lead.customer_id);
              const agent = getAgentInfo(lead.insurance_agent_id);
              
              return (
                <Card key={lead.id} className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {lead.lead_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-slate-600 mb-2">{getVehicleInfo(lead.vehicle_id)}</p>
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
                        <Badge className={`${getStatusColor(lead.status)} border-0`}>
                          {getStatusIcon(lead.status)}
                          <span className="ml-1">{lead.status}</span>
                        </Badge>
                        <Badge className={`${getPriorityColor(lead.priority)} border-0`}>
                          {lead.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                        <UserIcon className="w-4 h-4" />
                        <span>Agent: {agent.full_name}</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span>Contact: {lead.contact_preference}</span>
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

                    {lead.current_policy && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Current Policy</h4>
                        <div className="text-sm text-blue-700">
                          <p>Policy: {lead.current_policy.policy_number}</p>
                          <p>Insurer: {lead.current_policy.insurer}</p>
                          <p>Premium: ₹{lead.current_policy.premium}</p>
                          <p>Expires: {format(new Date(lead.current_policy.expiry_date), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                    )}

                    {lead.quotes_provided && lead.quotes_provided.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-green-800 mb-3">Quotes Provided:</h4>
                        <div className="space-y-2">
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

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                      {lead.status === "new" && (
                        <Button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowAssignDialog(true);
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Assign Agent
                        </Button>
                      )}
                      
                      {lead.status === "contacted" && (
                        <Button
                          onClick={() => handleStatusUpdate(lead.id, "quoted")}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Mark as Quoted
                        </Button>
                      )}
                      
                      {lead.status === "quoted" && (
                        <>
                          <Button
                            onClick={() => handleStatusUpdate(lead.id, "converted")}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Converted
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(lead.id, "lost")}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            Mark as Lost
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Assign Agent Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Insurance Agent</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Insurance Agent
                </label>
                <Select
                  value={assignFormData.insurance_agent_id}
                  onValueChange={(value) => setAssignFormData(prev => ({ ...prev, insurance_agent_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <Select
                  value={assignFormData.priority}
                  onValueChange={(value) => setAssignFormData(prev => ({ ...prev, priority: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <Textarea
                  value={assignFormData.notes}
                  onChange={(e) => setAssignFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the agent..."
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
                  Assign Agent
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
