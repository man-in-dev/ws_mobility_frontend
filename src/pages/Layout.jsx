

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  LayoutDashboard, 
  Wrench, 
  Car, 
  Package, 
  CreditCard, 
  Shield,
  Users,
  Settings,
  Bell,
  Menu,
  LogOut,
  UserCheck
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,  
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showProfileSetup, setShowProfileSetup] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    user_type: "",
    phone: "",
    business_name: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Check if user needs to complete profile
      if (!userData.user_type) {
        setShowProfileSetup(true);
        setProfileData({
          user_type: userData.user_type || "",
          phone: userData.phone || "",
          business_name: userData.business_name || "",
          address: userData.address || "",
          city: userData.city || "",
          state: userData.state || "",
          pincode: userData.pincode || ""
        });
      }
    } catch (error) {
      console.log("User not logged in");
    }
    setIsLoading(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await User.updateMyUserData(profileData);
      setShowProfileSetup(false);
      // Reload user data
      const updatedUser = await User.me();
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  const getNavigationItems = () => {
    if (!user || !user.user_type) return [];

    const baseItems = [
      {
        title: "Dashboard",
        url: createPageUrl("Dashboard"),
        icon: LayoutDashboard,
      }
    ];

    switch (user.user_type) {
      case "admin":
        return [
          ...baseItems,
          {
            title: "Service Requests",
            url: createPageUrl("ServiceRequests"),
            icon: Wrench,
          },
          {
            title: "Inventory Management",
            url: createPageUrl("InventoryManagement"),
            icon: Package,
          },
          {
            title: "User Management",
            url: createPageUrl("UserManagement"),
            icon: Users,
          },
          {
            title: "Payments & Settlement",
            url: createPageUrl("PaymentSettlement"),
            icon: CreditCard,
          },
          {
            title: "Insurance Leads",
            url: createPageUrl("InsuranceLeads"),
            icon: Shield,
          }
        ];
      
      case "service_provider":
        return [
          ...baseItems,
          {
            title: "My Services",
            url: createPageUrl("MyServices"),
            icon: Wrench,
          },
          {
            title: "Order Parts",
            url: createPageUrl("OrderParts"),
            icon: Package,
          },
          {
            title: "My Orders",
            url: createPageUrl("MyOrders"),
            icon: Package,
          },
          {
            title: "Payments",
            url: createPageUrl("MyPayments"),
            icon: CreditCard,
          },
          {
            title: "Insurance Leads",
            url: createPageUrl("MyInsuranceLeads"),
            icon: Shield,
          }
        ];
      
      case "vehicle_owner":
        return [
          ...baseItems,
          {
            title: "My Vehicles",
            url: createPageUrl("MyVehicles"),
            icon: Car,
          },
          {
            title: "Book Service",
            url: createPageUrl("BookService"),
            icon: Wrench,
          },
          {
            title: "Service History",
            url: createPageUrl("ServiceHistory"),
            icon: Wrench,
          },
          {
            title: "Insurance",
            url: createPageUrl("Insurance"),
            icon: Shield,
          }
        ];
      
      case "payment_collector":
        return [
          ...baseItems,
          {
            title: "Payment Collection",
            url: createPageUrl("PaymentCollection"),
            icon: CreditCard,
          }
        ];
      
      case "warehouse_staff":
        return [
          ...baseItems,
          {
            title: "Packing Orders",
            url: createPageUrl("PackingOrders"),
            icon: Package,
          }
        ];
      
      case "dispatcher":
        return [
          ...baseItems,
          {
            title: "Dispatch Orders",
            url: createPageUrl("DispatchOrders"),
            icon: Package,
          }
        ];
      
      case "insurance_agent":
        return [
          ...baseItems,
          {
            title: "Insurance Leads",
            url: createPageUrl("InsuranceAgentLeads"),
            icon: Shield,
          }
        ];
      
      default:
        return baseItems;
    }
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      admin: "Administrator",
      service_provider: "Service Provider",
      vehicle_owner: "Vehicle Owner",
      payment_collector: "Payment Collector",
      warehouse_staff: "Warehouse Staff",
      dispatcher: "Dispatcher",
      insurance_agent: "Insurance Agent"
    };
    return labels[type] || type;
  };

  const getUserTypeBadgeColor = (type) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f2c382ff_image.png" 
              alt="WS Mobility" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">WS Mobility</h1>
          <p className="text-slate-600 mb-6">Multi-Vehicle Service Aggregator Platform</p>
          <Button onClick={() => User.login()} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  // Show profile setup if user doesn't have user_type
  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f2c382ff_image.png" 
                alt="WS Mobility" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <p className="text-slate-600">Please provide some basic information to get started</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="user_type">What describes you best?</Label>
                <Select
                  value={profileData.user_type}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, user_type: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle_owner">Vehicle Owner</SelectItem>
                    <SelectItem value="service_provider">Service Provider</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="payment_collector">Payment Collector</SelectItem>
                    <SelectItem value="warehouse_staff">Warehouse Staff</SelectItem>
                    <SelectItem value="dispatcher">Dispatcher</SelectItem>
                    <SelectItem value="insurance_agent">Insurance Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your phone number"
                    required
                  />
                </div>
                {profileData.user_type === "service_provider" && (
                  <div>
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      value={profileData.business_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, business_name: e.target.value }))}
                      placeholder="Your business name"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Your address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profileData.state}
                    onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={profileData.pincode}
                    onChange={(e) => setProfileData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Complete Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navigationItems = getNavigationItems();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f2c382ff_image.png" 
                alt="WS Mobility" 
                className="h-10 w-auto"
              />
              <div>
                <h2 className="font-bold text-slate-900">WS Mobility</h2>
                <p className="text-xs text-slate-500">Multi-Vehicle Platform</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{user.full_name}</p>
                {user.user_type && (
                  <Badge className={`text-xs ${getUserTypeBadgeColor(user.user_type)}`}>
                    {getUserTypeLabel(user.user_type)}
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f2c382ff_image.png" 
                alt="WS Mobility" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-slate-900">WS Mobility</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

