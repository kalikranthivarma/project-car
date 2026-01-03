import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState(null);

  const fetchEnquiries = async () => {
    try {
      const q = query(
        collection(db, "enquiries"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEnquiries(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  /* ✅ SAME FUNCTION NAME – ONLY ADDED CHAT MESSAGE */
  const sendReply = async (id) => {
    if (!replyText[id]) return;

    try {
      setSending(id);

      const ref = doc(db, "enquiries", id);
      await updateDoc(ref, {
        messages: arrayUnion({
          sender: "admin",
          text: replyText[id],
          createdAt: serverTimestamp(),
        }),
        status: "replied",
      });

      setReplyText({ ...replyText, [id]: "" });
      fetchEnquiries();
    } catch (err) {
      console.error(err);
    }

    setSending(null);
  };

  return (
    <div className="min-h-screen bg-[#020617] px-6 py-10 text-slate-100">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Customer Enquiries
      </h2>

      {loading ? (
        <p className="text-center text-slate-400">Loading enquiries...</p>
      ) : enquiries.length === 0 ? (
        <p className="text-center text-slate-400">No enquiries found</p>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 shadow-lg"
            >
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <p className="text-white font-semibold text-lg">
                    {enquiry.name}
                  </p>
                  <p className="text-slate-400 text-sm">
                    📧 {enquiry.email}
                  </p>
                  {enquiry.mobile && (
                    <p className="text-slate-400 text-sm">
                      📱 {enquiry.mobile}
                    </p>
                  )}
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full w-fit h-fit ${
                    enquiry.status === "replied"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {enquiry.status?.toUpperCase()}
                </span>
              </div>

              {/* ================= CHAT BOX ================= */}
              <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-4 max-h-64 overflow-y-auto space-y-3">

                {/* CUSTOMER INITIAL MESSAGE */}
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-white px-4 py-2 rounded-xl max-w-xs text-sm">
                    {enquiry.message}
                  </div>
                </div>

                {/* CHAT MESSAGES */}
                {enquiry.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "admin"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-xs text-sm ${
                        msg.sender === "admin"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-600 text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= ADMIN CHAT INPUT ================= */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a reply..."
                  value={replyText[enquiry.id] || ""}
                  onChange={(e) =>
                    setReplyText({
                      ...replyText,
                      [enquiry.id]: e.target.value,
                    })
                  }
                  className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-white focus:outline-none"
                />

                <button
                  onClick={() => sendReply(enquiry.id)}
                  disabled={sending === enquiry.id}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50"
                >
                  {sending === enquiry.id ? "Sending..." : "Send"}
                </button>
              </div>

              {/* DATE */}
              <p className="mt-3 text-xs text-slate-500">
                {enquiry.createdAt?.toDate().toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
