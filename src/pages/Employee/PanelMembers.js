import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu, X, LayoutDashboard, User, CalendarDays, FileText, CheckCircle,
  Users, ChevronDown, ChevronRight, Phone, Briefcase, UserCheck
} from "lucide-react";
import imageLogo from "../../Image/SGD.jpg";

const PanelMembers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Hardcoded panel members data
  const [members] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      department: "Construction",
      role: "Panel Head",
      contact: "9876543210",
    },
    {
      id: 2,
      name: "Amit Patil",
      department: "HR",
      role: "Member",
      contact: "9123456780",
    },
    {
      id: 3,
      name: "Priya Deshmukh",
      department: "Finance",
      role: "Member",
      contact: "9988776655",
    },
    {
      id: 4,
      name: "Suresh Jadhav",
      department: "Legal",
      role: "Advisor",
      contact: "9876541230",
    },
  ]);

  // Sidebar sections (same structure as other employee pages)
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

  // Auto-expand "Committee / Panels" section when on this page
  useEffect(() => {
    if (location.pathname === "/panel-members") {
      setExpandedSection("Committee / Panels");
    }
  }, [location.pathname]);

  const handleSidebarItemClick = (section, item) => {
    if (item === "Panel Members") return;
    else if (item === "Dashboard") navigate("/employee-dashboard");
    else if (item === "My Profile") navigate("/my-profile");
    else if (item === "My Attendance") navigate("/my-attendance");
    else if (item === "Leave Application") navigate("/leave-application");
    else if (item === "Leave Acceptance") navigate("/leave-acceptance");
    else if (item === "Committee List") navigate("/committee-list");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
          Panel Members
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

        {/* Static user info (no profile fetch – can be added later) */}
        <div className="p-4 border-b border-white/20 text-center">
          <p className="text-white/80 text-sm">Panel Members View</p>
          <p className="text-amber-300 text-xs">Committee Access</p>
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
                  {expandedSection === section && (
                    <div className="ml-9 mt-1 space-y-1">
                      {sections[section].items.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleSidebarItemClick(section, item)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-sm w-full ${
                            item === "Panel Members"
                              ? "bg-amber-500/20 text-amber-300"
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          } transition-all duration-200`}
                        >
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
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
              <h1 className="text-3xl md:text-4xl font-bold text-white">Panel Members</h1>
              <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2"></div>
              <p className="text-white/50 mt-2">Committee members and their contact details</p>
            </div>

            {/* Stats Cards (optional, adds richness) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-full">
                    <Users className="text-amber-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Members</p>
                    <p className="text-2xl font-bold text-white">{members.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Briefcase className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Departments</p>
                    <p className="text-2xl font-bold text-white">
                      {new Set(members.map(m => m.department)).size}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <UserCheck className="text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Panel Head</p>
                    <p className="text-xl font-bold text-white">
                      {members.find(m => m.role === "Panel Head")?.name.split(" ")[0] || "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-full">
                    <Phone className="text-purple-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Contact Available</p>
                    <p className="text-2xl font-bold text-white">{members.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-amber-500/30 to-orange-600/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-semibold">#</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Name</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Department</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Role</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, idx) => (
                      <tr key={member.id} className="border-t border-white/10 hover:bg-white/5 transition">
                        <td className="px-6 py-3 text-white">{idx + 1}</td>
                        <td className="px-6 py-3 text-white font-medium">{member.name}</td>
                        <td className="px-6 py-3 text-white/80">{member.department}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.role === "Panel Head" 
                              ? "bg-amber-500/20 text-amber-300" 
                              : member.role === "Advisor"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-white/80">{member.contact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer note */}
            <div className="text-center text-white/40 text-sm py-4">
              Committee information as of {new Date().toLocaleDateString()}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default PanelMembers;