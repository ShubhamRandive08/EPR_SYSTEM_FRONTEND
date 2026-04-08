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
  Calendar,
  Download,
} from "lucide-react";

const DailyReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  ); // YYYY-MM-DD
  const [formattedDate, setFormattedDate] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // ---------- Helper: Convert YYYY-MM-DD to "DD Month YYYY" ----------
  // Helper: Convert YYYY-MM-DD to "DD Month YYYY" with leading zero for day
  const formatDateToDisplay = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0"); // "04" for day 4
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`; // e.g., "04 April 2026"
  };

  // ---------- Fetch daily report ----------
  const fetchDailyReport = async (date) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiDate = formatDateToDisplay(date); // "04 April 2026"
      setFormattedDate(apiDate);
      //  alert(encodeURIComponent(apiDate))
      //   alert("Hi")
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/attendance/daily?date=${encodeURIComponent(apiDate)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setAttendance(data);
      setFilteredAttendance(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchDailyReport(selectedDate);
  }, [selectedDate]);

  // ---------- Search filter ----------
  useEffect(() => {
    const filtered = attendance.filter(
      (record) =>
        record.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.department?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredAttendance(filtered);
  }, [searchTerm, attendance]);

  // ---------- Sidebar logic ----------
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

  // Auto-open Attendance submenu when on this page
  useEffect(() => {
    if (location.pathname.startsWith("/admin/attendance")) {
      setOpenSubmenus((prev) => ({ ...prev, Attendance: true }));
    }
  }, [location.pathname]);

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
        {
          name: "Add User",
          icon: <UserPlus size={16} />,
          path: "/admin/users/add",
        },
      ],
    },
    {
      name: "Attendance",
      icon: <CalendarDays size={20} />,
      path: "#",
      submenu: [
        {
          name: "Daily Report",
          icon: <Clock size={16} />,
          path: "/admin/attendance/daily",
        },
        {
          name: "Monthly Summary",
          icon: <BarChart3 size={16} />,
          path: "/admin/attendance/monthly",
        },
      ],
    },
    {
      name: "Leaves",
      icon: <FileText size={20} />,
      path: "#",
      submenu: [
        {
          name: "Pending Requests",
          icon: <CheckCircle size={16} />,
          path:"/admin/leave/pendingleave"
        },
        {
          name: "Leave Policy",
          icon: <Settings size={16} />,
          path: "/admin/leave/leavepolicy",
        },
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

  const formatToTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Employee Name",
      "Email",
      "Department",
      "Check In",
      "Check Out",
      "Status",
      "Working Hours",
    ];
    const rows = filteredAttendance.map((record) => [
      record.full_name,
      record.email,
      record.department || "-",
      record.punch_in || "-",
      record.punch_out || "-",
      record.status,
      record.total_hours ? `${record.total_hours} hrs` : "-",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-white/70 hover:text-white"
                  >
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
                            item.name === "Attendance" &&
                            location.pathname.startsWith("/admin/attendance")
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                          {openSubmenus[item.name] ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>
                        <AnimatePresence>
                          {openSubmenus[item.name] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-9 mt-1 space-y-1"
                            >
                              {item.submenu.map((sub) =>
                                sub.path ? (
                                  <Link
                                    key={sub.name}
                                    to={sub.path}
                                    onClick={() =>
                                      window.innerWidth < 768 &&
                                      setSidebarOpen(false)
                                    }
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
                                    key={sub.name}
                                    onClick={() => {
                                      if (sub.action) sub.action();
                                      if (window.innerWidth < 768)
                                        setSidebarOpen(false);
                                    }}
                                    className="flex items-center gap-2 p-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white w-full text-left"
                                  >
                                    {sub.icon}
                                    <span>{sub.name}</span>
                                  </button>
                                ),
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() =>
                          window.innerWidth < 768 && setSidebarOpen(false)
                        }
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
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Daily Attendance Report
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
                <p className="text-white/50 mt-2">
                  View and manage daily attendance records
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={exportToCSV}
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
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search */}
            <div className="relative w-full sm:w-64 ml-auto">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, email, dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Table Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center gap-2">
                <CalendarDays className="text-amber-400" size={24} />
                <h2 className="text-xl font-semibold text-white">
                  Attendance for{" "}
                  {formattedDate || formatDateToDisplay(selectedDate)}
                </h2>
                <span className="ml-auto text-white/40 text-sm">
                  {filteredAttendance.length} records
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gradient-to-r from-amber-500/20 to-orange-600/20">
                      <tr>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm md:text-base">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm md:text-base">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm md:text-base">
                          Check In
                        </th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm md:text-base">
                          Check Out
                        </th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm md:text-base">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm md:text-base">
                          Working Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-4 py-8 text-center text-white/50"
                          >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"></div>
                          </td>
                        </tr>
                      ) : filteredAttendance.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-4 py-8 text-center text-white/50"
                          >
                            No attendance records for this date
                          </td>
                        </tr>
                      ) : (
                        filteredAttendance.map((record) => (
                          <tr
                            key={record.id}
                            className="border-t border-white/10 hover:bg-white/5 transition-all duration-200"
                          >
                            <td className="px-4 py-3 text-white font-medium text-sm md:text-base">
                              {record.full_name}
                            </td>
                            <td className="px-4 py-3 text-white/80 text-sm md:text-base">
                              {record.email}
                            </td>
                            <td className="px-4 py-3 text-white/80 text-sm md:text-base">
                              {formatToTime(record.punch_in)}
                            </td>
                            <td className="px-4 py-3 text-white/80 text-sm md:text-base">
                              {formatToTime(record.punch_out)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  record.status === "Present"
                                    ? "bg-green-500/20 text-green-300"
                                    : record.status === "Late"
                                      ? "bg-yellow-500/20 text-yellow-300"
                                      : record.status === "Half Present"
                                        ? "bg-orange-500/20 text-orange-300"
                                        : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {record.status || "Absent"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-white/80 text-sm md:text-base">
                              {record.total_hours
                                ? `${record.total_hours} hrs`
                                : "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DailyReport;
