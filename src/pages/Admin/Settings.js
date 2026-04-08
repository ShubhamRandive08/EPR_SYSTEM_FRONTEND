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
  Settings as SettingsIcon,
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
  Globe,
  Mail,
  Building,
  Clock as ClockIcon,
  Upload,
} from "lucide-react";

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState(() => {
    const initial = {};
    const path = window.location.pathname;
    if (path.startsWith("/admin/settings")) initial.Settings = true;
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: "ERP System",
    company_email: "admin@company.com",
    company_phone: "+1 234 567 8900",
    company_address: "123 Business Street, City, Country",
    timezone: "Asia/Kolkata",
    date_format: "DD/MM/YYYY",
    time_format: "24h",
    week_start: "Monday",
    notification_email: "notifications@company.com",
    enable_email_notifications: true,
    enable_sms_notifications: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [logoPreview, setLogoPreview] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch settings from backend
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data);
      if (data.logo_url) setLogoPreview(data.logo_url);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setMessage({ type: "success", text: "Settings updated successfully" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/admin/settings/logo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload logo");
      const data = await res.json();
      setLogoPreview(data.logo_url);
      setSettings({ ...settings, logo_url: data.logo_url });
      setMessage({ type: "success", text: "Logo uploaded successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchSettings();
  }, []);

  // Keep Settings submenu open
  useEffect(() => {
    if (location.pathname.startsWith("/admin/settings")) {
      setOpenSubmenus((prev) => ({ ...prev, Settings: true }));
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
        { name: "Pending Requests", icon: <CheckCircle size={16} />, path: "/admin/leaves/pendingleave" },
        { name: "Leave Policy", icon: <SettingsIcon size={16} />, path: "/admin/leaves/policy" },
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
      icon: <SettingsIcon size={20} />,
      path: "#",
      submenu: [
        { name: "System Settings", icon: <SettingsIcon size={16} />, path: "/admin/settings" },
      ],
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
                            (item.name === "Settings" && location.pathname.startsWith("/admin/settings"))
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
                <h1 className="text-3xl md:text-4xl font-bold text-white">System Settings</h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
                <p className="text-white/50 mt-2">Configure company and system preferences</p>
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

            {/* Settings Form Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center gap-2">
                <SettingsIcon className="text-amber-400" size={24} />
                <h2 className="text-xl font-semibold text-white">General Settings</h2>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Company Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Company Information</h3>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Company Name</label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              value={settings.company_name}
                              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Company Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="email"
                              value={settings.company_email}
                              onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Company Phone</label>
                          <input
                            type="text"
                            value={settings.company_phone}
                            onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Company Address</label>
                          <textarea
                            rows="2"
                            value={settings.company_address}
                            onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* System Preferences */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">System Preferences</h3>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Timezone</label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                              value={settings.timezone}
                              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                            >
                              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                              <option value="America/New_York">America/New_York (EST)</option>
                              <option value="Europe/London">Europe/London (GMT)</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Date Format</label>
                          <select
                            value={settings.date_format}
                            onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Time Format</label>
                          <select
                            value={settings.time_format}
                            onChange={(e) => setSettings({ ...settings, time_format: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="12h">12-hour (AM/PM)</option>
                            <option value="24h">24-hour</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Week Starts On</label>
                          <select
                            value={settings.week_start}
                            onChange={(e) => setSettings({ ...settings, week_start: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="Monday">Monday</option>
                            <option value="Sunday">Sunday</option>
                            <option value="Saturday">Saturday</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="mt-8 pt-6 border-t border-white/20">
                      <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2 mb-4">Notification Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Notification Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="email"
                              value={settings.notification_email}
                              onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.enable_email_notifications}
                              onChange={(e) => setSettings({ ...settings, enable_email_notifications: e.target.checked })}
                              className="w-4 h-4 accent-amber-500"
                            />
                            <span className="text-white/80">Enable Email Notifications</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.enable_sms_notifications}
                              onChange={(e) => setSettings({ ...settings, enable_sms_notifications: e.target.checked })}
                              className="w-4 h-4 accent-amber-500"
                            />
                            <span className="text-white/80">Enable SMS Notifications</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="mt-8 pt-6 border-t border-white/20">
                      <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2 mb-4">Company Logo</h3>
                      <div className="flex items-center gap-6">
                        {logoPreview && (
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/10 border border-white/20">
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
                            <Upload size={18} />
                            Upload Logo
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                          <p className="text-white/40 text-xs mt-2">Recommended size: 200x200px. Max 2MB.</p>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Settings;