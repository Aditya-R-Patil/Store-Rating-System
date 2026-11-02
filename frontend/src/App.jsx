
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageStores from "./pages/admin/ManageStores";
import AddUser from "./pages/admin/AddUser";
import AddStore from "./pages/admin/AddStore";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import MyRatings from "./pages/user/MyRatings";
import ChangePassword from "./pages/user/ChangePassword";

// Store Owner Pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import MyStore from "./pages/owner/MyStore";
import OwnerRatings from "./pages/owner/OwnerRatings";
import OwnerChangePassword from "./pages/owner/ChangePassword";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/users/new" element={<AddUser />} />
        <Route path="/admin/stores" element={<ManageStores />} />
        <Route path="/admin/stores/new" element={<AddStore />} />

        {/* User Routes */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/ratings" element={<MyRatings />} />
        <Route path="/user/change-password" element={<ChangePassword />} />

        {/* Store Owner Routes */}
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/store" element={<MyStore />} />
        <Route path="/owner/ratings" element={<OwnerRatings />} />
        <Route
          path="/owner/change-password"
          element={<OwnerChangePassword />}
        />

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
