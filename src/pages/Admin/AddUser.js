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
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const AddUser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
    designation: "",
    is_active: "Active",
  });

  // ---------- Auth check ----------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

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

  useEffect(() => {
    if (location.pathname.startsWith("/admin/users")) {
      setOpenSubmenus((prev) => ({ ...prev, Users: true }));
    }
  }, [location.pathname]);

  // Full menu items (same as All Users page)
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
        {
          name: "Daily Report",
          icon: <Clock size={16} />,
          path: "/admin/attendance/daily",
        },
        {
          name: "Monthly Summary",
          icon: <BarChart3 size={16} />,
          path:"/admin/attendance/monthly",
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
          path:"/admin/leave/pendingleave",
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
      action: () => alert("Settings page coming soon"),
      submenu: null,
    },
  ];

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Basic validation
    if (!formData.full_name || !formData.email || !formData.password) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/admin/users/addusers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create user");

      setMessage({ type: "success", text: "User created successfully!" });
      setTimeout(() => {
        navigate("/admin/users"); // Redirect to All Users page after 2 seconds
      }, 1500);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

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

      {/* Sidebar – same as All Users */}
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
                            (item.name === "Users" && location.pathname.startsWith("/admin/users"))
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
                                    onClick={() => {
                                      if (window.innerWidth < 768)
                                        setSidebarOpen(false);
                                    }}
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
                                    className="flex items-center gap-2 p-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200 w-full text-left"
                                  >
                                    {sub.icon}
                                    <span>{sub.name}</span>
                                  </button>
                                )
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => {
                          if (item.action && item.path === "#") item.action();
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
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

      {/* Main content – Add User Form */}
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
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Add New User</h1>
              <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
              <p className="text-white/50 mt-2">Create a new user account</p>
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

            {/* Form Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center gap-2">
                <UserPlus className="text-amber-400" size={24} />
                <h2 className="text-xl font-semibold text-white">User Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-white/80 text-sm mb-1">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white/80 text-sm mb-1">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-white/80 text-sm mb-1">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Status</label>
                    <select
                      name="is_active"
                      value={formData.is_active}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/users")}
                    className="px-6 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AddUser;