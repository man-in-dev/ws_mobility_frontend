import React, { useState, useEffect } from "react";
import { Payment } from "@/api/entities";
import { Commission } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Download,
  Search,
  Filter,
  Calendar,
  Users,
  Banknote
} from "lucide-react";
import { format } from "date-fns";

export default function PaymentSettlement() {
  const [payments, setPayments] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalCommissions: 0,
    pendingSettlements: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allPayments, allCommissions, allUsers] = await Promise.all([
        Payment.list("-created_date"),
        Commission.list("-created_date"),
        User.list()
      ]);
      
      setPayments(allPayments);
      setCommissions(allCommissions);
      setUsers(allUsers);
      
      // Calculate statistics
      const totalPayments = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalCommissions = allCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      const pendingSettlements = allCommissions.filter(c => c.status === "calculated").length;
      
      // Monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = allCommissions
        .filter(c => {
          const commissionDate = new Date(c.created_date);
          return commissionDate.getMonth() === currentMonth && commissionDate.getFullYear() === currentYear;
        })
        .reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      
      setStats({
        totalPayments,
        totalCommissions,
        pendingSettlements,
        monthlyRevenue
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const processSettlement = async (commissionIds) => {
    try {
      const batchId = `BATCH-${Date.now()}`;
      const promises = commissionIds.map(id => 
        Commission.update(id, { 
          status: "settled",
          settlement_batch: batchId,
          settlement_date: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      loadData();
    } catch (error) {
      console.error("Error processing settlement:", error);
    }
  };

  const getUserInfo = (userId) => {
    const user = users.find(u => u.id === userId);
    return user || { full_name: "Unknown User", email: "" };
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      collected: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getCommissionStatusColor = (status) => {
    const colors = {
      calculated: "bg-blue-100 text-blue-800",
      deducted: "bg-yellow-100 text-yellow-800",
      settled: "bg-green-100 text-green-800",
      disputed: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const exportReport = (type) => {
    const data = type === "payments" ? payments : commissions;
    const headers = type === "payments" 
      ? ["Payment ID", "Order ID", "Amount", "Status", "Date"]
      : ["User", "Transaction Type", "Gross Amount", "Commission", "Net Amount", "Status", "Date"];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (type === "payments") {
          return [
            item.payment_id,
            item.order_id,
            item.amount,
            item.payment_status,
            format(new Date(item.created_date), "yyyy-MM-dd")
          ].join(',');
        } else {
          const user = getUserInfo(item.user_id);
          return [
            user.full_name,
            item.transaction_type,
            item.gross_amount,
            item.commission_amount,
            item.net_amount,
            item.status,
            format(new Date(item.created_date), "yyyy-MM-dd")
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.order_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCommissions = commissions.filter(commission => {
    const user = getUserInfo(commission.user_id);
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.transaction_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Payments & Settlement</h1>
          <p className="text-slate-600 mt-1">Manage payments, commissions, and settlements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Payments</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.totalPayments.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Commissions</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.totalCommissions.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-slate-500">Pending Settlements</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingSettlements}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search payments..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="collected">Collected</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => exportReport("payments")}
                    className="bg-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="bg-white"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payments List */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Payment ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {payment.payment_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {payment.order_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            ₹{payment.amount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {payment.payment_method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${getPaymentStatusColor(payment.payment_status)} border-0`}>
                              {payment.payment_status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {format(new Date(payment.created_date), "MMM d, yyyy")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search commissions..."
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
                      <SelectItem value="calculated">Calculated</SelectItem>
                      <SelectItem value="deducted">Deducted</SelectItem>
                      <SelectItem value="settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => exportReport("commissions")}
                    className="bg-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="bg-white"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Commissions List */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Transaction Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Gross Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Commission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Net Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredCommissions.map((commission) => {
                        const user = getUserInfo(commission.user_id);
                        return (
                          <tr key={commission.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {user.full_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {commission.transaction_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              ₹{commission.gross_amount?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                              -₹{commission.commission_amount?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              ₹{commission.net_amount?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`${getCommissionStatusColor(commission.status)} border-0`}>
                                {commission.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {format(new Date(commission.created_date), "MMM d, yyyy")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settlements" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Pending Settlements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-600">
                    Process settlements for calculated commissions. This will mark them as settled and generate settlement reports.
                  </p>
                  <Button
                    onClick={() => {
                      const pendingCommissions = commissions
                        .filter(c => c.status === "calculated")
                        .map(c => c.id);
                      if (pendingCommissions.length > 0) {
                        processSettlement(pendingCommissions);
                      }
                    }}
                    disabled={commissions.filter(c => c.status === "calculated").length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Banknote className="w-4 h-4 mr-2" />
                    Process All Settlements ({commissions.filter(c => c.status === "calculated").length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}