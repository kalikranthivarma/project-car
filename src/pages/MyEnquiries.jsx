import { useState, useContext } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

export default function Enquiry() {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitEnquiry = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "enquiries"), {
        customerId: user.uid,
        name: user.displayName || "Customer",
        email: user.email,
        message,
        status: "new",
        createdAt: serverTimestamp(),
      });

      setMessage("");
      alert("Enquiry submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit enquiry");
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    /* ================= PAGE BACKGROUND ================= */
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* ================= CARD ================= */}
      <div className="w-full max-w-lg bg-[#020617]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

        {/* HEADING */}
        <h3 className="text-2xl font-bold text-white text-center mb-2">
          Send an Enquiry
        </h3>

        <p className="text-center text-slate-400 mb-6">
          Have questions? We’ll get back to you shortly.
        </p>

        {/* FORM */}
        <form onSubmit={submitEnquiry} className="space-y-5">

          {/* TEXTAREA */}
          <textarea
            rows="5"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your enquiry here..."
            className="
              w-full px-4 py-3
              rounded-xl
              bg-black/40 text-white
              border border-white/20
              placeholder-slate-400
              focus:ring-2 focus:ring-white/60
              focus:outline-none
              transition
            "
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 rounded-xl font-semibold
              transition duration-300
              ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-white text-black hover:bg-slate-200"
              }
            `}
          >
            {loading ? "Sending..." : "Submit Enquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
