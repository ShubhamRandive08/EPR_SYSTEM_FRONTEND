import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Shield, XCircle, Menu, X, LayoutDashboard, User,
  CalendarDays, FileText, CheckCircle, Users, ChevronDown, ChevronRight,
  LogOut, Clock, Award, TrendingUp, HelpCircle, MapPin, Calendar,
  List, PlusCircle
} from "lucide-react";
import imageLogo from "../../Image/SGD.jpg";

const EmployeeDashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPresent: 0,
    leavesTaken: 0,
    pendingRequests: 0,
    attendanceRate: 0,
  });
  const navigate = useNavigate();

  // Password change modal
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordMessage, setChangePasswordMessage] = useState("");

  // Assistant modal
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [selectedHelpTopic, setSelectedHelpTopic] = useState(null);
  const helpTopics = [
    {
      id: "applyLeave",
      title: "📋 How to Apply for Leave",
      steps: [
        "1️⃣ Go to the sidebar and expand 'My Links'.",
        "2️⃣ Click on 'Leave Application'.",
        "3️⃣ Fill in the leave type, start date, end date, and reason.",
        "4️⃣ Click 'Submit' – your request will be sent for approval.",
        "5️⃣ Track status under 'Pending Requests' on the dashboard."
      ]
    },
    {
      id: "markAttendance",
      title: "✅ How to Mark Attendance",
      steps: [
        "1️⃣ From the sidebar, expand 'My Links'.",
        "2️⃣ Click on 'My Attendance'.",
        "3️⃣ On the attendance page, select the current date.",
        "4️⃣ Click 'Mark Present' or 'Check In' (if implemented).",
        "5️⃣ Your total present days will update on the dashboard."
      ]
    },
    {
      id: "checkAttendance",
      title: "📅 How to View Attendance Summary",
      steps: [
        "1️⃣ Navigate to 'My Links' → 'My Attendance'.",
        "2️⃣ Use the month/year filter to view past records.",
        "3️⃣ The dashboard also shows 'Total Present (Month)' and 'Attendance Rate'."
      ]
    },
    {
      id: "changePassword",
      title: "🔐 How to Change Password",
      steps: [
        "1️⃣ Click on your profile avatar (top‑right corner).",
        "2️⃣ Select 'Change Password' from the dropdown.",
        "3️⃣ Enter your current password and the new password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special).",
        "4️⃣ Confirm the new password and click 'Change Password'."
      ]
    },
    {
      id: "viewProfile",
      title: "👤 How to View / Edit My Profile",
      steps: [
        "1️⃣ Click on your profile avatar → 'My Profile'.",
        "2️⃣ You can see your employee ID, full name, email, and department.",
        "3️⃣ To update details, contact HR or use the edit option (if enabled)."
      ]
    },
    {
      id: "leaveAcceptance",
      title: "✔️ How to Accept Leave (For Approvers)",
      steps: [
        "1️⃣ Expand 'Approvals' in the sidebar.",
        "2️⃣ Click 'Leave Acceptance'.",
        "3️⃣ Review pending leave requests and click 'Approve' or 'Reject'."
      ]
    }
  ];

  // Site Visit state
  const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
  const [activeSiteVisitTab, setActiveSiteVisitTab] = useState("today");
  const [todayVisits, setTodayVisits] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [todayVisitCount, setTodayVisitCount] = useState(0);
  const [siteVisitForm, setSiteVisitForm] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    scheduled_time: "10:00",
    customer_name: "",
    customer_phone: "",
    pickup_point: "",
    persons: 1,
    location: "",
    description: "",
  });
  const [siteVisitMessage, setSiteVisitMessage] = useState({ type: "", text: "" });
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Helper: get current month/year
  const getCurrentMonthYear = () => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const { month, year } = getCurrentMonthYear();

      const presentRes = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/employee/attendance/summary?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let presentDays = 0, totalDays = 0, attendanceRate = 0;
      if (presentRes.ok) {
        const data = await presentRes.json();
        presentDays = data.presentDays || 0;
        totalDays = data.totalWorkingDays || 0;
        attendanceRate = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;
      }

      const leavesRes = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/employee/leaves?status=Approved&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let leavesTaken = 0;
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        leavesTaken = leavesData.length || 0;
      }

      const pendingRes = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/employee/leaves?status=Pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let pendingRequests = 0;
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        pendingRequests = pendingData.length || 0;
      }

      setStats({ totalPresent: presentDays, leavesTaken, pendingRequests, attendanceRate });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  // Site Visit API calls
  const fetchTodayVisitCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://erp-system-backend-mwmp.onrender.com/api/employee/site-visit/today/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTodayVisitCount(data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching today's visit count:", err);
    }
  };

  const fetchTodayVisits = async () => {
    setLoadingVisits(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://erp-system-backend-mwmp.onrender.com/api/employee/site-visit/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTodayVisits(data);
      }
    } catch (err) {
      console.error("Error fetching today's visits:", err);
    } finally {
      setLoadingVisits(false);
    }
  };

  const fetchUpcomingVisits = async () => {
    setLoadingVisits(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://erp-system-backend-mwmp.onrender.com/api/employee/site-visit/upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUpcomingVisits(data);
      }
    } catch (err) {
      console.error("Error fetching upcoming visits:", err);
    } finally {
      setLoadingVisits(false);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    setSiteVisitMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://erp-system-backend-mwmp.onrender.com/api/employee/site-visit/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteVisitForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to schedule");
      setSiteVisitMessage({ type: "success", text: "Site visit scheduled successfully!" });
      setTimeout(() => setSiteVisitMessage({ type: "", text: "" }), 3000);
      // Reset form
      setSiteVisitForm({
        visit_date: new Date().toISOString().split('T')[0],
        scheduled_time: "10:00",
        customer_name: "",
        customer_phone: "",
        pickup_point: "",
        persons: 1,
        location: "",
        description: "",
      });
      // Refresh counts and lists
      fetchTodayVisitCount();
      if (activeSiteVisitTab === "upcoming") fetchUpcomingVisits();
      if (activeSiteVisitTab === "today") fetchTodayVisits();
    } catch (err) {
      setSiteVisitMessage({ type: "error", text: err.message });
    }
  };

  const updateVisitStatus = async (id, newStatus) => {
    setStatusUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://erp-system-backend-mwmp.onrender.com/api/employee/site-visit/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      // Refresh lists
      fetchTodayVisits();
      fetchUpcomingVisits();
      fetchTodayVisitCount();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const deleteVisit = async (id) => {
    if (!window.confirm("Are you sure you want to delete this site visit?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://erp-system-backend-mwmp.onrender.com/api/employee/site-visit/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchTodayVisits();
      fetchUpcomingVisits();
      fetchTodayVisitCount();
      alert("Visit deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/employee/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch user");
        setUser(data);
      } catch (err) {
        setError(err.message || "API not working. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    fetchDashboardStats();
    fetchTodayVisitCount();
  }, []);

  // Change password functions
  const validatePassword = (password) => {
    const errors = {};
    if (password.length < 8) errors.length = "At least 8 characters";
    if (!/[A-Z]/.test(password)) errors.upper = "One uppercase letter";
    if (!/[a-z]/.test(password)) errors.lower = "One lowercase letter";
    if (!/[0-9]/.test(password)) errors.number = "One number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.special = "One special character";
    return errors;
  };

  const handleChangePassword = async () => {
    const errors = validatePassword(passwordData.newPassword);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirm: "Passwords do not match" });
      return;
    }

    setChangePasswordLoading(true);
    setChangePasswordMessage("");
    setPasswordErrors({});

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/employee/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setChangePasswordMessage("✅ Password changed successfully!");
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setChangePasswordMessage("");
      }, 2000);
    } catch (err) {
      setChangePasswordMessage(`❌ ${err.message}`);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    navigate("/login", { replace: true });
  };

  // Sidebar sections
  const sections = {
    Dashboard: { isSingle: true, items: ["Dashboard"], icon: <LayoutDashboard size={18} /> },
    "My Links": { icon: <User size={18} />, items: ["My Profile", "My Attendance", "Leave Application"] },
    Approvals: { icon: <CheckCircle size={18} />, items: ["Leave Acceptance"] },
    "Committee / Panels": { icon: <Users size={18} />, items: ["Committee List", "Panel Members"] },
  };

  const handleItemClick = (section, item) => {
    if (item === "Dashboard") return;
    else if (item === "My Profile") navigate("/my-profile");
    else if (item === "My Attendance") navigate("/my-attendance");
    else if (item === "Leave Application") navigate("/leave-application");
    else if (item === "Leave Acceptance") navigate("/leave-acceptance");
    else if (item === "Committee List") navigate("/committee-list");
    else if (item === "Panel Members") navigate("/panel-members");
    else alert(`${item} page will be implemented soon.`);

    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const toggleSection = (section) => {
    if (sections[section].isSingle) {
      handleItemClick(section, "Dashboard");
      setExpandedSection(null);
    } else {
      setExpandedSection(expandedSection === section ? null : section);
    }
  };

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openSiteVisitModal = (tab) => {
    setActiveSiteVisitTab(tab);
    if (tab === "today") fetchTodayVisits();
    if (tab === "upcoming") fetchUpcomingVisits();
    setShowSiteVisitModal(true);
  };

  const dashboardCards = [
    { title: "My Attendance", icon: <CalendarDays size={28} />, color: "from-blue-500 to-indigo-600", path: "/my-attendance" },
    { title: "Leave Application", icon: <FileText size={28} />, color: "from-amber-500 to-orange-600", path: "/leave-application" },
    { title: "Grievances", icon: <Award size={28} />, color: "from-rose-500 to-pink-600", path: "#" },
    { title: "My Profile", icon: <User size={28} />, color: "from-green-500 to-emerald-600", path: "/my-profile" },
    { title: "Assistant", icon: <HelpCircle size={28} />, color: "from-purple-500 to-indigo-600", path: "assistant" },
    { title: "Site Visit", icon: <MapPin size={28} />, color: "from-cyan-500 to-blue-600", path: "site-visit" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">Employee Portal</h1>
        <button onClick={() => setSidebarOpen(true)} className="text-white p-2"><Menu size={28} /></button>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white/10 backdrop-blur-2xl border-r border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}>
        <div className="flex justify-between items-center p-5 border-b border-white/20">
          <div className="flex items-center gap-2">
            <img src={imageLogo} alt="Logo" className="w-10 h-10 rounded-full" />
            <h2 className="text-lg font-bold text-white">श्री घनोबा डेव्हलपर्स</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/70 hover:text-white md:hidden"><X size={24} /></button>
        </div>
        <div className="p-5 border-b border-white/20 text-center space-y-3 relative">
          <div className="relative flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 hover:border-amber-400/50 transition-all">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-white/60 text-xs font-medium">User ID</span>
            </div>
            <span className="text-amber-300 text-sm font-mono font-semibold">{user?.id || "-"}</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {Object.keys(sections).map((section) => (
            <div key={section}>
              {sections[section].isSingle ? (
                <button onClick={() => toggleSection(section)} className="w-full flex items-center gap-3 p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all">
                  {sections[section].icon}<span>{section}</span>
                </button>
              ) : (
                <>
                  <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">{sections[section].icon}<span>{section}</span></div>
                    {expandedSection === section ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === section && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="ml-9 mt-1 space-y-1">
                        {sections[section].items.map((item) => (
                          <button key={item} onClick={() => handleItemClick(section, item)} className="flex items-center gap-2 p-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all w-full">
                            <span>{item}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all">
            <LogOut size={20} /><span>Logout</span>
          </button>
          <p className="text-center text-white/40 text-xs mt-3">v1.0</p>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "md:ml-72" : ""}`}>
        <main className="p-4 md:p-8 pt-20 md:pt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Welcome, {user?.full_name || "Employee"} 👋</h1>
                <p className="text-white/50 mt-1">Here's your work summary</p>
              </div>
              <div className="relative flex items-center gap-3">
                <button
                  onClick={() => openSiteVisitModal("today")}
                  className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-full text-sm transition-all"
                >
                  <MapPin size={16} />
                  <span className="hidden sm:inline">Site Visit</span>
                  <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                    {todayVisitCount}
                  </span>
                </button>
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">{user?.full_name?.charAt(0) || "E"}</div>
                    <span className="text-white text-sm hidden sm:inline">{user?.full_name || "Employee"}</span>
                    <ChevronDown size={16} className="text-white/70" />
                  </button>
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 z-50">
                        <button onClick={() => { navigate("/my-profile"); setShowProfileMenu(false); }} className="block w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-t-xl">My Profile</button>
                        <button onClick={() => setShowChangePasswordModal(true)} className="block w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-b-xl">Change Password</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {error && <div className="bg-red-500/20 backdrop-blur-sm border-l-4 border-red-400 text-red-200 p-3 rounded-xl text-sm">{error}</div>}

            {loading ? (
              <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div></div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/20 rounded-full"><Clock className="text-amber-400" size={24} /></div>
                      <div><p className="text-white/60 text-sm">Total Present (Month)</p><p className="text-2xl font-bold text-white">{stats.totalPresent}</p></div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-500/20 rounded-full"><FileText className="text-green-400" size={24} /></div>
                      <div><p className="text-white/60 text-sm">Leaves Taken</p><p className="text-2xl font-bold text-white">{stats.leavesTaken}</p></div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/20 rounded-full"><CalendarDays className="text-blue-400" size={24} /></div>
                      <div><p className="text-white/60 text-sm">Pending Requests</p><p className="text-2xl font-bold text-white">{stats.pendingRequests}</p></div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/20 rounded-full"><TrendingUp className="text-purple-400" size={24} /></div>
                      <div><p className="text-white/60 text-sm">Attendance Rate</p><p className="text-2xl font-bold text-white">{stats.attendanceRate}%</p></div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Cards */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardCards.map((card, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02, y: -5 }}
                        onClick={() => {
                          if (card.path === "assistant") {
                            setShowAssistantModal(true);
                          } else if (card.path === "site-visit") {
                            openSiteVisitModal("schedule");
                          } else if (card.path !== "#") {
                            navigate(card.path);
                          } else {
                            alert(`${card.title} coming soon`);
                          }
                        }}
                        className={`bg-gradient-to-br ${card.color} p-6 rounded-2xl shadow-xl text-white cursor-pointer transition-all duration-300`}
                      >
                        <div className="flex justify-between items-start">
                          <div><p className="text-white/80 text-sm">{card.title}</p><p className="text-xs text-white/60 mt-1">Click to access</p></div>
                          <div className="bg-white/20 p-3 rounded-full">{card.icon}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </main>
      </div>

      {/* Assistant Modal */}
      <AnimatePresence>
        {showAssistantModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl w-full max-w-2xl p-6 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="text-amber-400" /> Assistant
                </h2>
                <button onClick={() => { setShowAssistantModal(false); setSelectedHelpTopic(null); }} className="text-white/70 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {!selectedHelpTopic ? (
                <div className="space-y-3">
                  <p className="text-white/70 mb-4">Select a topic to see step‑by‑step instructions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {helpTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedHelpTopic(topic)}
                        className="text-left p-4 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all"
                      >
                        <div className="font-semibold text-white">{topic.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedHelpTopic(null)} className="mb-4 text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm">← Back to topics</button>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-3">{selectedHelpTopic.title}</h3>
                    <div className="space-y-2 text-white/80">
                      {selectedHelpTopic.steps.map((step, idx) => (
                        <p key={idx} className="leading-relaxed">{step}</p>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10 text-white/50 text-sm">💡 Tip: Use the sidebar navigation to access the features mentioned above.</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl w-full max-w-md p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="text-amber-400" /> Change Password</h2>
                <button onClick={() => setShowChangePasswordModal(false)} className="text-white/70 hover:text-white"><X size={24} /></button>
              </div>
              <div className="mb-4">
                <label className="block text-white/80 text-sm mb-1">Current Password</label>
                <div className="relative">
                  <input type={showCurrentPassword ? "text" : "password"} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white pr-10" placeholder="Enter current password" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-2.5 text-white/60">{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white/80 text-sm mb-1">New Password</label>
                <div className="relative">
                  <input type={showNewPassword ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => { setPasswordData({ ...passwordData, newPassword: e.target.value }); setPasswordErrors(validatePassword(e.target.value)); }} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white pr-10" placeholder="Min 8 chars, 1 upper, 1 lower, 1 number, 1 special" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-2.5 text-white/60">{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {Object.keys(passwordErrors).length > 0 && <div className="mt-2 text-xs text-red-300 space-y-1">{Object.values(passwordErrors).map((err, i) => <div key={i} className="flex items-center gap-1"><XCircle size={12} /> {err}</div>)}</div>}
              </div>
              <div className="mb-4">
                <label className="block text-white/80 text-sm mb-1">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white pr-10" placeholder="Re-enter new password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-white/60">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && <p className="text-red-300 text-xs mt-1">Passwords do not match</p>}
              </div>
              {changePasswordMessage && <div className={`mb-4 p-2 rounded text-center ${changePasswordMessage.includes("✅") ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>{changePasswordMessage}</div>}
              <button onClick={handleChangePassword} disabled={changePasswordLoading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2 rounded-xl transition-all disabled:opacity-50">{changePasswordLoading ? "Changing..." : "Change Password"}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Site Visit Modal (updated with employee name, phone, edit buttons, green status) */}
      <AnimatePresence>
        {showSiteVisitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl flex flex-col"
            >
              {/* Modal header with tabs */}
              <div className="flex justify-between items-center p-3 border-b border-white/20">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setActiveSiteVisitTab("today"); fetchTodayVisits(); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeSiteVisitTab === "today" ? "bg-amber-500/20 text-amber-300" : "text-white/60 hover:text-white"}`}
                  >
                    <Calendar size={18} /> Today's Visits
                  </button>
                  <button
                    onClick={() => setActiveSiteVisitTab("schedule")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeSiteVisitTab === "schedule" ? "bg-amber-500/20 text-amber-300" : "text-white/60 hover:text-white"}`}
                  >
                    <PlusCircle size={18} /> Schedule Visit
                  </button>
                  <button
                    onClick={() => { setActiveSiteVisitTab("upcoming"); fetchUpcomingVisits(); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeSiteVisitTab === "upcoming" ? "bg-amber-500/20 text-amber-300" : "text-white/60 hover:text-white"}`}
                  >
                    <List size={18} /> Upcoming Visits
                  </button>
                </div>
                <button onClick={() => setShowSiteVisitModal(false)} className="text-white/70 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                {activeSiteVisitTab === "today" && (
                  <div>
                    {loadingVisits ? (
                      <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div></div>
                    ) : todayVisits.length === 0 ? (
                      <p className="text-white/50 text-center py-8">No site visits scheduled for today.</p>
                    ) : (
                      <div className="space-y-3">
                        {todayVisits.map((visit) => (
                          <div key={visit.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-white font-medium">
                                  {visit.customer_name} – {visit.location}
                                </p>
                                <p className="text-white/60 text-sm">
                                  Scheduled by: {visit.employee_name || "Unknown"} 
                                </p>
                                <p className="text-white/60 text-sm">
                                  Time: {visit.scheduled_time} | Pickup: {visit.pickup_point} | Persons: {visit.persons}
                                </p>
                                {visit.description && (
                                  <p className="text-white/40 text-xs mt-1">Description: {visit.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2 items-center">
                                <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300">
                                  {visit.status}
                                </span>
                                <button 
                                  onClick={() => updateVisitStatus(visit.id, "Completed")}
                                  disabled={statusUpdating}
                                  className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition"
                                >
                                  Complete
                                </button>
                                <button 
                                  onClick={() => updateVisitStatus(visit.id, "Cancelled")}
                                  disabled={statusUpdating}
                                  className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition"
                                >
                                  Cancel
                                </button>
                                <button onClick={() => deleteVisit(visit.id)} className="text-red-400 hover:text-red-300 transition" title="Delete">
                                  <XCircle size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSiteVisitTab === "schedule" && (
                  <form onSubmit={handleScheduleVisit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-white/80 text-sm mb-1">Visit Date</label>
                        <input type="date" value={siteVisitForm.visit_date} onChange={(e) => setSiteVisitForm({ ...siteVisitForm, visit_date: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" required />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">Scheduled Time</label>
                        <input type="time" value={siteVisitForm.scheduled_time} onChange={(e) => setSiteVisitForm({ ...siteVisitForm, scheduled_time: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-white/80 text-sm mb-1">Customer Name</label>
                        <input type="text" placeholder="Enter customer name" value={siteVisitForm.customer_name} onChange={(e) => setSiteVisitForm({ ...siteVisitForm, customer_name: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" required />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">Customer Phone</label>
                        <input type="tel" placeholder="Customer contact number" value={siteVisitForm.customer_phone} onChange={(e) => setSiteVisitForm({ ...siteVisitForm, customer_phone: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">Pickup Point</label>
                      <input type="text" placeholder="Enter pickup location" value={siteVisitForm.pickup_point} onChange={(e) => setSiteVisitForm({ ...siteVisitForm, pickup_point: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-white/80 text-sm mb-1">Number of Persons</label>
                        <input type="number" min="1" value={siteVisitForm.persons} onChange={(e) => setSiteVisitForm({ ...siteVisitForm, persons: parseInt(e.target.value) || 1 })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" required />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">Location</label>
                        <input type="text" placeholder="Site address" value={siteVisitForm.location} onChange={(e) => setSiteVisitForm({ ...siteVisitForm, location: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">Description</label>
                      <textarea rows="2" placeholder="Additional details about the visit" value={siteVisitForm.description} onChange={(e) => setSiteVisitForm({ ...siteVisitForm, description: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" />
                    </div>
                    {siteVisitMessage.text && (
                      <div className={`p-2 rounded text-center ${siteVisitMessage.type === "success" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                        {siteVisitMessage.text}
                      </div>
                    )}
                    <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-2 rounded-xl hover:shadow-lg transition-all">Schedule Visit</button>
                  </form>
                )}

                {activeSiteVisitTab === "upcoming" && (
                  <div>
                    {loadingVisits ? (
                      <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div></div>
                    ) : upcomingVisits.length === 0 ? (
                      <p className="text-white/50 text-center py-8">No upcoming site visits.</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingVisits.map((visit) => (
                          <div key={visit.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-white font-medium">
                                  {visit.customer_name} – {visit.location}
                                </p>
                                <p className="text-white/60 text-sm">
                                  Phone: {visit.customer_phone || "N/A"}
                                </p>
                                <p className="text-white/60 text-sm">
                                  Date: {visit.visit_date} | Time: {visit.scheduled_time}
                                </p>
                                <p className="text-white/60 text-sm">
                                  Pickup: {visit.pickup_point} | Persons: {visit.persons}
                                </p>
                                {visit.description && (
                                  <p className="text-white/40 text-xs mt-1">Description: {visit.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2 items-center">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => updateVisitStatus(visit.id, "Completed")}
                                    disabled={statusUpdating}
                                    className="px-3 py-1 text-xs bg-green-500/20 text-green-300 rounded-full hover:bg-green-500/30 transition"
                                  >
                                    Complete
                                  </button>
                                  <button 
                                    onClick={() => updateVisitStatus(visit.id, "Cancelled")}
                                    disabled={statusUpdating}
                                    className="px-3 py-1 text-xs bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                                <button onClick={() => deleteVisit(visit.id)} className="text-red-400 hover:text-red-300 transition" title="Delete">
                                  <XCircle size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeDashboard;