import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function DashboardStats({ stats, userType }) {
  const getStatsConfig = () => {
    switch (userType) {
      case "admin":
        return [
          {
            title: "Total Services",
            value: stats.totalServices || 0,
            icon: Wrench,
            color: "blue",
            description: "All service requests"
          },
          {
            title: "Total Orders",
            value: stats.totalOrders || 0,
            icon: Package,
            color: "green",
            description: "Inventory orders"
          },
          {
            title: "Total Revenue",
            value: `₹${(stats.totalPayments || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "purple",
            description: "Platform revenue"
          },
          {
            title: "Insurance Leads",
            value: stats.totalLeads || 0,
            icon: Shield,
            color: "orange",
            description: "Total leads generated"
          }
        ];
      
      case "service_provider":
        return [
          {
            title: "Total Services",
            value: stats.totalServices || 0,
            icon: Wrench,
            color: "blue",
            description: "Services completed"
          },
          {
            title: "Active Services",
            value: stats.activeServices || 0,
            icon: Clock,
            color: "yellow",
            description: "In progress"
          },
          {
            title: "Total Earnings",
            value: `₹${(stats.totalEarnings || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "green",
            description: "Net earnings"
          },
          {
            title: "Pending Orders",
            value: stats.pendingOrders || 0,
            icon: Package,
            color: "red",
            description: "Parts orders"
          }
        ];
      
      case "vehicle_owner":
        return [
          {
            title: "Total Services",
            value: stats.totalServices || 0,
            icon: Wrench,
            color: "blue",
            description: "Services booked"
          },
          {
            title: "Pending Services",
            value: stats.pendingServices || 0,
            icon: Clock,
            color: "yellow",
            description: "In progress"
          },
          {
            title: "Total Spent",
            value: `₹${(stats.totalSpent || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "purple",
            description: "Service expenses"
          },
          {
            title: "Insurance Leads",
            value: stats.insuranceLeads || 0,
            icon: Shield,
            color: "green",
            description: "Insurance queries"
          }
        ];
      
      case "payment_collector":
        return [
          {
            title: "Total Collections",
            value: stats.totalCollections || 0,
            icon: CreditCard,
            color: "blue",
            description: "Payment tasks"
          },
          {
            title: "Amount Collected",
            value: `₹${(stats.amountCollected || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "green",
            description: "Successfully collected"
          },
          {
            title: "Pending Collections",
            value: stats.pendingCollections || 0,
            icon: Clock,
            color: "yellow",
            description: "Awaiting collection"
          },
          {
            title: "Failed Collections",
            value: stats.failedCollections || 0,
            icon: AlertCircle,
            color: "red",
            description: "Collection failures"
          }
        ];
      
      case "warehouse_staff":
        return [
          {
            title: "Pending Packing",
            value: stats.pendingPacking || 0,
            icon: Package,
            color: "yellow",
            description: "Orders to pack"
          },
          {
            title: "Packed Today",
            value: stats.packedToday || 0,
            icon: CheckCircle2,
            color: "green",
            description: "Today's progress"
          },
          {
            title: "Total Packed",
            value: stats.totalPacked || 0,
            icon: Package,
            color: "blue",
            description: "All time packed"
          }
        ];
      
      case "dispatcher":
        return [
          {
            title: "Ready for Dispatch",
            value: stats.readyForDispatch || 0,
            icon: Package,
            color: "yellow",
            description: "Packed orders"
          },
          {
            title: "Dispatched Today",
            value: stats.dispatchedToday || 0,
            icon: CheckCircle2,
            color: "green",
            description: "Today's dispatches"
          },
          {
            title: "Total Dispatched",
            value: stats.totalDispatched || 0,
            icon: Package,
            color: "blue",
            description: "All time dispatched"
          }
        ];
      
      case "insurance_agent":
        return [
          {
            title: "Total Leads",
            value: stats.totalLeads || 0,
            icon: Shield,
            color: "blue",
            description: "Assigned leads"
          },
          {
            title: "New Leads",
            value: stats.newLeads || 0,
            icon: AlertCircle,
            color: "yellow",
            description: "Awaiting contact"
          },
          {
            title: "Converted Leads",
            value: stats.convertedLeads || 0,
            icon: CheckCircle2,
            color: "green",
            description: "Successful conversions"
          },
          {
            title: "Total Commission",
            value: `₹${(stats.totalCommission || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "purple",
            description: "Commission earned"
          }
        ];
      
      default:
        return [];
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500"
    };
    return colors[color] || "bg-gray-500";
  };

  const statsConfig = getStatsConfig();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${getColorClasses(stat.color)} rounded-full opacity-10`} />
          <CardHeader className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">
                  {stat.value}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl ${getColorClasses(stat.color)} bg-opacity-20`}>
                <stat.icon className={`w-6 h-6 ${getColorClasses(stat.color).replace('bg-', 'text-')}`} />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}