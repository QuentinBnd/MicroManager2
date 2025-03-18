import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ToastContainer";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CreateCompany from "./pages/auth/CreateCompany";
import Dashboard from "./pages/Dashboard";
import ThemeSwitch from "./components/ThemeSwitch";
import Settings from "./pages/Settings";
import Clients from "./pages/client/Clients";
import AddClient from "./pages/client/AddClient";
import EditClient from "./pages/client/EditClient";
import Invoices from "./pages/invoice/Invoice";
import CreateInvoice from "./pages/invoice/CreateInvoice";
import EditInvoice from "./pages/invoice/EditInvoice";
import ViewInvoice from "./pages/invoice/ViewInvoice";
/* import RevenueTracking from "./pages/RevenueTracking";
 */import ContractList from "./pages/contract/Contract";
import AddContract from "./pages/contract/AddContract";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";


function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col justify-between bg-gray-100 dark:bg-gray-800">
        <Router>
          {/* Contenu principal */}
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-company" element={<CreateCompany />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/add-client" element={<AddClient />} />
              <Route path="/edit-client/:clientId" element={<EditClient />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/create-invoice" element={<CreateInvoice />} />
              <Route path="/edit-invoice/:invoiceId" element={<EditInvoice />} />
              <Route path="/view-invoice/:invoiceId" element={<ViewInvoice />} />
              {/*               <Route path="/revenue" element={<RevenueTracking />} />
 */}              <Route path="/contracts" element={<ContractList />} />
              <Route path="/add-contract" element={<AddContract />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
          </div>
        </Router>
      </div>
    </ToastProvider>
  );
}

export default App;