import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  UserPlus,
  Clock,
  CheckCircle,
  BarChart3,
  Activity,
  Search,
  Check,
  XCircle,
  AlertCircle,
} from "lucide-react";

const PendingRequests = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Initialize openSubmenus based on current path – Leaves submenu open if on /admin/leaves/*
  const [openSubmenus, setOpenSubmenus] = useState(() => {
    const initial = {};
    const path = window.location.pathname;
    if (path.startsWith("/admin/leaves")) initial.Leaves = true;
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch pending leave requests
  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/admin/leaves/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pending requests");
      const data = await res.json();
      setRequests(data);
      setFilteredRequests(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Approve request
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this leave request?")) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://erp-system-backend-mwmp.onrender.com/api/admin/leaves/${id}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Approved" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      setMessage({ type: "success", text: "Request approved successfully" });
      fetchPendingRequests();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Reject request
  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://erp-system-backend-mwmp.onrender.com/api/admin/leaves/${id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Rejected", reject_reason: reason || "" }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      setMessage({ type: "success", text: "Request rejected" });
      fetchPendingRequests();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchPendingRequests();
  }, []);

  // Keep Leaves submenu open when navigating within Leaves section
  useEffect(() => {
    if (location.pathname.startsWith("/admin/leaves")) {
      setOpenSubmenus((prev) => ({ ...prev, Leaves: true }));
    }
  }, [location.pathname]);

  // Search filter
  useEffect(() => {
    const filtered = requests.filter(
      (req) =>
        req.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leave_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  // Sidebar logic (responsive)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSubmenu = (name) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
      submenu: null,
    },
    {
      name: "Users",
      icon: <Users size={20} />,
      path: "#",
      submenu: [
        { name: "All Users", icon: <Users size={16} />, path: "/admin/users" },
        { name: "Add User", icon: <UserPlus size={16} />, path: "/admin/users/add" },
      ],
    },
    {
      name: "Attendance",
      icon: <CalendarDays size={20} />,
      path: "#",
      submenu: [
        { name: "Daily Report", icon: <Clock size={16} />, path: "/admin/attendance/daily" },
        { name: "Monthly Summary", icon: <BarChart3 size={16} />, path: "/admin/attendance/monthly" },
      ],
    },
    {
      name: "Leaves",
      icon: <FileText size={20} />,
      path: "#",
      submenu: [
        { name: "Pending Requests", icon: <CheckCircle size={16} />, path: "/admin/leave/pendingleave" },
        { name: "Leave Policy", icon: <Settings size={16} />, path: "/admin/leave/leavepolicy",},
      ],
    },
    {
      name: "Reports",
      icon: <Activity size={20} />,
      path: "/admin/reports",
      submenu: null,
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      path: "#",
      action: () => alert("Settings coming soon"),
      submenu: null,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
          🍽️ Admin Panel
        </h1>
        <button onClick={() => setSidebarOpen(true)} className="text-white p-2">
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 h-full w-72 bg-white/10 backdrop-blur-2xl border-r border-white/20 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex justify-between items-center p-5 border-b border-white/20">
                <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <div className="md:hidden">
                  <button onClick={() => setSidebarOpen(false)} className="text-white/70 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <div key={item.name}>
                    {item.submenu ? (
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.name)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                            (item.name === "Leaves" && location.pathname.startsWith("/admin/leaves")) ||
                            (item.name === "Attendance" && location.pathname.startsWith("/admin/attendance"))
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                          {openSubmenus[item.name] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        <AnimatePresence>
                          {openSubmenus[item.name] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-9 mt-1 space-y-1"
                            >
                              {item.submenu.map((sub) => (
                                <div key={sub.name}>
                                  {sub.path ? (
                                    <Link
                                      to={sub.path}
                                      onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                                      className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-all duration-200 ${
                                        location.pathname === sub.path
                                          ? "bg-amber-500/20 text-amber-300"
                                          : "text-white/60 hover:bg-white/5 hover:text-white"
                                      }`}
                                    >
                                      {sub.icon}
                                      <span>{sub.name}</span>
                                    </Link>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        if (sub.action) sub.action();
                                        if (window.innerWidth < 768) setSidebarOpen(false);
                                      }}
                                      className="flex items-center gap-2 p-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white w-full text-left"
                                    >
                                      {sub.icon}
                                      <span>{sub.name}</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                          location.pathname === item.path
                            ? "bg-amber-500/20 text-amber-300"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-white/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen && window.innerWidth >= 768 ? "md:ml-72" : ""
        }`}
      >
        <main className="p-4 md:p-8 pt-20 md:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Pending Leave Requests</h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
                <p className="text-white/50 mt-2">Approve or reject employee leave applications</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by employee, leave type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400 w-64"
                />
              </div>
            </div>

            {/* Toast message */}
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    message.type === "success" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                  } backdrop-blur-md border border-white/10`}
                >
                  {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center gap-2">
                <FileText className="text-amber-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Pending Applications</h2>
                <span className="ml-auto text-white/40 text-sm">{filteredRequests.length} requests</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gradient-to-r from-amber-500/20 to-orange-600/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-white font-semibold">Employee</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Leave Type</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">From Date</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">To Date</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Days</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Reason</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Address</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-white/50">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"></div>
                        </td>
                      </tr>
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-white/50">
                          No pending leave requests
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} className="border-t border-white/10 hover:bg-white/5 transition-all duration-200">
                          <td className="px-4 py-3 text-white font-medium">{req.employee_name}</td>
                          <td className="px-4 py-3 text-white/80">{req.leave_type}</td>
                          <td className="px-4 py-3 text-white/80">{req.from_date}</td>
                          <td className="px-4 py-3 text-white/80">{req.to_date}</td>
                          <td className="px-4 py-3 text-white/80">{req.total_days}</td>
                          <td className="px-4 py-3 text-white/80 max-w-xs truncate" title={req.reason}>
                            {req.reason || "-"}
                           </td>
                          <td className="px-4 py-3 text-white/80">{req.address || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(req.id)}
                                disabled={actionLoading}
                                className="p-1 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                disabled={actionLoading}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default PendingRequests;