import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, User, CalendarDays, FileText, CheckCircle,
  Users, ChevronDown, ChevronRight, Clock, LogOut, Filter, Calendar,
  Fingerprint, DoorOpen
} from "lucide-react";
import imageLogo from "../../Image/SGD.jpg";

const BASE_URL = "https://erp-system-backend-mwmp.onrender.com/api/employee";

const MyAttendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [profile, setProfile] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch profile & attendance
  useEffect(() => {
    const fetchData = async () => {
      await fetchProfile();
      await fetchAttendance();
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      const res = await fetch(`${BASE_URL}/profile`, {
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
      setError("Profile API error");
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAttendanceHistory(data);
      setFilteredData(data);
    } catch (err) {
      console.error("Attendance API error", err);
    }
  };

  const handlePunchIn = async () => {
    setPunchLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/attendance/punch-in`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Punch-in failed");
      await fetchAttendance();
      alert("Punched in successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/attendance/punch-out`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Punch-out failed");
      await fetchAttendance();
      alert("Punched out successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setPunchLoading(false);
    }
  };

  const handleFilter = () => {
    if (!fromDate || !toDate) return;
    const filtered = attendanceHistory.filter((item) => {
      const d = new Date(item.date);
      return d >= new Date(fromDate) && d <= new Date(toDate);
    });
    setFilteredData(filtered);
  };

  const resetFilter = () => {
    setFromDate("");
    setToDate("");
    setFilteredData(attendanceHistory);
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

  useEffect(() => {
    if (location.pathname === "/my-attendance") {
      setExpandedSection("My Links");
    }
  }, [location]);

  const handleSidebarItemClick = (section, item) => {
    if (item === "My Attendance") return;
    if (item === "My Profile") navigate("/my-profile");
    else if (item === "Dashboard") navigate("/employee-dashboard");
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

  // Auto open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
          My Attendance
        </h1>
        <button onClick={() => setSidebarOpen(true)} className="text-white p-2">
          <Menu size={28} />
        </button>
      </div>

      {/* SINGLE SIDEBAR */}
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
                              item === "My Attendance"
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
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">My Attendance</h1>
              <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border-l-4 border-red-400 text-red-200 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
              </div>
            ) : (
              <>
                {/* Punch In/Out Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 cursor-pointer"
                    onClick={handlePunchIn}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/30 rounded-full">
                        <Fingerprint className="text-green-400" size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Punch In</h3>
                        <p className="text-white/60 text-sm">Start your work day</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-red-500/20 to-rose-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 cursor-pointer"
                    onClick={handlePunchOut}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-500/30 rounded-full">
                        <DoorOpen className="text-red-400" size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Punch Out</h3>
                        <p className="text-white/60 text-sm">End your work day</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Filter Section */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-white/60 text-sm mb-1">From Date</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-white/60 text-sm mb-1">To Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      onClick={handleFilter}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl transition"
                    >
                      <Filter size={18} />
                      Filter
                    </button>
                    <button
                      onClick={resetFilter}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl transition"
                    >
                      <Calendar size={18} />
                      Reset
                    </button>
                  </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-amber-500/30 to-orange-600/30">
                        <tr>
                          <th className="px-6 py-4 text-left text-white font-semibold">Date</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Punch In</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Punch Out</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Total Hours</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                              No attendance records found
                            </td>
                          </tr>
                        ) : (
                          filteredData.map((item, idx) => (
                            <tr key={idx} className="border-t border-white/10 hover:bg-white/5 transition">
                              <td className="px-6 py-3 text-white">{item.date || "-"}</td>
                              <td className="px-6 py-3 text-white/80">
                                {typeof item.punch_in === "object" ? "-" : item.punch_in || "-"}
                              </td>
                              <td className="px-6 py-3 text-white/80">
                                {typeof item.punch_out === "object" ? "-" : item.punch_out || "-"}
                              </td>
                              <td className="px-6 py-3 text-white/80">{item.total_hours || "-"}</td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  item.status === "Working" ? "bg-green-500/20 text-green-300" :
                                  item.status === "Completed" ? "bg-blue-500/20 text-blue-300" :
                                  "bg-yellow-500/20 text-yellow-300"
                                }`}>
                                  {item.status || "-"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </main>
      </div>

      {/* Loading overlay for punch actions */}
      {punchLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
        </div>
      )}
    </div>
  );
};

export default MyAttendance;