import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Navbar() {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
    setOpen(false);
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="
        relative text-slate-200 no-underline
        transition duration-300
        after:absolute after:left-0 after:-bottom-1
        after:h-[2px] after:w-0 after:bg-white
        after:transition-all after:duration-300
        hover:after:w-full hover:text-white
      "
    >
      {children}
    </Link>
  );

  const LogoutButton = ({ full }) => (
    <button
      onClick={logout}
      className={`
        ${full ? "w-full" : "ml-2"}
        px-6 py-2
        rounded-full
        border border-slate-300
        text-slate-800 font-semibold
        bg-white
        shadow-sm
        hover:shadow-md
        hover:border-slate-400
        transition
      `}
    >
      Logout
    </button>
  );

  return (
    <nav
      className="
        sticky top-0 z-50 h-16
        backdrop-blur-sm
        bg-[#020617]/95
        border-b border-white/10
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-extrabold tracking-widest text-white no-underline"
          >
            LUXURY CARS
          </Link>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden text-slate-300 text-2xl hover:text-white transition"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>

          {/* DESKTOP MENU */}
          <ul className="hidden lg:flex items-center gap-8 text-sm uppercase tracking-wide">

            {!user && (
              <>
                <li>
                  <Link
                    to="/login"
                    className="text-slate-200 hover:text-white transition no-underline"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="
                      px-4 py-1.5
                      border border-white
                      text-white
                      rounded-full
                      hover:bg-white hover:text-black
                      transition
                      no-underline
                    "
                  >
                    Register
                  </Link>
                </li>
              </>
            )}

            {user && role === "customer" && (
              <>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/bookings">Booking History</NavLink></li>
                <li><NavLink to="/myenquiries">My Enquiries</NavLink></li>
                <li><LogoutButton /></li>
              </>
            )}

            {user && role === "admin" && (
              <>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                <li><NavLink to="/add-car">Add Car</NavLink></li>
                <li><NavLink to="/enquiries">Enquiries</NavLink></li>
                <li><LogoutButton /></li>
              </>
            )}
          </ul>
        </div>

        {/* MOBILE MENU — OVERLAY (NO JUMP) */}
        {open && (
          <div
            className="
              lg:hidden
              absolute top-full left-0 w-full
              rounded-xl
              bg-[#020617]/95
              border border-white/10
              shadow-lg
            "
          >
            <ul className="flex flex-col divide-y divide-white/10 text-sm uppercase tracking-wide">

              {!user && (
                <>
                  <li className="p-4">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block text-slate-200 hover:text-white transition"
                    >
                      Login
                    </Link>
                  </li>
                  <li className="p-4">
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="
                        block border border-white
                        text-white text-center
                        rounded-full py-1.5
                        hover:bg-white hover:text-black
                        transition
                      "
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}

              {user && (
                <li className="p-4">
                  <LogoutButton full />
                </li>
              )}

            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
