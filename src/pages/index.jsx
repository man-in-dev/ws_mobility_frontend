import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import BookService from "./BookService";

import MyVehicles from "./MyVehicles";

import ServiceHistory from "./ServiceHistory";

import Insurance from "./Insurance";

import ServiceRequests from "./ServiceRequests";

import InventoryManagement from "./InventoryManagement";

import OrderParts from "./OrderParts";

import MyOrders from "./MyOrders";

import MyServices from "./MyServices";

import UserManagement from "./UserManagement";

import PaymentSettlement from "./PaymentSettlement";

import InsuranceLeads from "./InsuranceLeads";

import MyPayments from "./MyPayments";

import MyInsuranceLeads from "./MyInsuranceLeads";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

const PAGES = {
  Dashboard: Dashboard,

  BookService: BookService,

  MyVehicles: MyVehicles,

  ServiceHistory: ServiceHistory,

  Insurance: Insurance,

  ServiceRequests: ServiceRequests,

  InventoryManagement: InventoryManagement,

  OrderParts: OrderParts,

  MyOrders: MyOrders,

  MyServices: MyServices,

  UserManagement: UserManagement,

  PaymentSettlement: PaymentSettlement,

  InsuranceLeads: InsuranceLeads,

  MyPayments: MyPayments,

  MyInsuranceLeads: MyInsuranceLeads,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/Dashboard" element={<Dashboard />} />

        <Route path="/BookService" element={<BookService />} />

        <Route path="/MyVehicles" element={<MyVehicles />} />

        <Route path="/ServiceHistory" element={<ServiceHistory />} />

        <Route path="/Insurance" element={<Insurance />} />

        <Route path="/ServiceRequests" element={<ServiceRequests />} />

        <Route path="/InventoryManagement" element={<InventoryManagement />} />

        <Route path="/OrderParts" element={<OrderParts />} />

        <Route path="/MyOrders" element={<MyOrders />} />

        <Route path="/MyServices" element={<MyServices />} />

        <Route path="/UserManagement" element={<UserManagement />} />

        <Route path="/PaymentSettlement" element={<PaymentSettlement />} />

        <Route path="/InsuranceLeads" element={<InsuranceLeads />} />

        <Route path="/MyPayments" element={<MyPayments />} />

        <Route path="/MyInsuranceLeads" element={<MyInsuranceLeads />} />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
