import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import imageLogo from "../Image/SGD.jpg";

const Login = ({ onLoginSuccess }) => {
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Notices (unchanged)
  const notices = [
    "📢 System maintenance on Sunday, 10th April from 2 AM to 4 AM.",
    "🎉 New feature: Real-time inventory tracking now available!",
    "⚠️ Please update your password every 90 days for security.",
    "📊 Monthly sales report is ready for download.",
    "🔔 Employee leave requests must be submitted by Friday.",
  ];
  const scrollingNotices = [...notices, ...notices];

  // ---- Dynamic theme based on role (with slow transition) ----
  const theme = role === "admin" 
    ? {
        name: "admin",
        gradientFrom: "from-slate-900",
        gradientVia: "via-purple-900",
        gradientTo: "to-amber-900",
        blobColors: ["bg-amber-500/20", "bg-orange-600/20", "bg-purple-500/20"],
        accent: "from-amber-500 to-orange-600",
        accentHover: "from-amber-600 to-orange-700",
        borderGlow: "focus:border-amber-400 focus:ring-amber-400/30",
        particleBase: [255, 100, 50], // RGB for orange tint
        cardBg: "bg-white/10",
        textAccent: "text-amber-300",
      }
    : {
        name: "employee",
        gradientFrom: "from-slate-900",
        gradientVia: "via-blue-900",
        gradientTo: "to-teal-900",
        blobColors: ["bg-blue-500/20", "bg-cyan-600/20", "bg-teal-500/20"],
        accent: "from-blue-500 to-cyan-600",
        accentHover: "from-blue-600 to-cyan-700",
        borderGlow: "focus:border-blue-400 focus:ring-blue-400/30",
        particleBase: [50, 150, 255], // RGB for blue tint
        cardBg: "bg-white/10",
        textAccent: "text-blue-300",
      };

  // ---- Particle Background with role‑based color update ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor(baseColor) {
        this.baseColor = baseColor; // store RGB array
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.updateColor(baseColor);
      }
      updateColor(baseColor) {
        // vary the color slightly around the base
        const r = baseColor[0] + (Math.random() - 0.5) * 60;
        const g = baseColor[1] + (Math.random() - 0.5) * 60;
        const b = baseColor[2] + (Math.random() - 0.5) * 60;
        this.color = `rgba(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))}, 0.4)`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 120; i++) {
        particles.push(new Particle(theme.particleBase));
      }
    };
    initParticles();

    // Update particle colors when theme changes (slowly over time)
    const updateAllParticleColors = () => {
      particles.forEach(p => p.updateColor(theme.particleBase));
    };

    let colorUpdateInterval = setInterval(() => {
      updateAllParticleColors();
    }, 2000); // gradual color shift every 2 seconds

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(colorUpdateInterval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [theme.particleBase]); // re-run when theme changes

  // ---- Handle Login (unchanged) ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://erp-system-backend-mwmp.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password: password,
          role: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message?.includes("Access denied")) {
          setError(
            `You selected "${role}" login but account belongs to another role`
          );
        } else {
          setError(data.message || "Invalid username or password");
        }
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      sessionStorage.setItem("lastActivity", Date.now());

      if (onLoginSuccess) onLoginSuccess();

      if (data.user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/employee-dashboard", { replace: true });
      }
    } catch (err) {
      setError("Server not responding. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');
          * { font-family: 'Inter', system-ui, sans-serif; }
          
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes softGlow {
            0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5); }
            70% { box-shadow: 0 0 0 12px rgba(249, 115, 22, 0); }
            100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
          }
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(3deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes pulseRing {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          .animate-fade-up {
            animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
            opacity: 0;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .glow-on-focus:focus {
            animation: softGlow 0.6s ease-out;
          }
          .float-animation {
            animation: float 8s ease-in-out infinite;
          }
          .marquee-container {
            overflow: hidden;
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(12px);
            border-radius: 1rem;
            border: 1px solid rgba(255,255,255,0.15);
          }
          .marquee-content {
            display: inline-block;
            white-space: nowrap;
            animation: marquee 40s linear infinite;
          }
          .marquee-container:hover .marquee-content {
            animation-play-state: paused;
          }
          .marquee-item {
            display: inline-block;
            margin-right: 2rem;
            color: #fff;
            font-size: 0.875rem;
            font-weight: 500;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          .pulse-ring::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            background: rgba(245, 158, 11, 0.4);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            animation: pulseRing 2s infinite;
          }
          /* Slow transition for all theme‑sensitive elements */
          .theme-transition {
            transition: background 1.5s ease-in-out, background-color 1.5s ease-in-out, border-color 1.5s ease-in-out, box-shadow 1.5s ease-in-out;
          }
        `}
      </style>

      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden theme-transition">
        {/* Canvas Particle Background */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Animated Gradient Overlay - changes with role */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo} z-1 theme-transition`}></div>

        {/* Animated Blob Shapes - colors change with role */}
        <div className={`absolute top-20 left-10 w-72 h-72 ${theme.blobColors[0]} rounded-full blur-3xl animate-pulse z-0 theme-transition`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${theme.blobColors[1]} rounded-full blur-3xl animate-pulse delay-1000 z-0 theme-transition`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${theme.blobColors[2]} rounded-full blur-3xl z-0 theme-transition`}></div>

        {/* Main Card Container */}
        <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden mx-4 animate-fade-up">
          
          {/* LEFT SIDE - Branding & Notice (desktop only) */}
          <div className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-between bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-sm">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                SHRI GHANOBA
                <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${theme.accent}`}>
                  DEVELOPERS
                </span>
              </h1>
              <p className={`${theme.textAccent} text-xl font-light mt-2 theme-transition`}>ERP System</p>
              <div className={`h-1 w-20 bg-gradient-to-r ${theme.accent} rounded-full my-6 mx-auto lg:mx-0 theme-transition`}></div>
              <p className="text-white/80 text-base leading-relaxed">
                Streamline your business with our all‑in‑one ERP solution.
                Manage inventory, finances, HR, and more – securely & efficiently.
              </p>
              <div className="mt-6 space-y-2 text-white/70 text-sm">
                <p className="flex items-center justify-center lg:justify-start gap-2">✨ Real‑time analytics</p>
                <p className="flex items-center justify-center lg:justify-start gap-2">🔒 Secure & scalable</p>
                <p className="flex items-center justify-center lg:justify-start gap-2">🛟 24/7 support</p>
              </div>
            </div>

            {/* Notice Board */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-300 text-xl">📢</span>
                <span className="text-white font-bold text-sm uppercase tracking-wider">Notice Board</span>
                <div className={`flex-1 h-px bg-gradient-to-r ${theme.accent} opacity-40 theme-transition`}></div>
              </div>
              <div className="marquee-container py-3 px-2">
                <div className="marquee-content">
                  {scrollingNotices.map((notice, idx) => (
                    <span key={idx} className="marquee-item">{notice}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center lg:text-left text-white/40 text-xs">
              © {new Date().getFullYear()} SHRI GHANOBA DEVELOPERS. All rights reserved.
            </div>
          </div>

          {/* RIGHT SIDE - Login Form */}
          <div className={`w-full lg:w-1/2 p-6 sm:p-8 ${theme.cardBg} backdrop-blur-md flex items-center justify-center theme-transition`}>
            <div className="w-full max-w-md">
              {/* Role Tabs */}
              <div className="flex gap-2 p-1 bg-white/10 rounded-2xl mb-8 animate-fade-up">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-500 text-sm sm:text-base ${
                    role === "admin"
                      ? `bg-gradient-to-r ${theme.accent} text-white shadow-lg`
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Admin Login
                </button>
                <button
                  type="button"
                  onClick={() => setRole("employee")}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-500 text-sm sm:text-base ${
                    role === "employee"
                      ? `bg-gradient-to-r ${theme.accent} text-white shadow-lg`
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Employee Login
                </button>
              </div>

              {/* Logo & Welcome */}
              <div className="text-center mb-8 animate-fade-up delay-100">
                <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg mb-4 float-animation">
                  <img src={imageLogo} alt="Company Logo" className="w-16 h-16 rounded-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {role === "admin" ? "Admin Access" : "Employee Access"}
                </h2>
                <p className="text-white/60 text-sm mt-1">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="animate-fade-up delay-200">
                  <label className="block text-white/80 font-medium mb-1 text-sm">Username / Email</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none ${theme.borderGlow} transition-all duration-200 glow-on-focus theme-transition`}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div className="animate-fade-up delay-200">
                  <label className="block text-white/80 font-medium mb-1 text-sm">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none ${theme.borderGlow} transition-all duration-200 glow-on-focus theme-transition`}
                    placeholder="••••••"
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-sm border-l-4 border-red-400 text-red-200 p-3 rounded-xl text-sm animate-fade-up delay-300">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${theme.accent} hover:${theme.accentHover} text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 animate-fade-up delay-300 text-sm sm:text-base theme-transition`}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    `Sign in as ${role === "admin" ? "Admin" : "Employee"}`
                  )}
                </button>
              </form>

              <div className="text-center text-white/40 text-xs mt-8 pt-4 border-t border-white/10">
                Secure login • Powered by SGD ERP
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;