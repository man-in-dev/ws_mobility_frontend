import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Wrench, 
  Package, 
  CreditCard, 
  Shield, 
  TrendingUp, 
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function DashboardStats({ stats, userType }) {
  const getStatsForUserType = () => {
    switch (userType) {
      case "admin":
        return [
          {
            title: "Total Services",
            value: stats.totalServices || 0,
            icon: Wrench,
            color: "bg-blue-100 text-blue-600"
          },
          {
            title: "Total Orders", 
            value: stats.totalOrders || 0,
            icon: Package,
            color: "bg-green-100 text-green-600"
          },
          {
            title: "Total Revenue",
            value: `₹${(stats.totalPayments || 0).toLocaleString()}`,
            icon: IndianRupee,
            color: "bg-purple-100 text-purple-600"
          },
          {
            title: "Insurance Leads",
            value: stats.totalLeads || 0,
            icon: Shield,
            color: "bg-orange-100 text-orange-600"
          }
        ];
      
      case "service_provider":
        return [
          {
            title: "Active Services",
            value: stats.activeServices || 0,
            icon: Wrench,
            color: "bg-blue-100 text-blue-600"
          },
          {
            title: "Total Earnings",
            value: `₹${(stats.totalEarnings || 0).toLocaleString()}`,
            icon: IndianRupee,
            color: "bg-green-100 text-green-600"
          },
          {
            title: "Pending Orders",
            value: stats.pendingOrders || 0,
            icon: Package,
            color: "bg-yellow-100 text-yellow-600"
          },
          {
            title: "Completed Services",
            value: stats.completedServices || 0,
            icon: CheckCircle2,
            color: "bg-purple-100 text-purple-600"
          }
        ];
      
      case "vehicle_owner":
        return [
          {
            title: "Total Services",
            value: stats.totalServices || 0,
            icon: Wrench,
            color: "bg-blue-100 text-blue-600"
          },
          {
            title: "Pending Services",
            value: stats.pendingServices || 0,
            icon: Clock,
            color: "bg-yellow-100 text-yellow-600"
          },
          {
            title: "Total Spent",
            value: `₹${(stats.totalSpent || 0).toLocaleString()}`,
            icon: IndianRupee,
            color: "bg-red-100 text-red-600"
          },
          {
            title: "Insurance Leads",
            value: stats.insuranceLeads || 0,
            icon: Shield,
            color: "bg-orange-100 text-orange-600"
          }
        ];
      
      case "payment_collector":
        return [
          {
            title: "Total Collections",
            value: stats.totalCollections || 0,
            icon: CreditCard,
            color: "bg-blue-100 text-blue-600"
          },
          {
            title: "Amount Collected",
            value: `₹${(stats.amountCollected || 0).toLocaleString()}`,
            icon: IndianRupee,
            color: "bg-green-100 text-green-600"
          },
          {
            title: "Pending Collections",
            value: stats.pendingCollections || 0,
            icon: Clock,
            color: "bg-yellow-100 text-yellow-600"
          },
          {
            title: "Failed Collections",
            value: stats.failedCollections || 0,
            icon: AlertCircle,
            color: "bg-red-100 text-red-600"
          }
        ];
      
      default:
        return [
          {
            title: "Dashboard",
            value: "Welcome",
            icon: TrendingUp,
            color: "bg-blue-100 text-blue-600"
          }
        ];
    }
  };

  const statsToShow = getStatsForUserType();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsToShow.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}