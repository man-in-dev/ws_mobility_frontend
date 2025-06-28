import React, { useState, useEffect } from "react";
import { InsuranceLead, Vehicle, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, User as UserIcon, Phone, Edit, Plus } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function MyInsuranceLeads() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState({});
  const [vehicles, setVehicles] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Get all leads, vehicles, and users for demo purposes
      const [allLeads, allUsers, allVehicles] = await Promise.all([
        InsuranceLead.list("-created_date"),
        User.list(),
        Vehicle.list(),
      ]);

      // Show all leads as demo data
      setLeads(allLeads);

      console.log(allUsers);

      const usersById = allUsers.reduce(
        (acc, u) => ({ ...acc, [u.id]: u }),
        {}
      );
      setCustomers(usersById);

      const vehiclesById = allVehicles.reduce(
        (acc, v) => ({ ...acc, [v.id]: v }),
        {}
      );
      setVehicles(vehiclesById);
    } catch (error) {
      console.error("Error loading leads:", error);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-yellow-100 text-yellow-800",
      contacted: "bg-blue-100 text-blue-800",
      quoted: "bg-purple-100 text-purple-800",
      converted: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getParsedValue = (value) => {
    try {
      const cleaned = value.replace(/""/g, '"');
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Invalid value JSON:", error);
      return {};
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your insurance leads...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">
              My Insurance Leads
            </h1>
            <p className="text-slate-600 mt-1">
              View insurance leads you've generated
            </p>
          </div>
          <Link to={createPageUrl("Insurance")}>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Lead
            </Button>
          </Link>
        </div>

        {leads.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Leads Found
              </h3>
              <p className="text-slate-600">
                You have not generated any insurance leads yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {leads.map((lead) => {
              const customer = customers[lead.customer_id] || {
                full_name: "Sample Customer",
                phone: "+91 98765 43210",
              };
              const vehicle = vehicles[lead.vehicle_id] || {
                make: "Maruti Suzuki",
                model: "Swift",
                registration_number: "MH-01-AB-1234",
              };

              return (
                <Card
                  key={lead.id}
                  className="bg-white/80 backdrop-blur-sm shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">
                          {lead.lead_type
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h3>
                        <p className="text-slate-600 mb-2">
                          {vehicle.make} {vehicle.model} (
                          {vehicle.registration_number})
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusColor(lead.status)} border-0`}
                      >
                        {lead.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                        <UserIcon className="w-4 h-4 mt-1 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-800">Customer</p>
                          <p className="text-slate-600">{customer.full_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                        <Phone className="w-4 h-4 mt-1 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-800">Contact</p>
                          <p className="text-slate-600">{customer.phone}</p>
                        </div>
                      </div>
                    </div>
                    {lead.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Notes:</strong> {lead.notes}
                        </p>
                      </div>
                    )}

                    {lead.quotes_provided &&
                      lead.quotes_provided.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4 mt-4">
                          <h4 className="font-semibold text-slate-900 mb-3">
                            Quotes Provided:
                          </h4>
                          <div className="space-y-3">
                            {getParsedValue(lead.quotes_provided[0]).map(
                              (quote, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center bg-white rounded-lg p-3"
                                >
                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {quote.insurer}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      {quote.coverage}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-slate-900">
                                      ₹{quote.premium?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      Valid till{" "}
                                      {format(
                                        new Date(quote.validity),
                                        "MMM d"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {lead.converted_policy && (
                      <div className="bg-green-50 rounded-lg p-4 mt-4">
                        <h4 className="font-semibold text-green-800 mb-2">
                          ✓ Policy Converted
                        </h4>
                        <div className="text-sm text-green-700">
                          <p>
                            Policy:{" "}
                            {
                              getParsedValue(lead.converted_policy)
                                .policy_number
                            }
                          </p>
                          <p>
                            Insurer:{" "}
                            {getParsedValue(lead.converted_policy).insurer}
                          </p>
                          <p>
                            Premium: ₹
                            {getParsedValue(
                              lead.converted_policy
                            ).premium.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
