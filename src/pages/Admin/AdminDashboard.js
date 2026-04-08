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
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  MapPin,
  PlusCircle,
  List,
  Calendar,
  XCircle,
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

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: { totalUsers: 0, activeToday: 0, presentToday: 0, pendingLeaves: 0 },
    weeklyAttendance: [],
    roleDistribution: [],
    recentActivities: [],
  });

  // Site Visit state
  const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
  const [activeSiteVisitTab, setActiveSiteVisitTab] = useState("today");
  const [todayVisits, setTodayVisits] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [siteVisitForm, setSiteVisitForm] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    scheduled_time: "10:00",
    customer_name: "",
    customer_phone: "",
    pickup_point: "",
    persons: 1,
    location: "",
    description: "",
  });
  const [siteVisitMessage, setSiteVisitMessage] = useState({
    type: "",
    text: "",
  });
  const [statusUpdating, setStatusUpdating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper: Convert YYYY-MM-DD to "DD Month YYYY"
  const formatToDbDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "long" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Fetch all dashboard data
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const usersRes = await fetch(
        "https://erp-system-backend-mwmp.onrender.com/api/admin/users/allusers",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(
        (u) => u.is_active === "Active",
      ).length;

      const today = new Date().toISOString().split("T")[0];
      const dbToday = formatToDbDate(today);
      const attendanceRes = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/attendance/daily?date=${encodeURIComponent(dbToday)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      let presentToday = 0;
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        presentToday = attendanceData.filter(
          (r) => r.status === "Present",
        ).length;
      }

      const leavesRes = await fetch(
        "https://erp-system-backend-mwmp.onrender.com/api/admin/leaves/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      let pendingLeaves = 0;
      let leavesData = [];
      if (leavesRes.ok) {
        leavesData = await leavesRes.json();
        pendingLeaves = leavesData.length;
      }

      const weekly = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = formatToDbDate(date.toISOString().split("T")[0]);
        const res = await fetch(
          `https://erp-system-backend-mwmp.onrender.com/api/admin/attendance/daily?date=${encodeURIComponent(formattedDate)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          const present = data.filter((r) => r.status === "Present").length;
          const absent = data.filter((r) => r.status === "Absent").length;
          weekly.push({
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            present,
            absent,
          });
        } else {
          weekly.push({
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            present: 0,
            absent: 0,
          });
        }
      }

      const roles = usersData.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      const roleDist = Object.keys(roles).map((role) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: roles[role],
        color:
          role === "admin"
            ? "#F59E0B"
            : role === "manager"
              ? "#3B82F6"
              : "#10B981",
      }));

      let recentActs = leavesData.slice(0, 4).map((leave) => ({
        id: leave.id,
        user: leave.employee_name || "Employee",
        action: `Leave request (${leave.leave_type})`,
        time: leave.created_at
          ? new Date(leave.created_at).toLocaleTimeString()
          : "Recently",
        date: leave.created_at
          ? new Date(leave.created_at).toLocaleDateString()
          : "",
      }));
      if (recentActs.length < 4) {
        recentActs.push({
          id: "d1",
          user: "System",
          action: "Dashboard ready",
          time: "Just now",
          date: new Date().toLocaleDateString(),
        });
      }

      setDashboardData({
        stats: {
          totalUsers,
          activeToday: activeUsers,
          presentToday,
          pendingLeaves,
        },
        weeklyAttendance: weekly,
        roleDistribution: roleDist,
        recentActivities: recentActs,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Site Visit API calls (admin versions – now includes employee_name)
  const fetchTodayVisits = async () => {
    setLoadingVisits(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/site-visit/today`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setTodayVisits(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVisits(false);
    }
  };

  const fetchUpcomingVisits = async () => {
    setLoadingVisits(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/site-visit/upcoming`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setUpcomingVisits(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVisits(false);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    setSiteVisitMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/site-visit/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(siteVisitForm),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to schedule");
      setSiteVisitMessage({
        type: "success",
        text: "Site visit scheduled successfully!",
      });
      setTimeout(() => setSiteVisitMessage({ type: "", text: "" }), 3000);
      setSiteVisitForm({
        visit_date: new Date().toISOString().split("T")[0],
        scheduled_time: "10:00",
        customer_name: "",
        customer_phone: "",
        pickup_point: "",
        persons: 1,
        location: "",
        description: "",
      });
      fetchTodayVisits();
      fetchUpcomingVisits();
    } catch (err) {
      setSiteVisitMessage({ type: "error", text: err.message });
    }
  };

  const updateVisitStatus = async (id, newStatus) => {
    setStatusUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/site-visit/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!res.ok) throw new Error("Failed to update status");
      fetchTodayVisits();
      fetchUpcomingVisits();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const deleteVisit = async (id) => {
    if (!window.confirm("Are you sure you want to delete this site visit?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/site-visit/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to delete");
      fetchTodayVisits();
      fetchUpcomingVisits();
      alert("Visit deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const openSiteVisitModal = (tab) => {
    setActiveSiteVisitTab(tab);
    if (tab === "today") fetchTodayVisits();
    if (tab === "upcoming") fetchUpcomingVisits();
    setShowSiteVisitModal(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchDashboardStats();
  }, []);

  // Sidebar helpers
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

  useEffect(() => {
    if (location.pathname.startsWith("/admin/users"))
      setOpenSubmenus((prev) => ({ ...prev, Users: true }));
    if (location.pathname.startsWith("/admin/attendance"))
      setOpenSubmenus((prev) => ({ ...prev, Attendance: true }));
    if (location.pathname.startsWith("/admin/leaves"))
      setOpenSubmenus((prev) => ({ ...prev, Leaves: true }));
  }, [location.pathname]);

  const toggleSubmenu = (name) =>
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));

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
          path: "/admin/leave/pendingleave",
        },
        {
          name: "Leave Policy",
          icon: <Settings size={16} />,
          path: "/admin/leaves/policy",
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
      path: "/admin/settings",
      submenu: null,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
          Admin Panel
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
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${openSubmenus[item.name] ? "bg-white/10 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}`}
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
                              {item.submenu.map((sub) => (
                                <div key={sub.name}>
                                  <Link
                                    to={sub.path}
                                    onClick={() =>
                                      window.innerWidth < 768 &&
                                      setSidebarOpen(false)
                                    }
                                    className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-all duration-200 ${location.pathname === sub.path ? "bg-amber-500/20 text-amber-300" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                                  >
                                    {sub.icon}
                                    <span>{sub.name}</span>
                                  </Link>
                                </div>
                              ))}
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
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${location.pathname === item.path ? "bg-amber-500/20 text-amber-300" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
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
        className={`transition-all duration-300 ${sidebarOpen && window.innerWidth >= 768 ? "md:ml-72" : ""}`}
      >
        <main className="p-4 md:p-8 pt-20 md:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header with Site Visit button */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Dashboard
                </h1>
                <p className="text-white/50 mt-1">Welcome back, Admin 👋</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openSiteVisitModal("today")}
                  className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-sm transition-all"
                >
                  <MapPin size={16} />
                  <span className="hidden sm:inline">Site Visits</span>
                </button>
                <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-sm">Live</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm">Total Users</p>
                    <p className="text-3xl font-bold mt-2">
                      {dashboardData.stats.totalUsers}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      Active: {dashboardData.stats.activeToday}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Users size={28} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm">Present Today</p>
                    <p className="text-3xl font-bold mt-2">
                      {dashboardData.stats.presentToday}
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
                    <p className="text-3xl font-bold mt-2">
                      {dashboardData.stats.pendingLeaves}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Clock size={28} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl shadow-xl text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm">
                      Total Absent (Today)
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {dashboardData.stats.totalUsers -
                        dashboardData.stats.presentToday}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Activity size={28} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="text-amber-400" size={24} />
                  <h2 className="text-xl font-semibold text-white">
                    Weekly Attendance
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.weeklyAttendance}>
                    <XAxis dataKey="day" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "12px",
                      }}
                    />
                    <Bar
                      dataKey="present"
                      fill="#F59E0B"
                      radius={[8, 8, 0, 0]}
                      name="Present"
                    />
                    <Bar
                      dataKey="absent"
                      fill="#EF4444"
                      radius={[8, 8, 0, 0]}
                      name="Absent"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="text-green-400" size={24} />
                  <h2 className="text-xl font-semibold text-white">
                    Role Distribution
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.roleDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {dashboardData.roleDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity & Attendance Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Recent Activities
                </h2>
                <div className="space-y-3">
                  {dashboardData.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {activity.user}
                        </p>
                        <p className="text-white/50 text-sm">
                          {activity.action}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-sm">{activity.time}</p>
                        <p className="text-white/40 text-xs">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-purple-400" size={24} />
                  <h2 className="text-xl font-semibold text-white">
                    Attendance Trend (Present)
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dashboardData.weeklyAttendance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="day" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="present"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ fill: "#F59E0B" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-center text-white/40 text-sm py-4">
              © 2026 Admin Panel — Secure Dashboard
            </div>
          </motion.div>
        </main>
      </div>

      {/* Site Visit Modal (Admin Version – with employee name and green border) */}
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
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setActiveSiteVisitTab("today");
                      fetchTodayVisits();
                    }}
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
                    onClick={() => {
                      setActiveSiteVisitTab("upcoming");
                      fetchUpcomingVisits();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeSiteVisitTab === "upcoming" ? "bg-amber-500/20 text-amber-300" : "text-white/60 hover:text-white"}`}
                  >
                    <List size={18} /> Upcoming Visits
                  </button>
                </div>
                <button
                  onClick={() => setShowSiteVisitModal(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                {activeSiteVisitTab === "today" && (
                  <div>
                    {loadingVisits ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                      </div>
                    ) : todayVisits.length === 0 ? (
                      <p className="text-white/50 text-center py-8">
                        No site visits scheduled for today.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {todayVisits.map((visit) => (
                          <div
                            key={visit.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-white font-medium">
                                  {visit.customer_name} – {visit.location}
                                </p>
                                {/* Employee name with green border badge style */}
                                <p className="text-white/80 text-sm mt-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-green-500/50 bg-green-500/10 text-green-300 text-xs">
                                    👤 {visit.employee_name || "Unknown"}
                                  </span>
                                </p>
                                <p className="text-white/60 text-sm mt-1">
                                  Phone: {visit.customer_phone || "N/A"}
                                </p>
                                <p className="text-white/60 text-sm">
                                  Time: {visit.scheduled_time} | Pickup:{" "}
                                  {visit.pickup_point} | Persons:{" "}
                                  {visit.persons}
                                </p>
                                {visit.description && (
                                  <p className="text-white/40 text-xs mt-1">
                                    Description: {visit.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 items-center">
                                <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300">
                                  {visit.status}
                                </span>
                                <button
                                  onClick={() =>
                                    updateVisitStatus(visit.id, "Completed")
                                  }
                                  disabled={statusUpdating}
                                  className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() =>
                                    updateVisitStatus(visit.id, "Cancelled")
                                  }
                                  disabled={statusUpdating}
                                  className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => deleteVisit(visit.id)}
                                  className="text-red-400 hover:text-red-300 transition"
                                  title="Delete"
                                >
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
                        <label className="block text-white/80 text-sm mb-1">
                          Visit Date
                        </label>
                        <input
                          type="date"
                          value={siteVisitForm.visit_date}
                          onChange={(e) =>
                            setSiteVisitForm({
                              ...siteVisitForm,
                              visit_date: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Scheduled Time
                        </label>
                        <input
                          type="time"
                          value={siteVisitForm.scheduled_time}
                          onChange={(e) =>
                            setSiteVisitForm({
                              ...siteVisitForm,
                              scheduled_time: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          placeholder="Customer name"
                          value={siteVisitForm.customer_name}
                          onChange={(e) =>
                            setSiteVisitForm({
                              ...siteVisitForm,
                              customer_name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Customer Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="Contact number"
                          value={siteVisitForm.customer_phone}
                          onChange={(e) =>
                            setSiteVisitForm({
                              ...siteVisitForm,
                              customer_phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Pickup Point
                        </label>
                        <input
                          type="text"
                          placeholder="Pickup location"
                          value={siteVisitForm.pickup_point}
                          onChange={(e) =>
                            setSiteVisitForm({
                              ...siteVisitForm,
                              pickup_point: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Number of Persons
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={siteVisitForm.persons}
                          onChange={(e) =>
                            setSiteVisitForm({
                              ...siteVisitForm,
                              persons: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="Site address"
                        value={siteVisitForm.location}
                        onChange={(e) =>
                          setSiteVisitForm({
                            ...siteVisitForm,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Description
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Additional details"
                        value={siteVisitForm.description}
                        onChange={(e) =>
                          setSiteVisitForm({
                            ...siteVisitForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                      />
                    </div>
                    {siteVisitMessage.text && (
                      <div
                        className={`p-2 rounded text-center ${siteVisitMessage.type === "success" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}
                      >
                        {siteVisitMessage.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-2 rounded-xl hover:shadow-lg transition-all"
                    >
                      Schedule Visit
                    </button>
                  </form>
                )}

                {activeSiteVisitTab === "upcoming" && (
                  <div>
                    {loadingVisits ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                      </div>
                    ) : upcomingVisits.length === 0 ? (
                      <p className="text-white/50 text-center py-8">
                        No upcoming site visits.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingVisits.map((visit) => (
                          <div
                            key={visit.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-white font-medium">
                                  {visit.customer_name} – {visit.location}
                                </p>
                                <p className="text-white/80 text-sm mt-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-green-500/50 bg-green-500/10 text-green-300 text-xs">
                                    👤 {visit.employee_name || "Unknown"}
                                  </span>
                                </p>
                                <p className="text-white/60 text-sm">
                                  Phone: {visit.customer_phone || "N/A"}
                                </p>
                                <p className="text-white/60 text-sm">
                                  Date:{" "}
                                  {visit.visit_date?.split("T")[0] ||
                                    visit.visit_date}{" "}
                                  | Time: {visit.scheduled_time}
                                </p>
                                <p className="text-white/60 text-sm">
                                  Pickup: {visit.pickup_point} | Persons:{" "}
                                  {visit.persons}
                                </p>
                                {visit.description && (
                                  <p className="text-white/40 text-xs mt-1">
                                    Description: {visit.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 items-center">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      updateVisitStatus(visit.id, "Completed")
                                    }
                                    disabled={statusUpdating}
                                    className="px-3 py-1 text-xs bg-green-500/20 text-green-300 rounded-full hover:bg-green-500/30 transition"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateVisitStatus(visit.id, "Cancelled")
                                    }
                                    disabled={statusUpdating}
                                    className="px-3 py-1 text-xs bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                                <button
                                  onClick={() => deleteVisit(visit.id)}
                                  className="text-red-400 hover:text-red-300 transition"
                                  title="Delete"
                                >
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

export default AdminDashboard;
