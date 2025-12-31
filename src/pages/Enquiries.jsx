import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                  <p className="text-white font-semibold">
                    {enquiry.name}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {enquiry.email}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full w-fit ${
                    enquiry.status === "new"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-slate-500/20 text-slate-300"
                  }`}
                >
                  {enquiry.status.toUpperCase()}
                </span>
              </div>

              <p className="mt-4 text-slate-300">
                {enquiry.message}
              </p>

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
