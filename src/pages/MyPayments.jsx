import React, { useState, useEffect } from "react";
import { Payment } from "@/api/entities";
import { Commission } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  DollarSign, 
  TrendingDown,
  Banknote
} from "lucide-react";
import { format } from "date-fns";

export default function MyPayments() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalCommissions: 0,
    netPayout: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const [userPayments, userCommissions] = await Promise.all([
        Payment.filter({ payee_id: userData.id }, "-created_date"),
        Commission.filter({ user_id: userData.id }, "-created_date")
      ]);
      
      setPayments(userPayments);
      setCommissions(userCommissions);
      
      // Calculate statistics
      const totalEarnings = userPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalCommissions = userCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      
      setStats({
        totalEarnings,
        totalCommissions,
        netPayout: totalEarnings - totalCommissions
      });

    } catch (error) {
      console.error("Error loading payment data:", error);
    }
    setIsLoading(false);
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      collected: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getCommissionStatusColor = (status) => {
    const colors = {
      calculated: "bg-blue-100 text-blue-800",
      deducted: "bg-yellow-100 text-yellow-800",
      settled: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Payments</h1>
          <p className="text-slate-600 mt-1">Review your earnings, commissions, and settlements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Earnings</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Platform Commissions</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.totalCommissions.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Net Payout</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.netPayout.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Banknote className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">All Transactions</TabsTrigger>
                <TabsTrigger value="payments">Payments Received</TabsTrigger>
                <TabsTrigger value="commissions">Commissions Deducted</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                 <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[...payments, ...commissions]
                        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                        .map((tx) => (
                          <tr key={tx.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{format(new Date(tx.created_date), 'MMM d, yyyy')}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                              {tx.payment_id ? `Payment for Order #${tx.order_id}` : `Commission for ${tx.transaction_type} #${tx.transaction_id}`}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${tx.payment_id ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.payment_id ? `+₹${tx.amount.toLocaleString()}` : `-₹${tx.commission_amount.toLocaleString()}`}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="payments" className="mt-4">
                 <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {payments.map(p => (
                        <tr key={p.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{format(new Date(p.created_date), 'MMM d, yyyy')}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">{p.order_id}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm"><Badge className={getPaymentStatusColor(p.payment_status)}>{p.payment_status}</Badge></td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">₹{p.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="commissions" className="mt-4">
                 <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                       {commissions.map(c => (
                        <tr key={c.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{format(new Date(c.created_date), 'MMM d, yyyy')}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">{c.transaction_type} #{c.transaction_id}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm"><Badge className={getCommissionStatusColor(c.status)}>{c.status}</Badge></td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">₹{c.commission_amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}