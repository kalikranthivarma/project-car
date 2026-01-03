import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Navbar() {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
    setOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/?search=${encodeURIComponent(search)}`);
    setOpen(false);
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="block text-slate-200 hover:text-white transition"
    >
      {children}
    </Link>
  );

  const AuthButton = ({ to, label }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="
        px-6 py-2
        rounded-full
        bg-white
        text-black
        font-semibold
        shadow-sm
        hover:bg-slate-200
        transition
      "
    >
      {label}
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
    <nav className="sticky top-0 z-50 bg-[#020617]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-extrabold tracking-widest text-white no-underline whitespace-nowrap"
          >
            LUXURY CARS
          </Link>

          {/* SEARCH BAR (Desktop) */}
          {(user && (role === "customer" || role === "admin")) && (
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex flex-1 max-w-md mx-6"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search by brand or model (BMW, Audi, X5...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="
                    w-full px-5 py-2 pr-12
                    rounded-full
                    bg-white text-black
                    placeholder-slate-500
                    focus:outline-none
                    shadow-sm
                  "
                />
                <button
                  type="submit"
                  className="
                    absolute right-1 top-1
                    h-8 w-8
                    flex items-center justify-center
                    rounded-full
                    bg-slate-900 text-white
                    hover:bg-slate-700
                    transition
                  "
                >
                  🔍
                </button>
              </div>
            </form>
          )}

          {/* Mobile Toggle */}
          <button
            className="lg:hidden text-slate-300 text-2xl"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>

          {/* DESKTOP MENU */}
          <ul className="hidden lg:flex items-center gap-6 text-sm uppercase">

            {!user && (
              <>
                <li><AuthButton to="/login" label="Login" /></li>
                <li><AuthButton to="/register" label="Register" /></li>
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

        {/* MOBILE MENU */}
        {open && (
          <div className="lg:hidden absolute left-0 w-full bg-[#020617] border-t border-white/10">
            <ul className="flex flex-col divide-y divide-white/10 p-4 uppercase text-sm">

              {/* SEARCH BAR (Mobile) */}
              {(user && (role === "customer" || role === "admin")) && (
                <li className="pb-4">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search brand or model..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="
                          w-full px-4 py-2 pr-12
                          rounded-full
                          bg-white text-black
                          placeholder-slate-500
                          focus:outline-none
                        "
                      />
                      <button
                        type="submit"
                        className="
                          absolute right-1 top-1
                          h-8 w-8
                          flex items-center justify-center
                          rounded-full
                          bg-slate-900 text-white
                        "
                      >
                        🔍
                      </button>
                    </div>
                  </form>
                </li>
              )}

              {!user && (
                <>
                  <li className="py-3">
                    <AuthButton to="/login" label="Login" />
                  </li>
                  <li className="py-3">
                    <AuthButton to="/register" label="Register" />
                  </li>
                </>
              )}

              {user && role === "customer" && (
                <>
                  <li className="py-3"><NavLink to="/">Home</NavLink></li>
                  <li className="py-3"><NavLink to="/bookings">Booking History</NavLink></li>
                  <li className="py-3"><NavLink to="/myenquiries">My Enquiries</NavLink></li>
                  <li className="pt-4"><LogoutButton full /></li>
                </>
              )}

              {user && role === "admin" && (
                <>
                  <li className="py-3"><NavLink to="/">Home</NavLink></li>
                  <li className="py-3"><NavLink to="/dashboard">Dashboard</NavLink></li>
                  <li className="py-3"><NavLink to="/add-car">Add Car</NavLink></li>
                  <li className="py-3"><NavLink to="/enquiries">Enquiries</NavLink></li>
                  <li className="pt-4"><LogoutButton full /></li>
                </>
              )}

            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
