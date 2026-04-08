import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, User, CalendarDays, FileText, CheckCircle,
  Users, ChevronDown, ChevronRight, LogOut, Save, Edit2, XCircle
} from "lucide-react";
import imageLogo from "../../Image/SGD.jpg";

const MyProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/employee/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          setError("Invalid session. Please login again.");
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");
        setProfile(data);
      } catch (err) {
        setError(err.message || "API not working. Please try later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Auto-expand "My Links" section when on profile page
  useEffect(() => {
    if (location.pathname === "/my-profile") {
      setExpandedSection("My Links");
    }
  }, [location]);

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/employee/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.message || "API not working");
    }
  };

  // Sidebar sections (same as EmployeeDashboard)
  const sections = {
    Dashboard: { isSingle: true, items: ["Dashboard"], icon: <LayoutDashboard size={18} /> },
    "My Links": {
      icon: <User size={18} />,
      items: ["My Profile", "My Attendance", "Leave Application"],
    },
    Approvals: {
      icon: <CheckCircle size={18} />,
      items: ["Leave Acceptance"],
    },
    "Committee / Panels": {
      icon: <Users size={18} />,
      items: ["Committee List", "Panel Members"],
    },
  };

  const handleSidebarItemClick = (section, item) => {
    if (item === "My Profile") return;
    else if (item === "Dashboard") navigate("/employee-dashboard");
    else if (item === "My Attendance") navigate("/my-attendance");
    else if (item === "Leave Application") navigate("/leave-application");
    else if (item === "Leave Acceptance") navigate("/leave-acceptance");
    else if (item === "Committee List") navigate("/committee-list");
    else if (item === "Panel Members") navigate("/panel-members");
    else alert(`${item} page coming soon`);

    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const toggleSection = (section) => {
    if (sections[section].isSingle) {
      handleSidebarItemClick(section, "Dashboard");
      setExpandedSection(null);
    } else {
      setExpandedSection(expandedSection === section ? null : section);
    }
  };

  // Auto open sidebar on desktop, close on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fields to display (exclude sensitive or non-editable)
  const editableFields = ["full_name", "email", "phone", "address"];
  const readOnlyFields = ["id", "designation", "department", "role", "is_active", "created_at"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
          My Profile
        </h1>
        <button onClick={() => setSidebarOpen(true)} className="text-white p-2">
          <Menu size={28} />
        </button>
      </div>

      {/* SINGLE SIDEBAR (same as EmployeeDashboard) */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white/10 backdrop-blur-2xl border-r border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 flex flex-col`}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/20">
          <div className="flex items-center gap-2">
            <img src={imageLogo} alt="Logo" className="w-10 h-10 rounded-full" />
            <h2 className="text-lg font-bold text-white">श्री घनोबा डेव्हलपर्स</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/70 hover:text-white md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-5 border-b border-white/20 text-center space-y-3 relative">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-xl"></div>

          {/* User ID */}
          <div className="relative flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 hover:border-amber-400/50 transition-all duration-300 group">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-white/60 text-xs font-medium">User ID</span>
            </div>
            <span className="text-amber-300 text-sm font-mono font-semibold">
              {profile?.id || "-"}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {Object.keys(sections).map((section) => (
            <div key={section}>
              {sections[section].isSingle ? (
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  {sections[section].icon}
                  <span>{section}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      {sections[section].icon}
                      <span>{section}</span>
                    </div>
                    {expandedSection === section ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === section && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-9 mt-1 space-y-1"
                      >
                        {sections[section].items.map((item) => (
                          <button
                            key={item}
                            onClick={() => handleSidebarItemClick(section, item)}
                            className={`flex items-center gap-2 p-2 rounded-lg text-sm w-full ${
                              item === "My Profile"
                                ? "bg-amber-500/20 text-amber-300"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            } transition-all duration-200`}
                          >
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
          <p className="text-center text-white/40 text-xs">v1.0</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "md:ml-72" : ""}`}>
        <main className="p-4 md:p-8 pt-20 md:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-6"
          >
            {/* Header with edit button */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">My Profile</h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-2 rounded-xl transition-all duration-300 shadow-lg"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl transition-all duration-300 shadow-lg"
                  >
                    <Save size={18} />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition-all duration-300"
                  >
                    <XCircle size={18} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border-l-4 border-red-400 text-red-200 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Loading state */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                      {profile?.full_name?.charAt(0) || "U"}
                    </div>
                    <p className="text-white/60 text-sm mt-3">ID: {profile.id || "-"}</p>
                  </div>

                  {/* Profile fields grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(profile).map(([key, value]) => {
                      // Skip if value is object/array or unwanted
                      if (typeof value === "object") return null;
                      if (key === "id") return null;
                      const isReadOnly = readOnlyFields.includes(key);
                      const isEditable = editableFields.includes(key);

                      return (
                        <div key={key} className="space-y-1">
                          <label className="text-white/60 text-sm capitalize font-medium">
                            {key.replace(/_/g, " ")}
                          </label>
                          {isEditing && isEditable ? (
                            <input
                              name={key}
                              value={value || ""}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                            />
                          ) : (
                            <p className="text-white text-base font-medium bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                              {value || "—"}
                            </p>
                          )}
                          {isReadOnly && isEditing && (
                            <p className="text-amber-400/60 text-xs">Read only field</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MyProfile;