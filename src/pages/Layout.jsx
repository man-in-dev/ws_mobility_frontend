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
  UserCheck,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showProfileSetup, setShowProfileSetup] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    user_type: "service_provider", // Default to service_provider
    phone: "",
    business_name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [loginForm, setLoginForm] = React.useState({ email: "", password: "" });
  const [loginError, setLoginError] = React.useState("");

  React.useEffect(() => {
    // Set browser title
    document.title = "WS Mobility - Multi-Vehicle Service Platform";
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      if (!userData.user_type) {
        setShowProfileSetup(true);
        setProfileData({
          user_type: "service_provider", // Always set to service_provider for new users
          phone: userData.phone || "",
          business_name: userData.business_name || "",
          address: userData.address || "",
          city: userData.city || "",
          state: userData.state || "",
          pincode: userData.pincode || "",
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await User.login(loginForm);
      setShowLoginModal(false);
      loadUser();
    } catch (err) {
      setLoginError(err.message || "Login failed");
    }
  };

  const getNavigationItems = () => {
    if (!user || !user.user_type) return [];

    const baseItems = [
      {
        title: "Dashboard",
        url: createPageUrl("Dashboard"),
        icon: LayoutDashboard,
      },
    ];

    // Since we're only supporting service_provider now, simplify this
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
      },
    ];
  };

  const getUserTypeLabel = (type) => {
    return "Service Provider"; // Always returns Service Provider
  };

  const getUserTypeBadgeColor = (type) => {
    return "bg-blue-100 text-blue-800"; // Always returns color for Service Provider
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="WS Mobility" className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome to WS Mobility
          </h1>
          <p className="text-slate-600 mb-6">Please sign in to continue</p>
          <Button
            onClick={() => setShowLoginModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-3"
          >
            Sign In
          </Button>
          {showLoginModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm relative">
                <button
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
                  onClick={() => setShowLoginModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-xl font-bold mb-4">Sign In</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  {loginError && (
                    <div className="text-red-600 text-sm">{loginError}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 text-white"
                  >
                    Sign In
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="WS Mobility" className="h-20 w-auto" />
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <p className="text-slate-600">
              Please provide some basic information to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="user_type">What describes you best?</Label>
                <Select
                  value={profileData.user_type}
                  onValueChange={(value) =>
                    setProfileData((prev) => ({ ...prev, user_type: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_provider">
                      Service Provider
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Your phone number"
                    required
                  />
                </div>
                {/* Always show business_name as user_type is fixed to service_provider */}
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={profileData.business_name}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        business_name: e.target.value,
                      }))
                    }
                    placeholder="Your business name"
                    required // Made required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Your address"
                  required // Made required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="City"
                    required // Made required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profileData.state}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    placeholder="State"
                    required // Made required
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={profileData.pincode}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        pincode: e.target.value,
                      }))
                    }
                    placeholder="Pincode"
                    required // Made required
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
              <img src="/logo.png" alt="WS Mobility" className="h-12 w-auto" />
              <div>
                <h2 className="font-bold text-slate-900">WS Mobility</h2>
                <p className="text-xs text-slate-500">
                  Service Provider Portal
                </p>
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
                          location.pathname === item.url
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                            : ""
                        }`}
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-3 px-4 py-3"
                        >
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
                <p className="font-semibold text-slate-900 text-sm truncate">
                  {user.full_name}
                </p>
                {/* user.user_type check is implicitly true for service_provider, but keeping it doesn't hurt */}
                <Badge
                  className={`text-xs ${getUserTypeBadgeColor(user.user_type)}`}
                >
                  {getUserTypeLabel(user.user_type)}
                </Badge>
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
              <img src="/logo.png" alt="WS Mobility" className="h-8 w-auto" />
              <h1 className="text-xl font-bold text-slate-900">WS Mobility</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
