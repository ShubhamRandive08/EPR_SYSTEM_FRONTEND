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
  TrendingUp,
  Eye,
  XCircle,
} from "lucide-react";

const MonthlyReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [message, setMessage] = useState({ type: "", text: "" });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDailyData, setEmployeeDailyData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Fetch monthly report
  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/attendance/monthly?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setReportData(data);
      setFilteredData(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee's daily attendance for the selected month
  const fetchEmployeeMonthlyDetails = async (userId) => {
    setModalLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/attendance/employee-monthly?user_id=${userId}&month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to fetch details");
      const data = await res.json();
      setEmployeeDailyData(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    fetchEmployeeMonthlyDetails(employee.user_id);
    setShowModal(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchMonthlyReport();
  }, [selectedMonth, selectedYear]);

  // Format timestamp to time only (e.g., "2026-04-04 10:55:28.409" → "10:55 AM")
  const formatToTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Search filter
  useEffect(() => {
    const filtered = reportData.filter(
      (record) =>
        record.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.department?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredData(filtered);
  }, [searchTerm, reportData]);

  // Sidebar logic (same as before)
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

  const exportToCSV = () => {
    const headers = [
      "Employee Name",
      "Email",
      "Department",
      "Present Days",
      "Absent Days",
      "Late Days",
      "Half Days",
      "Total Working Hours",
    ];
    const rows = filteredData.map((record) => [
      record.full_name,
      record.email,
      record.department || "-",
      record.present_days || 0,
      record.absent_days || 0,
      record.late_days || 0,
      record.half_days || 0,
      record.total_hours ? `${record.total_hours} hrs` : "0 hrs",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`;
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
                  Monthly Attendance Summary
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
                <p className="text-white/50 mt-2">
                  View attendance statistics by month
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {monthNames.map((month, idx) => (
                      <option key={idx} value={idx + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
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

            {/* Summary Table */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center gap-2">
                <TrendingUp className="text-amber-400" size={24} />
                <h2 className="text-xl font-semibold text-white">
                  Summary for {monthNames[selectedMonth - 1]} {selectedYear}
                </h2>
                <span className="ml-auto text-white/40 text-sm">
                  {filteredData.length} employees
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gradient-to-r from-amber-500/20 to-orange-600/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Present
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Absent
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Late
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Half Days
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Total Hours
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-4 py-8 text-center text-white/50"
                        >
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"></div>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-4 py-8 text-center text-white/50"
                        >
                          No attendance data for this month
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((record) => (
                        <tr
                          key={record.user_id}
                          className="border-t border-white/10 hover:bg-white/5 transition-all duration-200"
                        >
                          <td className="px-4 py-3 text-white font-medium">
                            {record.full_name}
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {record.email}
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {record.department || "-"}
                          </td>
                          <td className="px-4 py-3 text-green-300 font-medium">
                            {record.present_days || 0} days
                          </td>
                          <td className="px-4 py-3 text-red-300">
                            {record.absent_days || 0} days
                          </td>
                          <td className="px-4 py-3 text-yellow-300">
                            {record.late_days || 0} days
                          </td>
                          <td className="px-4 py-3 text-orange-300">
                            {record.half_days || 0} days
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {record.total_hours
                              ? `${record.total_hours} hrs`
                              : "0 hrs"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewDetails(record)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title="View daily attendance"
                            >
                              <Eye size={18} />
                            </button>
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

      <AnimatePresence>
        {showModal && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5 border-b border-white/20">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Daily Attendance
                  </h2>
                  <p className="text-white/60 text-sm">
                    {selectedEmployee.full_name} -{" "}
                    {monthNames[selectedMonth - 1]} {selectedYear}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/70 hover:text-white transition"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-5">
                {modalLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                  </div>
                ) : employeeDailyData.length === 0 ? (
                  <p className="text-center text-white/50 py-8">
                    No attendance records found for this month.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-white/5 rounded-lg">
                        <tr>
                          <th className="px-4 py-2 text-left text-white font-semibold">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-white font-semibold">
                            Check In
                          </th>
                          <th className="px-4 py-2 text-left text-white font-semibold">
                            Check Out
                          </th>
                          <th className="px-4 py-2 text-left text-white font-semibold">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left text-white font-semibold">
                            Working Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeDailyData.map((day) => (
                          <tr key={day.id} className="border-t border-white/10">
                            <td className="px-4 py-2 text-white/80">
                              {day.date}
                            </td>
                            <td className="px-4 py-2 text-white/80">
                              {day.punch_in ? formatToTime(day.punch_in) : "-"}
                            </td>
                            <td className="px-4 py-2 text-white/80">
                              {day.punch_out
                                ? formatToTime(day.punch_out)
                                : "-"}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  day.status === "Present"
                                    ? "bg-green-500/20 text-green-300"
                                    : day.status === "Late"
                                      ? "bg-yellow-500/20 text-yellow-300"
                                      : day.status === "Half Present"
                                        ? "bg-orange-500/20 text-orange-300"
                                        : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {day.status || "Absent"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-white/80">
                              {day.total_hours ? `${day.total_hours} hrs` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default MonthlyReport;
