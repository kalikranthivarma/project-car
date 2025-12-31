import { useState } from "react";
import { auth, db } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 
  const handleLogin = async (e) => {
    e.preventDefault();

    const userCred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  
    await getDoc(doc(db, "users", userCred.user.uid));

   
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* CARD */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">

        <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Welcome Back
        </h3>

        <p className="text-center text-slate-500 mb-8">
          Login to your account
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full px-4 py-2
                border border-slate-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-slate-800
                transition
              "
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full px-4 py-2
                border border-slate-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-slate-800
                transition
              "
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="
              w-full py-2.5
              bg-slate-900 text-white font-semibold
              rounded-lg
              hover:bg-slate-800
              transition
              shadow-md
            "
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
