import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  Wrench, 
  Package, 
  CreditCard, 
  Shield, 
  Users,
  Settings,
  FileText,
  Search
} from "lucide-react";

export default function QuickActions({ userType }) {
  const getQuickActions = () => {
    switch (userType) {
      case "admin":
        return [
          {
            title: "Manage Users",
            description: "Add or manage platform users",
            icon: Users,
            url: createPageUrl("UserManagement"),
            color: "blue"
          },
          {
            title: "View Reports",
            description: "Analytics and reports",
            icon: FileText,
            url: createPageUrl("Reports"),
            color: "purple"
          },
          {
            title: "System Settings",
            description: "Configure platform settings",
            icon: Settings,
            url: createPageUrl("Settings"),
            color: "gray"
          }
        ];
      
      case "service_provider":
        return [
          {
            title: "Order Parts",
            description: "Browse and order spare parts",
            icon: Package,
            url: createPageUrl("OrderParts"),
            color: "green"
          },
          {
            title: "View Earnings",
            description: "Check payments and settlements",
            icon: CreditCard,
            url: createPageUrl("MyPayments"),
            color: "purple"
          },
          {
            title: "Service History",
            description: "View completed services",
            icon: Wrench,
            url: createPageUrl("MyServices"),
            color: "blue"
          }
        ];
      
      case "vehicle_owner":
        return [
          {
            title: "Book Service",
            description: "Request a new service",
            icon: Plus,
            url: createPageUrl("BookService"),
            color: "blue"
          },
          {
            title: "Add Vehicle",
            description: "Register a new vehicle",
            icon: Plus,
            url: createPageUrl("MyVehicles"),
            color: "green"
          },
          {
            title: "Get Insurance Quote",
            description: "Request insurance quotes",
            icon: Shield,
            url: createPageUrl("Insurance"),
            color: "orange"
          }
        ];
      
      case "payment_collector":
        return [
          {
            title: "Pending Collections",
            description: "View pending payments",
            icon: CreditCard,
            url: createPageUrl("PaymentCollection"),
            color: "yellow"
          },
          {
            title: "Search Orders",
            description: "Find specific orders",
            icon: Search,
            url: createPageUrl("PaymentCollection"),
            color: "blue"
          }
        ];
      
      case "warehouse_staff":
        return [
          {
            title: "Pack Orders",
            description: "Process pending orders",
            icon: Package,
            url: createPageUrl("PackingOrders"),
            color: "green"
          },
          {
            title: "Check Inventory",
            description: "View stock levels",
            icon: Search,
            url: createPageUrl("PackingOrders"),
            color: "blue"
          }
        ];
      
      case "dispatcher":
        return [
          {
            title: "Dispatch Orders",
            description: "Process packed orders",
            icon: Package,
            url: createPageUrl("DispatchOrders"),
            color: "purple"
          },
          {
            title: "Track Deliveries",
            description: "Monitor delivery status",
            icon: Search,
            url: createPageUrl("DispatchOrders"),
            color: "blue"
          }
        ];
      
      case "insurance_agent":
        return [
          {
            title: "New Leads",
            description: "Contact new leads",
            icon: Shield,
            url: createPageUrl("InsuranceAgentLeads"),
            color: "orange"
          },
          {
            title: "Follow Up",
            description: "Follow up on quotes",
            icon: Search,
            url: createPageUrl("InsuranceAgentLeads"),
            color: "blue"
          }
        ];
      
      default:
        return [];
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-500 hover:bg-blue-600",
      green: "bg-green-500 hover:bg-green-600",
      purple: "bg-purple-500 hover:bg-purple-600",
      orange: "bg-orange-500 hover:bg-orange-600",
      yellow: "bg-yellow-500 hover:bg-yellow-600",
      gray: "bg-gray-500 hover:bg-gray-600"
    };
    return colors[color] || "bg-gray-500 hover:bg-gray-600";
  };

  const quickActions = getQuickActions();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="p-6 border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.url} className="block">
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto p-4 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
            >
              <div className={`p-2 rounded-lg ${getColorClasses(action.color)} mr-4`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-900">{action.title}</p>
                <p className="text-xs text-slate-500 mt-1">{action.description}</p>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}