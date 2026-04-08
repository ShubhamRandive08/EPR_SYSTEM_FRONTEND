import React, { useState, useEffect, useRef  } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, User, CalendarDays, FileText, CheckCircle,
  Users, ChevronDown, ChevronRight, Eye, Edit, Save, XCircle, PlusCircle
} from "lucide-react";
import imageLogo from "../../Image/SGD.jpg";

const BASE_URL = "https://erp-system-backend-mwmp.onrender.com/api/employee";

const LeaveApplication = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [profile, setProfile] = useState({});
  const [leaveList, setLeaveList] = useState([]);
  const [persons, setPersons] = useState([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [form, setForm] = useState({
    leaveType: "",
    personIncharge: "",
    fromDate: "",
    toDate: "",
    reason: "",
    address: "",
  });
  const [editId, setEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      await fetchProfile();
      await fetchLeaves();
      await fetchPersons();
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProfile(data);
  };

  const fetchLeaves = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/leave`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLeaveList(Array.isArray(data) ? data : data.data || []);
  };

  const fetchPersons = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPersons(Array.isArray(data) ? data : data.data || []);
  };

  // Sidebar sections
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
    if (location.pathname === "/leave-application") {
      setExpandedSection("My Links");
    }
  }, [location]);

  const handleSidebarItemClick = (section, item) => {
    if (item === "Leave Application") return;
    else if (item === "Dashboard") navigate("/employee-dashboard");
    else if (item === "My Profile") navigate("/my-profile");
    else if (item === "My Attendance") navigate("/my-attendance");
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

  const filteredPersons = persons.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      leaveType: "",
      personIncharge: "",
      fromDate: "",
      toDate: "",
      reason: "",
      address: "",
    });
    setIsEditing(false);
    setEditId(null);
    setShowDropdown(false);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_date: form.fromDate,
          to_date: form.toDate,
          reason: form.reason,
          person_incharge: form.personIncharge,
          leave_type: form.leaveType,
          address: form.address,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      alert("Leave applied successfully");
      await fetchLeaves();
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const dropdownRef = useRef(null);

// Click outside handler
useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/leave/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_date: form.fromDate,
          to_date: form.toDate,
          reason: form.reason,
          person_incharge: form.personIncharge,
          leave_type: form.leaveType,
          address: form.address,
        }),
      });
      if (!response.ok) throw new Error("Update failed");
      alert("Leave updated successfully");
      await fetchLeaves();
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (l) => {
    if (l.status !== "Pending") {
      alert("You can only edit pending requests");
      return;
    }
    setForm({
      leaveType: l.leave_type,
      personIncharge: l.person_incharge,
      fromDate: l.from_date?.slice(0, 10) || "",
      toDate: l.to_date?.slice(0, 10) || "",
      reason: l.reason || "",
      address: l.address || "",
    });
    setEditId(l.id);
    setIsEditing(true);
  };

  const handleView = (l) => {
    setViewData(l);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
          Leave Application
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
                              item === "Leave Application"
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
              <h1 className="text-3xl md:text-4xl font-bold text-white">Leave Application</h1>
              <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
              </div>
            ) : (
              <>
                {/* Glassmorphic Form */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Person Incharge Dropdown */}
                    <div className="relative" ref={dropdownRef}>
  <label className="block text-white/80 text-sm mb-1">
    Person Incharge <span className="text-red-400">*</span>
  </label>
  <input
    value={form.personIncharge}
    readOnly
    onClick={() => setShowDropdown(!showDropdown)}
    placeholder="Select Person Incharge"
    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 cursor-pointer focus:outline-none focus:border-amber-400"
  />
  <AnimatePresence>
    {showDropdown && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden"
      >
        <input
          placeholder="Search..."
          className="w-full p-2 bg-gray-700 text-white border-b border-gray-600 focus:outline-none"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="max-h-40 overflow-y-auto">
          {filteredPersons.map((p) => (
            <div
              key={p.id}
              className="p-2 hover:bg-gray-700 cursor-pointer text-white"
              onClick={() => {
                setForm({ ...form, personIncharge: p.name });
                setShowDropdown(false);
                setSearch("");
              }}
            >
              {p.name}
            </div>
          ))}
          {filteredPersons.length === 0 && (
            <div className="p-2 text-gray-400">No results</div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

                    {/* Leave Type */}
                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Leave Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="leaveType"
                        value={form.leaveType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="" className="bg-gray-800">Select Leave Type</option>
                        <option className="bg-gray-800">Casual Leave</option>
                        <option className="bg-gray-800">Sick Leave</option>
                        <option className="bg-gray-800">Emergency Leave</option>
                      </select>
                    </div>

                    {/* From Date */}
                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        From Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        name="fromDate"
                        value={form.fromDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* To Date */}
                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        To Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        name="toDate"
                        value={form.toDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Reason <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-6">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          disabled={submitting}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2 rounded-xl transition shadow-lg disabled:opacity-50"
                        >
                          {submitting ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full"></div> : <Save size={18} />}
                          Update
                        </button>
                        <button
                          onClick={resetForm}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl transition"
                        >
                          <XCircle size={18} />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2 rounded-xl transition shadow-lg disabled:opacity-50"
                      >
                        {submitting ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full"></div> : <PlusCircle size={18} />}
                        Apply Leave
                      </button>
                    )}
                    {isEditing && (
                      <button
                        onClick={resetForm}
                        className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition"
                      >
                        <XCircle size={18} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Leave History Table */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-amber-500/30 to-orange-600/30">
                        <tr>
                          <th className="px-6 py-4 text-left text-white font-semibold">#</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Person Incharge</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Leave Type</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">From</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">To</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Admin Status</th>
                          <th className="px-6 py-4 text-center text-white font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-white/50">
                              No leave applications found
                            </td>
                          </tr>
                        ) : (
                          leaveList.map((l, i) => (
                            <tr key={l.id} className="border-t border-white/10 hover:bg-white/5 transition">
                              <td className="px-6 py-3 text-white">{i + 1}</td>
                              <td className="px-6 py-3 text-white/80">{l.person_incharge}</td>
                              <td className="px-6 py-3 text-white/80">{l.leave_type}</td>
                              <td className="px-6 py-3 text-white/80">{l.from_date?.slice(0, 10)}</td>
                              <td className="px-6 py-3 text-white/80">{l.to_date?.slice(0, 10)}</td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  l.status === "Pending" ? "bg-yellow-500/20 text-yellow-300" :
                                  l.status === "Approved" ? "bg-green-500/20 text-green-300" :
                                  "bg-red-500/20 text-red-300"
                                }`}>
                                  {l.status}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-white/80">{l.admin_status || "-"}</td>
                              <td className="px-6 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  {l.status === "Pending" && (
                                    <button
                                      onClick={() => handleEdit(l)}
                                      className="p-1.5 bg-yellow-500/20 rounded-lg hover:bg-yellow-500/30 transition"
                                    >
                                      <Edit size={16} className="text-yellow-400" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleView(l)}
                                    className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition"
                                  >
                                    <Eye size={16} className="text-blue-400" />
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
              </>
            )}
          </motion.div>
        </main>
      </div>

      {/* View Modal - Glassmorphism */}
      <AnimatePresence>
        {viewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={() => setViewData(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-bold text-white">Leave Details</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-white/60">Leave Type:</p>
                  <p className="text-white font-medium">{viewData.leave_type}</p>
                  <p className="text-white/60">From Date:</p>
                  <p className="text-white font-medium">{viewData.from_date?.slice(0, 10)}</p>
                  <p className="text-white/60">To Date:</p>
                  <p className="text-white font-medium">{viewData.to_date?.slice(0, 10)}</p>
                  <p className="text-white/60">Status:</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs w-fit ${
                    viewData.status === "Pending" ? "bg-yellow-500/20 text-yellow-300" :
                    viewData.status === "Approved" ? "bg-green-500/20 text-green-300" :
                    "bg-red-500/20 text-red-300"
                  }`}>{viewData.status}</span>
                  <p className="text-white/60">Person Incharge:</p>
                  <p className="text-white font-medium">{viewData.person_incharge}</p>
                  <p className="text-white/60">Remark:</p>
                  <p className="text-white">{viewData.remark || "No message"}</p>
                </div>
              </div>
              <div className="flex justify-end p-6 border-t border-white/20">
                <button
                  onClick={() => setViewData(null)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaveApplication;