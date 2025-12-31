import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

/* ================= CHART REGISTER ================= */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70";

export default function Dashboard() {
  const [cars, setCars] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      const carsSnap = await getDocs(collection(db, "cars"));
      const enquiriesSnap = await getDocs(collection(db, "enquiries"));
      const bookingsSnap = await getDocs(collection(db, "bookings"));

      setCars(carsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setEnquiries(enquiriesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const bookingData = bookingsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        );

      setBookings(bookingData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= UPDATE BOOKING STATUS ================= */
  const updateBookingStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch {
      alert("Failed to update status");
    }
  };

  /* ================= DATA PROCESSING ================= */
  const carsByBrand = cars.reduce((acc, car) => {
    acc[car.brand] = (acc[car.brand] || 0) + 1;
    return acc;
  }, {});

  const revenueByBrand = bookings
    .filter((b) => b.status === "paid")
    .reduce((acc, b) => {
      acc[b.brand] = (acc[b.brand] || 0) + 1;
      return acc;
    }, {});

  /* ================= CHART DATA ================= */
  const brandChart = {
    labels: Object.keys(carsByBrand),
    datasets: [
      {
        label: "Cars by Brand",
        data: Object.values(carsByBrand),
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 6,
      },
    ],
  };

  const revenueChart = {
    labels: Object.keys(revenueByBrand),
    datasets: [
      {
        label: "Paid Bookings",
        data: Object.values(revenueByBrand),
        backgroundColor: "rgba(34,197,94,0.85)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#e5e7eb" }, grid: { display: false } },
      y: {
        ticks: { color: "#e5e7eb", stepSize: 1 },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-300">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-12">
          Admin Dashboard
        </h1>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          <StatCard title="Total Cars" value={cars.length} />
          <StatCard title="Total Enquiries" value={enquiries.length} />
          <StatCard title="Total Bookings" value={bookings.length} />
          <StatCard
            title="Pending Bookings"
            value={bookings.filter(b => b.status === "pending").length}
            highlight
          />
        </div>

        {/* ================= CARS BY BRAND ================= */}
        <ChartCard title="Cars by Brand">
          <Bar data={brandChart} options={chartOptions} />
        </ChartCard>

        {/* ================= PAYMENT REVENUE ================= */}
        <ChartCard title="Payment Revenue (Paid Bookings)">
          {Object.keys(revenueByBrand).length === 0 ? (
            <p className="text-slate-400 text-center">No paid bookings yet</p>
          ) : (
            <Bar data={revenueChart} options={chartOptions} />
          )}
        </ChartCard>

        {/* ================= ADDED CARS LIST ================= */}
        <h2 className="text-2xl font-semibold mb-6 mt-16">
          Total Added Cars
        </h2>

        <div className="overflow-x-auto rounded-xl border border-white/10 mb-16">
          <table className="min-w-full bg-white/5 text-sm">
            <thead className="bg-white/10 text-slate-300 uppercase">
              <tr>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Car</th>
                <th className="px-6 py-3">Year</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-white/10">
                  <td className="px-6 py-4">
                    <img
                      src={car.images?.[0] || FALLBACK_IMAGE}
                      alt={car.brand}
                      className="w-24 h-16 object-cover rounded-lg border border-white/10"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {car.brand} {car.model}
                  </td>
                  <td className="px-6 py-4">{car.year}</td>
                  <td className="px-6 py-4 max-w-md text-slate-400">
                    <p className="line-clamp-2">
                      {car.description || "No description"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-400/20 text-green-400">
                      Available
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= BOOKING MANAGEMENT ================= */}
        <h2 className="text-2xl font-semibold mb-6">
          Booking Management
        </h2>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full bg-white/5 text-sm">
            <thead className="bg-white/10 text-slate-300 uppercase">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Car</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-6 py-4">{b.email}</td>
                  <td className="px-6 py-4">{b.brand} {b.model}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    {b.status === "pending" && (
                      <>
                        <ActionBtn label="Approve" onClick={() => updateBookingStatus(b.id, "approved")} />
                        <ActionBtn label="Reject" danger onClick={() => updateBookingStatus(b.id, "rejected")} />
                      </>
                    )}
                    {b.status === "paid" && (
                      <ActionBtn label="Mark Delivered" onClick={() => updateBookingStatus(b.id, "delivered")} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, highlight }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className={`text-4xl font-bold mt-2 ${highlight ? "text-green-400" : ""}`}>
        {value}
      </h2>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl mb-16">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-400/20 text-yellow-400",
    approved: "bg-green-400/20 text-green-400",
    paid: "bg-blue-400/20 text-blue-400",
    delivered: "bg-purple-400/20 text-purple-400",
    rejected: "bg-red-400/20 text-red-400",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

function ActionBtn({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition
        ${danger
          ? "bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
          : "bg-white/20 text-white hover:bg-white hover:text-black"
        }`}
    >
      {label}
    </button>
  );
}
