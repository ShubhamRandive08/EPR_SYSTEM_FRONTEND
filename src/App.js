import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import EmployeeDashboard from "./../src/pages/Employee/EmployeeDashboard";
import MyProfile from "./pages/Employee/MyProfile"; // <-- import the new page
import MyAttendance from "./pages/Employee/MyAttendance";
import LeaveApplication from "./pages/Employee/LeaveApplication";
import LeaveAcceptance from "./pages/Employee/LeaveAcceptance";
import CommitteeList from "./pages/Employee/CommitteeList";
import PanelMembers from "./pages/Employee/PanelMembers";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AllUsers from "./pages/Admin/AllUsers";
import AddUser from "./pages/Admin/AddUser"; // Inside your Routes
import DailyReport from "./pages/Admin/DailyReport";
import MonthlyReport from "./pages/Admin/MonthlyReport";
import PendingRequests from "./pages/Admin/PendingRequests";
import LeavePolicy from "./pages/Admin/LeavePolicy";
import Reports from "./pages/Admin/Reports";
import Settings from "./pages/Admin/Settings";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated") === "true";
    const role = localStorage.getItem("userRole");
    setIsAuthenticated(auth);
    setUserRole(role);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUserRole(localStorage.getItem("userRole"));
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate
                to={
                  userRole === "admin"
                    ? "/admin-dashboard"
                    : "/employee-dashboard"
                }
                replace
              />
            )
          }
        />
        <Route
          path="/employee-dashboard"
          element={
            isAuthenticated && userRole === "employee" ? (
              <EmployeeDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* NEW ROUTE for MyProfile */}
        <Route
          path="/my-profile"
          element={
            isAuthenticated ? <MyProfile /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/users"
          element={
            isAuthenticated ? <AllUsers /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/my-attendance"
          element={
            isAuthenticated ? (
              <MyAttendance />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route path="/admin/users/add" element={<AddUser />} />
        <Route path="/admin/attendance/daily" element={<DailyReport />} />
        <Route path="/admin/attendance/monthly" element={<MonthlyReport/>} />
        <Route path="/admin/leave/pendingleave" element={<PendingRequests/>} />
        <Route path="/admin/leave/leavepolicy" element={<LeavePolicy/>} />
        <Route path="/admin/reports" element={<Reports/>} />
        <Route path="/admin/settings" element={<Settings/>} />


        <Route
          path="/leave-application"
          element={
            isAuthenticated ? (
              <LeaveApplication />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/leave-acceptance"
          element={
            isAuthenticated ? (
              <LeaveAcceptance />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/committee-list"
          element={
            isAuthenticated ? (
              <CommitteeList />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/panel-members"
          element={
            isAuthenticated ? (
              <PanelMembers />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
