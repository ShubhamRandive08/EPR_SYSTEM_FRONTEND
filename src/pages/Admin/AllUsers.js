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
  Edit2,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";

const AllUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ---------- User table state ----------
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ---------- Auth check ----------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchUsers();
    }
  }, []);

  // ---------- Fetch users ----------
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://erp-system-backend-mwmp.onrender.com/api/admin/users/allusers",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ---------- Search filter ----------
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // ---------- Update user ----------
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/admin/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingUser),
        },
      );
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
      setMessage({ type: "success", text: "User updated successfully" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // ---------- Delete user ----------
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://erp-system-backend-mwmp.onrender.com/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers(users.filter((u) => u.id !== id));
      setShowDeleteConfirm(null);
      setMessage({ type: "success", text: "User deleted successfully" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // ---------- Logout ----------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

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

  // Auto‑close sidebar on mobile after navigation
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSubmenu = (name) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Open Users submenu by default if we are on any users page
  useEffect(() => {
    if (location.pathname.startsWith("/admin/users")) {
      setOpenSubmenus((prev) => ({ ...prev, Users: true }));
    }
  }, [location.pathname]);

  // Full menu items – exactly like the image
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
      path: "/admin/settings",
      submenu: null,
    },
  ];

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
          🍽️ Admin Panel
        </h1>
        <button onClick={() => setSidebarOpen(true)} className="text-white p-2">
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar – full menu, glass style */}
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
                            (item.name === "Users" &&
                              location.pathname.startsWith("/admin/users")) ||
                            (item.name === "Attendance" &&
                              location.pathname.startsWith(
                                "/admin/attendance",
                              )) ||
                            (item.name === "Leaves" &&
                              location.pathname.startsWith("/admin/leaves"))
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
                                ),
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

      {/* Main content – user table */}
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
                  All Users
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
                <p className="text-white/50 mt-2">
                  Manage and view all registered users
                </p>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-all w-64"
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
                    message.type === "success"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                  } backdrop-blur-md border border-white/10`}
                >
                  {message.type === "success" ? (
                    <Check size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Table Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center gap-2">
                <Users className="text-amber-400" size={24} />
                <h2 className="text-xl font-semibold text-white">
                  User Directory
                </h2>
                <span className="ml-auto text-white/40 text-sm">
                  {filteredUsers.length} users found
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-amber-500/20 to-orange-600/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-8 text-center text-white/50"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-t border-white/10 hover:bg-white/5 transition-all duration-200"
                        >
                          <td className="px-6 py-3 text-white/80">{user.id}</td>
                          <td className="px-6 py-3 text-white font-medium">
                            {user.full_name}
                          </td>
                          <td className="px-6 py-3 text-white/80">
                            {user.email}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === "admin"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : user.role === "manager"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-green-500/20 text-green-300"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-white/80">
                            {user.department || "-"}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.is_active === "Active"
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {user.is_active}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(user.id)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={18} />
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

            {/* Edit Modal */}
            <AnimatePresence>
              {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white/10 backdrop-blur-2xl rounded-2xl w-full max-w-md p-6 border border-white/20 shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-white">
                        Edit User
                      </h2>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="text-white/70 hover:text-white transition"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editingUser.full_name || ""}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              full_name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editingUser.email || ""}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Role
                        </label>
                        <select
                          value={editingUser.role || "employee"}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              role: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="employee">Employee</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={editingUser.department || ""}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              department: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={editingUser.designation || ""}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              designation: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Status
                        </label>
                        <select
                          value={editingUser.is_active || "Active"}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              is_active: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-2 rounded-xl hover:shadow-lg transition-all duration-300"
                      >
                        Save Changes
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white/10 backdrop-blur-2xl rounded-2xl w-full max-w-sm p-6 border border-white/20 text-center"
                  >
                    <AlertCircle
                      className="mx-auto text-red-400 mb-4"
                      size={48}
                    />
                    <h3 className="text-xl font-bold text-white mb-2">
                      Confirm Delete
                    </h3>
                    <p className="text-white/70 mb-6">
                      Are you sure you want to delete this user? This action
                      cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDelete(showDeleteConfirm)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl transition-all"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AllUsers;
