import { useEffect, useState, useContext } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

export default function Bookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Latest first
      data.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      );

      setBookings(data);
      setLoading(false);
    };

    fetchBookings();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-400">
        Please login to view bookings
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-400">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] px-6 py-10 text-slate-100">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-10">
          Booking History
        </h1>

        {bookings.length === 0 ? (
          <p className="text-center text-slate-400">
            No bookings found.
          </p>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6"
              >
                {/* IMAGE */}
                <img
                  src={
                    booking.images?.[0] ||
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70"
                  }
                  className="w-full md:w-56 h-40 object-cover rounded-xl"
                />

                {/* DETAILS */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">
                        {booking.brand} {booking.model}
                      </h2>

                      {booking.bookingType === "testRide" && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full border border-blue-400 text-blue-400">
                          Test Ride
                        </span>
                      )}
                    </div>

                    <p className="text-slate-400 text-sm mt-1">
                      Year: {booking.year}
                    </p>

                    <div className="mt-4">
                      <span className="px-4 py-1.5 rounded-full border border-white/30 text-sm font-semibold capitalize">
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* PAY NOW BUTTON (ONLY IF APPROVED) */}
                  {booking.status === "approved" && (
                    <div className="mt-6">
                      <button
                        onClick={() =>
                          alert("Payment integration coming soon")
                        }
                        className="
                          w-full sm:w-auto
                          px-6 py-2.5
                          bg-green-500
                          text-black font-semibold
                          rounded-lg
                          hover:bg-green-400
                          transition
                        "
                      >
                        Pay Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
