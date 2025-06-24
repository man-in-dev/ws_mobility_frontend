import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { 
  Wrench, 
  Package, 
  CreditCard, 
  Shield, 
  Clock
} from "lucide-react";

export default function RecentActivity({ activity, userType }) {
  const getActivityIcon = (type) => {
    const icons = {
      service: Wrench,
      order: Package,
      payment: CreditCard,
      lead: Shield
    };
    return icons[type] || Clock;
  };

  const getStatusColor = (status) => {
    const colors = {
      // Service statuses
      requested: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      
      // Order statuses
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      packed: "bg-indigo-100 text-indigo-800",
      dispatched: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      
      // Payment statuses
      collected: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      
      // Lead statuses
      new: "bg-yellow-100 text-yellow-800",
      contacted: "bg-blue-100 text-blue-800",
      quoted: "bg-purple-100 text-purple-800",
      converted: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="p-6 border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activity.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No recent activity to show</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {activity.map((item, index) => {
              const IconComponent = getActivityIcon(item.type);
              return (
                <div key={index} className="flex items-center gap-4 p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <IconComponent className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(item.status)} border-0 text-xs`}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}