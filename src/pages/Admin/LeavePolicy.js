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
  Save,
  AlertCircle,
  Check,
} from "lucide-react";

const LeavePolicy = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState(() => {
    const initial = {};
    const path = window.location.pathname;
    if (path.startsWith("/admin/leaves")) initial.Leaves = true;
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState({
    casual_leave_days: 12,
    sick_leave_days: 10,
    annual_leave_days: 15,
    carry_forward_limit: 5,
    max_consecutive_days: 10,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch leave policy from backend
  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/admin/leaves/leave-policy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch policy");
      const data = await res.json();
      setPolicy(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Save/Update leave policy
  const savePolicy = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/admin/leaves/leave-policy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(policy),
      });
      if (!res.ok) throw new Error("Failed to save policy");
      setMessage({ type: "success", text: "Leave policy updated successfully" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchPolicy();
  }, []);

  // Keep Leaves submenu open when on this page
  useEffect(() => {
    if (location.pathname.startsWith("/admin/leaves")) {
      setOpenSubmenus((prev) => ({ ...prev, Leaves: true }));
    }
  }, [location.pathname]);

  // Sidebar responsive logic
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
        { name: "Leave Policy", icon: <Settings size={16} />, path: "/admin/leaves/policy" },
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
                            (item.name === "Leaves" && location.pathname.startsWith("/admin/leaves"))
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
                <h1 className="text-3xl md:text-4xl font-bold text-white">Leave Policy</h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
                <p className="text-white/50 mt-2">Configure company leave rules and limits</p>
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

            {/* Policy Form Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center gap-2">
                <Settings className="text-amber-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Leave Entitlements</h2>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 text-sm mb-1">Casual Leave (days per year)</label>
                      <input
                        type="number"
                        min="0"
                        value={policy.casual_leave_days}
                        onChange={(e) => setPolicy({ ...policy, casual_leave_days: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">Sick Leave (days per year)</label>
                      <input
                        type="number"
                        min="0"
                        value={policy.sick_leave_days}
                        onChange={(e) => setPolicy({ ...policy, sick_leave_days: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">Annual Leave / Earned Leave (days per year)</label>
                      <input
                        type="number"
                        min="0"
                        value={policy.annual_leave_days}
                        onChange={(e) => setPolicy({ ...policy, annual_leave_days: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">Carry Forward Limit (days)</label>
                      <input
                        type="number"
                        min="0"
                        value={policy.carry_forward_limit}
                        onChange={(e) => setPolicy({ ...policy, carry_forward_limit: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">Max Consecutive Leave Days</label>
                      <input
                        type="number"
                        min="1"
                        value={policy.max_consecutive_days}
                        onChange={(e) => setPolicy({ ...policy, max_consecutive_days: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={savePolicy}
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default LeavePolicy;