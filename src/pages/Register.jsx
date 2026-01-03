import { useState } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // ✅ ADD

export default function Register() {
  const navigate = useNavigate(); // ✅ ADD

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    address: "",
    license: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 🔒 Registration logic (validation + redirect added)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ PASSWORD VALIDATION
    if (form.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        name: form.name,
        email: form.email,
        contact: form.contact,
        address: form.address,
        drivingLicense: form.license,
        role: "customer",
        createdAt: new Date(),
      });

      alert("Registration successful!");

      // ✅ REDIRECT TO HOME
      navigate("/");

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://www.shutterstock.com/image-vector/luxurious-premium-metallic-black-silver-600nw-2580281445.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8">

        {/* Heading */}
        <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Customer Registration
        </h3>
        <p className="text-center text-slate-500 mb-8">
          Create your Luxury Cars account
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Full Name
            </label>
            <input
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              onChange={handleChange}
              minLength={6}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
            />
            <p className="text-xs text-slate-500 mt-1">
              Password must be at least 6 characters
            </p>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Contact Number
            </label>
            <input
              name="contact"
              placeholder="+91 98765 43210"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Address
            </label>
            <input
              name="address"
              placeholder="Your full address"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>

          {/* Driving License */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Driving License Number
            </label>
            <input
              name="license"
              placeholder="DL-XXXXXXXXXXXX"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>

          {/* Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-yellow-400 hover:text-black transition shadow-md"
            >
              Register
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
