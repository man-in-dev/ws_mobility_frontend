import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Edit, 
  Search,
  Filter,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    email: "",
    user_type: "",
    full_name: "",
    phone: "",
    business_name: "",
    commission_rate: 10
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await User.list("-created_date");
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setIsLoading(false);
  };

  const handleUserUpdate = async (userId, updateData) => {
    try {
      await User.update(userId, updateData);
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await handleUserUpdate(userId, { status: newStatus });
  };

  const toggleVerification = async (userId, currentVerification) => {
    await handleUserUpdate(userId, { is_verified: !currentVerification });
  };

  const getUserTypeColor = (type) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      service_provider: "bg-blue-100 text-blue-800",
      vehicle_owner: "bg-green-100 text-green-800",
      payment_collector: "bg-yellow-100 text-yellow-800",
      warehouse_staff: "bg-purple-100 text-purple-800",
      dispatcher: "bg-orange-100 text-orange-800",
      insurance_agent: "bg-pink-100 text-pink-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4" />;
      case "suspended":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.user_type === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-1">Manage platform users and their permissions</p>
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setInviteFormData({ email: "", user_type: "", full_name: "", phone: "", business_name: "", commission_rate: 10 })}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Note: This is a demo. In a real application, you would send an invitation email to the user.
                </p>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteFormData.email}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={inviteFormData.full_name}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="user_type">User Role</Label>
                  <Select
                    value={inviteFormData.user_type}
                    onValueChange={(value) => setInviteFormData(prev => ({ ...prev, user_type: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_provider">Service Provider</SelectItem>
                      <SelectItem value="vehicle_owner">Vehicle Owner</SelectItem>
                      <SelectItem value="payment_collector">Payment Collector</SelectItem>
                      <SelectItem value="warehouse_staff">Warehouse Staff</SelectItem>
                      <SelectItem value="dispatcher">Dispatcher</SelectItem>
                      <SelectItem value="insurance_agent">Insurance Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {inviteFormData.user_type === "service_provider" && (
                  <>
                    <div>
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        id="business_name"
                        value={inviteFormData.business_name}
                        onChange={(e) => setInviteFormData(prev => ({ ...prev, business_name: e.target.value }))}
                        placeholder="Business name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                      <Input
                        id="commission_rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={inviteFormData.commission_rate}
                        onChange={(e) => setInviteFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={inviteFormData.phone}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      console.log("Would send invitation to:", inviteFormData);
                      setShowInviteDialog(false);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Send Invite
                  </Button>
                </div>
              </div>
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="service_provider">Service Provider</SelectItem>
                  <SelectItem value="vehicle_owner">Vehicle Owner</SelectItem>
                  <SelectItem value="payment_collector">Payment Collector</SelectItem>
                  <SelectItem value="warehouse_staff">Warehouse Staff</SelectItem>
                  <SelectItem value="dispatcher">Dispatcher</SelectItem>
                  <SelectItem value="insurance_agent">Insurance Agent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
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

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Users Found</h3>
              <p className="text-slate-600">No users match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-slate-900 mb-2">
                        {user.full_name}
                      </CardTitle>
                      {user.business_name && (
                        <p className="text-sm text-slate-600 mb-2">{user.business_name}</p>
                      )}
                      <div className="flex gap-2 mb-2">
                        <Badge className={`${getUserTypeColor(user.user_type)} border-0 text-xs`}>
                          {user.user_type?.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className={`${getStatusColor(user.status)} border-0 text-xs`}>
                          {getStatusIcon(user.status)}
                          <span className="ml-1">{user.status}</span>
                        </Badge>
                      </div>
                      {user.is_verified && (
                        <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.commission_rate && (
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Commission: {user.commission_rate}%</span>
                      </div>
                    )}
                    {user.city && (
                      <div className="text-sm text-slate-600">
                        <span>{user.city}, {user.state}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                    <Button
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      size="sm"
                      variant={user.status === "active" ? "outline" : "default"}
                      className="flex-1 text-xs"
                    >
                      {user.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                    <Button
                      onClick={() => toggleVerification(user.id, user.is_verified)}
                      size="sm"
                      variant={user.is_verified ? "outline" : "default"}
                      className="flex-1 text-xs"
                    >
                      {user.is_verified ? "Unverify" : "Verify"}
                    </Button>
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