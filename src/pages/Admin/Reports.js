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
  Download,
  TrendingUp,
  PieChart as PieChartIcon,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState(() => {
    const initial = {};
    const path = window.location.pathname;
    if (path.startsWith("/admin/reports")) initial.Reports = true;
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [reportType, setReportType] = useState("attendance");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  
  // Attendance summary data
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [departmentWise, setDepartmentWise] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch attendance summary
  const fetchAttendanceSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/reports/attendance-summary?start=${dateRange.startDate}&end=${dateRange.endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch attendance summary");
      const data = await res.json();
      setAttendanceSummary(data.summary || []);
      setAttendanceTrend(data.trend || []);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave summary
  const fetchLeaveSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/admin/reports/leave-summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch leave summary");
      const data = await res.json();
      setLeaveSummary(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch department-wise stats
  const fetchDepartmentStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/admin/reports/department-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch department stats");
      const data = await res.json();
      setDepartmentWise(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else {
      fetchAttendanceSummary();
      fetchLeaveSummary();
      fetchDepartmentStats();
    }
  }, [dateRange]);

  // Keep Reports submenu open
  useEffect(() => {
    if (location.pathname.startsWith("/admin/reports")) {
      setOpenSubmenus((prev) => ({ ...prev, Reports: true }));
    }
  }, [location.pathname]);

  // Sidebar logic
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
        { name: "Leave Policy", icon: <Settings size={16} />, path: "/admin/leave/leavepolicy" },
      ],
    },
    {
      name: "Reports",
      icon: <Activity size={20} />,
      path: "#",
      submenu: [
        { name: "Reports Dashboard", icon: <BarChart3 size={16} />, path: "/admin/reports" },
      ],
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

  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => JSON.stringify(row[h] || "")).join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#EF4444"];

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
                            (item.name === "Reports" && location.pathname.startsWith("/admin/reports"))
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
                <h1 className="text-3xl md:text-4xl font-bold text-white">Reports Dashboard</h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
                <p className="text-white/50 mt-2">View comprehensive attendance and leave analytics</p>
              </div>
              <div className="flex gap-3">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={() => exportCSV(attendanceSummary, `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-xl transition-all"
                >
                  <Download size={18} />
                  Export CSV
                </button>
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
                    message.type === "success"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                  } backdrop-blur-md border border-white/10`}
                >
                  {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm">Total Employees</p>
                    <p className="text-3xl font-bold mt-2">{attendanceSummary.length || 0}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Users size={28} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm">Avg. Attendance %</p>
                    <p className="text-3xl font-bold mt-2">
                      {attendanceSummary.length
                        ? Math.round(attendanceSummary.reduce((acc, d) => acc + (d.present_percent || 0), 0) / attendanceSummary.length)
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <TrendingUp size={28} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm">Pending Leaves</p>
                    <p className="text-3xl font-bold mt-2">{leaveSummary.pending || 0}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Clock size={28} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl shadow-xl text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm">Total Leave Days (MTD)</p>
                    <p className="text-3xl font-bold mt-2">
                      {attendanceSummary.reduce((acc, d) => acc + (d.absent_days || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <CalendarDays size={28} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Trend */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-amber-400" size={24} />
                  <h2 className="text-xl font-semibold text-white">Attendance Trend</h2>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="date" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px" }} />
                      <Line type="monotone" dataKey="present_count" stroke="#F59E0B" strokeWidth={3} dot={{ fill: "#F59E0B" }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Leave Status Pie */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="text-green-400" size={24} />
                  <h2 className="text-xl font-semibold text-white">Leave Status Distribution</h2>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Pending", value: leaveSummary.pending || 0, color: "#F59E0B" },
                          { name: "Approved", value: leaveSummary.approved || 0, color: "#10B981" },
                          { name: "Rejected", value: leaveSummary.rejected || 0, color: "#EF4444" },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {[
                          { name: "Pending", value: leaveSummary.pending || 0, color: "#F59E0B" },
                          { name: "Approved", value: leaveSummary.approved || 0, color: "#10B981" },
                          { name: "Rejected", value: leaveSummary.rejected || 0, color: "#EF4444" },
                        ].map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Department-wise Attendance */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-purple-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Department-wise Attendance</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={departmentWise}>
                    <XAxis dataKey="department" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px" }} />
                    <Bar dataKey="present_percent" fill="#F59E0B" radius={[8, 8, 0, 0]} name="Present %" />
                    <Bar dataKey="absent_percent" fill="#EF4444" radius={[8, 8, 0, 0]} name="Absent %" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Reports;