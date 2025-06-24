
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { ServiceRequest } from "@/api/entities";
import { InventoryOrder } from "@/api/entities";
import { Payment } from "@/api/entities";
import { InsuranceLead } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Package, 
  CreditCard, 
  Shield, 
  TrendingUp, 
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import DashboardStats from "../components/dashboard/DashboardStats";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      await loadUserSpecificData(userData.user_type, userData.id);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const loadUserSpecificData = async (userType, userId) => {
    switch (userType) {
      case "admin":
        await loadAdminData();
        break;
      case "service_provider":
        await loadServiceProviderData(userId);
        break;
      case "vehicle_owner":
        await loadVehicleOwnerData(userId);
        break;
      case "payment_collector":
        await loadPaymentCollectorData(userId);
        break;
      case "warehouse_staff":
        await loadWarehouseData(userId);
        break;
      case "dispatcher":
        await loadDispatcherData(userId);
        break;
      case "insurance_agent":
        await loadInsuranceAgentData(userId);
        break;
    }
  };

  const loadAdminData = async () => {
    const [services, orders, payments, leads] = await Promise.all([
      ServiceRequest.list("-created_date", 10),
      InventoryOrder.list("-created_date", 10),
      Payment.list("-created_date", 10),
      InsuranceLead.list("-created_date", 10)
    ]);

    setStats({
      totalServices: services.length,
      totalOrders: orders.length,
      totalPayments: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalLeads: leads.length,
      pendingServices: services.filter(s => s.status === "requested").length,
      pendingOrders: orders.filter(o => o.status === "pending").length
    });

    setRecentActivity([
      ...services.slice(0, 5).map(s => ({
        type: "service",
        title: `New service request: ${s.service_type}`,
        time: s.created_date,
        status: s.status
      })),
      ...orders.slice(0, 5).map(o => ({
        type: "order",
        title: `Inventory order: ${o.order_number}`,
        time: o.created_date,
        status: o.status
      }))
    ]);
  };

  const loadServiceProviderData = async (userId) => {
    // Get all data first, then filter or show sample data if no user-specific data
    const [allServices, allOrders, allPayments, allLeads] = await Promise.all([
      ServiceRequest.list("-created_date", 50),
      InventoryOrder.list("-created_date", 50),
      Payment.list("-created_date", 50),
      InsuranceLead.list("-created_date", 50)
    ]);

    // Try to get user-specific data first
    let myServices = allServices.filter(s => s.service_provider_id === userId);
    let myOrders = allOrders.filter(o => o.service_provider_id === userId);
    let myPayments = allPayments.filter(p => p.payee_id === userId);
    let myLeads = allLeads.filter(l => l.service_provider_id === userId);

    // If no user-specific data, show sample data for demo
    if (myServices.length === 0) {
      myServices = allServices.slice(0, 3); // Show first 3 services
    }
    if (myOrders.length === 0) {
      myOrders = allOrders.slice(0, 2); // Show first 2 orders
    }
    if (myPayments.length === 0) {
      myPayments = allPayments.slice(0, 2); // Show first 2 payments
    }
    if (myLeads.length === 0) {
      myLeads = allLeads.slice(0, 2); // Show first 2 leads
    }

    setStats({
      totalServices: myServices.length,
      activeServices: myServices.filter(s => s.status === "in_progress").length,
      completedServices: myServices.filter(s => s.status === "completed").length,
      totalEarnings: myPayments.reduce((sum, p) => sum + (p.net_amount || p.amount || 0), 0),
      pendingOrders: myOrders.filter(o => o.status === "pending").length
    });

    setRecentActivity([
      ...myServices.slice(0, 4).map(s => ({
        type: "service",
        title: `Service: ${s.service_type?.replace(/_/g, ' ') || 'Service'}`,
        time: s.created_date,
        status: s.status
      })),
      ...myOrders.slice(0, 3).map(o => ({
        type: "order",
        title: `Parts order: ${o.order_number || 'Order'}`,
        time: o.created_date,
        status: o.status
      })),
      ...myLeads.slice(0, 2).map(l => ({
        type: "lead",
        title: `Insurance lead: ${l.lead_type?.replace(/_/g, ' ') || 'Lead'}`,
        time: l.created_date,
        status: l.status
      }))
    ]);
  };

  const loadVehicleOwnerData = async (userId) => {
    const [allServices, allLeads] = await Promise.all([
      ServiceRequest.list("-created_date", 50),
      InsuranceLead.list("-created_date", 50)
    ]);

    let myServices = allServices.filter(s => s.customer_id === userId);
    let myLeads = allLeads.filter(l => l.customer_id === userId);

    // Show sample data if no user-specific data
    if (myServices.length === 0) {
      myServices = allServices.slice(0, 3);
    }
    if (myLeads.length === 0) {
      myLeads = allLeads.slice(0, 2);
    }

    setStats({
      totalServices: myServices.length,
      pendingServices: myServices.filter(s => s.status !== "completed").length,
      completedServices: myServices.filter(s => s.status === "completed").length,
      totalSpent: myServices.reduce((sum, s) => sum + (s.actual_cost || s.estimated_cost || 0), 0),
      insuranceLeads: myLeads.length
    });

    setRecentActivity(
      myServices.slice(0, 6).map(s => ({
        type: "service",
        title: `${s.service_type?.replace(/_/g, ' ') || 'Service'} - ${s.status}`,
        time: s.created_date,
        status: s.status
      }))
    );
  };

  const loadPaymentCollectorData = async (userId) => {
    const allPayments = await Payment.list("-created_date", 50);
    let payments = allPayments.filter(p => p.collected_by === userId);

    if (payments.length === 0) {
      payments = allPayments.slice(0, 3);
    }
    
    setStats({
      totalCollections: payments.length,
      amountCollected: payments.filter(p => p.payment_status === "collected").reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingCollections: payments.filter(p => p.payment_status === "pending").length,
      failedCollections: payments.filter(p => p.payment_status === "failed").length
    });

    setRecentActivity(
      payments.slice(0, 6).map(p => ({
        type: "payment",
        title: `Payment ${p.payment_id} - ${p.payment_status}`,
        time: p.created_date,
        status: p.payment_status
      }))
    );
  };

  const loadWarehouseData = async (userId) => {
    const allOrders = await InventoryOrder.list("-created_date", 50);
    let orders = allOrders.filter(o => o.packed_by === userId);

    if (orders.length === 0) {
      orders = allOrders.filter(o => o.status === "approved" || o.status === "packed").slice(0, 3);
    }
    
    setStats({
      pendingPacking: allOrders.filter(o => o.status === "approved").length,
      packedToday: orders.filter(o => o.packed_by === userId && 
        new Date(o.packed_date).toDateString() === new Date().toDateString()).length,
      totalPacked: orders.filter(o => o.packed_by === userId).length
    });

    setRecentActivity(
      orders.slice(0, 6).map(o => ({
        type: "order",
        title: `Order ${o.order_number} - ${o.status}`,
        time: o.created_date,
        status: o.status
      }))
    );
  };

  const loadDispatcherData = async (userId) => {
    const allOrders = await InventoryOrder.list("-created_date", 50);
    let orders = allOrders.filter(o => o.dispatched_by === userId);

    if (orders.length === 0) {
      orders = allOrders.filter(o => o.status === "packed" || o.status === "dispatched").slice(0, 3);
    }
    
    setStats({
      readyForDispatch: allOrders.filter(o => o.status === "packed").length,
      dispatchedToday: orders.filter(o => o.dispatched_by === userId && 
        new Date(o.dispatched_date).toDateString() === new Date().toDateString()).length,
      totalDispatched: orders.filter(o => o.dispatched_by === userId).length
    });

    setRecentActivity(
      orders.slice(0, 6).map(o => ({
        type: "order",
        title: `Order ${o.order_number} - ${o.status}`,
        time: o.created_date,
        status: o.status
      }))
    );
  };

  const loadInsuranceAgentData = async (userId) => {
    const allLeads = await InsuranceLead.list("-created_date", 50);
    let leads = allLeads.filter(l => l.insurance_agent_id === userId);

    if (leads.length === 0) {
      leads = allLeads.slice(0, 3);
    }
    
    setStats({
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === "new").length,
      convertedLeads: leads.filter(l => l.status === "converted").length,
      totalCommission: leads.filter(l => l.converted_policy).reduce((sum, l) => sum + (l.converted_policy.commission_earned || 0), 0)
    });

    setRecentActivity(
      leads.slice(0, 6).map(l => ({
        type: "lead",
        title: `Insurance lead - ${l.lead_type?.replace(/_/g, ' ') || 'Lead'}`,
        time: l.created_date,
        status: l.status
      }))
    );
  };

  if (isLoading || !user) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.full_name}!</h1>
          <p className="text-slate-600 mt-1">Here's what's happening with your {user.user_type?.replace('_', ' ') || 'account'} dashboard</p>
        </div>

        {/* Stats Cards */}
        <DashboardStats stats={stats} userType={user.user_type} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity activity={recentActivity} userType={user.user_type} />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions userType={user.user_type} />
          </div>
        </div>
      </div>
    </div>
  );
}
