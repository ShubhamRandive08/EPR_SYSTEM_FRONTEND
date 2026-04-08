import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, User, CalendarDays, FileText, CheckCircle,
  Users, ChevronDown, ChevronRight, Eye, Save, XCircle, Bell
} from "lucide-react";
import imageLogo from "../../Image/SGD.jpg";

const LeaveAcceptance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [profile, setProfile] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [originalStatus, setOriginalStatus] = useState(null); // NEW: store original status when modal opens
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/employee/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Profile load failed");
      setProfile(result);
    } catch (err) {
      setError(err.message || "Server not responding");
    }
  };

  // Fetch pending count
  const fetchPendingCount = async () => {
    try {
      const res = await fetch(
        "https://erp-system-backend-mwmp.onrender.com/api/employee/leave/leaveacceptance/pending/count",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      setPendingCount(result.count || 0);
    } catch {
      console.log("Pending count API not working");
    }
  };

  // Fetch leaves for incharge
  const fetchLeaves = async (inchargeName) => {
    try {
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/employee/leave/leaveacceptance?incharge=${encodeURIComponent(inchargeName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to load leaves");
      setData(result);
    } catch (err) {
      setError(err.message || "Server not responding");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      await fetchProfile();
      await fetchPendingCount();
    };
    init();
  }, []);

  // Load leaves after profile is ready
  useEffect(() => {
    if (profile?.full_name || profile?.name) {
      const inchargeName = profile.full_name || profile.name;
      fetchLeaves(inchargeName);
    }
  }, [profile]);

  // Update leave status
  const handleSave = async () => {
    // Only allow saving if original status is Pending
    if (originalStatus !== "Pending") return;
    setUpdating(true);
    try {
      const res = await fetch(
        `https://erp-system-backend-mwmp.onrender.com/api/employee/leave/leaveacceptance/${selected.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: selected.status,
            reason: selected.reason,
          }),
        }
      );
      if (!res.ok) throw new Error();
      // Refresh data
      const inchargeName = profile.full_name || profile.name;
      await fetchLeaves(inchargeName);
      await fetchPendingCount();
      setShowModal(false);
      setSelected(null);
      setOriginalStatus(null);
    } catch {
      alert("Server not responding");
    } finally {
      setUpdating(false);
    }
  };

  const openModal = (row) => {
    setSelected({ ...row });
    setOriginalStatus(row.status); // store original status when modal opens
    setShowModal(true);
  };

  // Sidebar sections (same structure)
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
    if (location.pathname === "/leave-acceptance") {
      setExpandedSection("Approvals");
    }
  }, [location]);

  const handleSidebarItemClick = (section, item) => {
    if (item === "Leave Acceptance") return;
    else if (item === "My Profile") navigate("/my-profile");
    else if (item === "My Attendance") navigate("/my-attendance");
    else if (item === "Leave Application") navigate("/leave-application");
    else if (item === "Dashboard") navigate("/employee-dashboard");
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
          Leave Acceptance
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
                            className={`flex items-center justify-between gap-2 p-2 rounded-lg text-sm w-full ${
                              item === "Leave Acceptance"
                                ? "bg-amber-500/20 text-amber-300"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            } transition-all duration-200`}
                          >
                            <span>{item}</span>
                            {item === "Leave Acceptance" && pendingCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                                {pendingCount}
                              </span>
                            )}
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
            {/* Header with pending count */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Leave Acceptance</h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-red-500/30">
                  <Bell className="text-red-400" size={18} />
                  <span className="text-red-300 font-semibold">{pendingCount} pending request(s)</span>
                </div>
              )}
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
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-amber-500/30 to-orange-600/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-white font-semibold">#</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Date</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Employee ID</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Employee Name</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Leave Type</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                        <th className="px-6 py-4 text-center text-white font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-white/50">
                            No leave requests found
                           </td>
                        </tr>
                      ) : (
                        data.map((row, i) => (
                          <tr key={row.id} className="border-t border-white/10 hover:bg-white/5 transition">
                            <td className="px-6 py-3 text-white">{i + 1}</td>
                            <td className="px-6 py-3 text-white/80">{row.created_at?.split("T")[0] || "-"}</td>
                            <td className="px-6 py-3 text-white/80">{row.user_id}</td>
                            <td className="px-6 py-3 text-white/80">{row.employee_name}</td>
                            <td className="px-6 py-3 text-white/80">{row.leave_type}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                row.status === "Pending" ? "bg-yellow-500/20 text-yellow-300" :
                                row.status === "Approved" ? "bg-green-500/20 text-green-300" :
                                "bg-red-500/20 text-red-300"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <button
                                onClick={() => openModal(row)}
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                              >
                                <Eye size={18} className="text-amber-400" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Modal - Glassmorphism style with originalStatus logic */}
      <AnimatePresence>
        {showModal && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={() => {
              setShowModal(false);
              setOriginalStatus(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-bold text-white">Leave Details</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p className="text-white/60">Employee:</p>
                  <p className="text-white font-medium">{selected.employee_name}</p>
                  <p className="text-white/60">Leave Type:</p>
                  <p className="text-white font-medium">{selected.leave_type}</p>
                  <p className="text-white/60">From Date:</p>
                  <p className="text-white font-medium">{selected.from_date}</p>
                  <p className="text-white/60">To Date:</p>
                  <p className="text-white font-medium">{selected.to_date}</p>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-1">Status</label>
                  <select
                    value={selected.status}
                    disabled={originalStatus !== "Pending"} // disabled if original status is not pending
                    onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      originalStatus !== "Pending"
                        ? "bg-white/5 border-white/20 text-white/50 cursor-not-allowed"
                        : "bg-white/10 border-white/20 text-white focus:outline-none focus:border-amber-400"
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-1">Message / Reason</label>
                  <textarea
                    value={selected.reason || ""}
                    disabled={originalStatus !== "Pending"} // disabled if original status is not pending
                    onChange={(e) => setSelected({ ...selected, reason: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      originalStatus !== "Pending"
                        ? "bg-white/5 border-white/20 text-white/50 cursor-not-allowed"
                        : "bg-white/10 border-white/20 text-white focus:outline-none focus:border-amber-400"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-white/20">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setOriginalStatus(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                >
                  <XCircle size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={originalStatus !== "Pending" || updating} // only enabled if original is pending and not saving
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white transition ${
                    originalStatus !== "Pending" || updating
                      ? "bg-gray-500/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  }`}
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaveAcceptance;