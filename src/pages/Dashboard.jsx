import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
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
  const [testRides, setTestRides] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      const carsSnap = await getDocs(collection(db, "cars"));
      const enquiriesSnap = await getDocs(collection(db, "enquiries"));

      const bookingsSnap = await getDocs(
        query(collection(db, "bookings"), orderBy("createdAt", "desc"))
      );

      const testRideSnap = await getDocs(
        query(collection(db, "testRides"), orderBy("createdAt", "desc"))
      );

      setCars(carsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setEnquiries(enquiriesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBookings(bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTestRides(testRideSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= UPDATE STATUS ================= */
  const updateBookingStatus = async (id, status) => {
    await updateDoc(doc(db, "bookings", id), { status });
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status } : b))
    );
  };

  const updateTestRideStatus = async (id, status) => {
    await updateDoc(doc(db, "testRides", id), { status });
    setTestRides(prev =>
      prev.map(tr => (tr.id === id ? { ...tr, status } : tr))
    );
  };

  /* ================= STATS ================= */
  const carsByBrand = cars.reduce((acc, car) => {
    acc[car.brand] = (acc[car.brand] || 0) + 1;
    return acc;
  }, {});

  const revenueByBrand = bookings
    .filter(b => b.status === "paid")
    .reduce((acc, b) => {
      acc[b.brand] = (acc[b.brand] || 0) + 1;
      return acc;
    }, {});

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

        <ChartCard title="Cars by Brand">
          <Bar data={brandChart} options={chartOptions} />
        </ChartCard>

        <ChartCard title="Payment Revenue (Paid Bookings)">
          {Object.keys(revenueByBrand).length === 0 ? (
            <p className="text-slate-400 text-center">No paid bookings yet</p>
          ) : (
            <Bar data={revenueChart} options={chartOptions} />
          )}
        </ChartCard>

        {/* ================= BOOKING MANAGEMENT ================= */}
        <h2 className="text-2xl font-semibold mb-6 mt-16">
          Booking Management
        </h2>

        <TableWrapper>
          <thead>
            <tr>
              <Th>Car</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <Td>
                  <CarInfo car={b} />
                </Td>
                <Td>
                  <p className="font-semibold">{b.customerName || "Customer"}</p>
                  <p className="text-xs text-slate-400">📧 {b.userEmail}</p>
                </Td>
                <Td>
                  <StatusBadge status={b.status} />
                </Td>
                <Td>
                  {b.status === "pending" && (
                    <>
                      <ActionBtn label="Approve" onClick={() => updateBookingStatus(b.id, "approved")} />
                      <ActionBtn label="Reject" danger onClick={() => updateBookingStatus(b.id, "rejected")} />
                    </>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>

        {/* ================= TEST RIDE REQUESTS ================= */}
        <h2 className="text-2xl font-semibold mb-6 mt-16">
          Test Ride Requests
        </h2>

        <TableWrapper>
          <thead>
            <tr>
              <Th>Car</Th>
              <Th>Customer</Th>
              <Th>Requested On</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {testRides.map(tr => (
              <tr key={tr.id}>
                <Td>
                  <CarInfo car={tr} />
                </Td>
                <Td>
                  <p className="font-semibold">{tr.customerName || "Customer"}</p>
                  <p className="text-xs text-slate-400">📧 {tr.userEmail}</p>
                </Td>
                <Td className="text-xs text-slate-400">
                  {tr.createdAt?.toDate().toLocaleString()}
                </Td>
                <Td>
                  <StatusBadge status={tr.status} />
                </Td>
                <Td>
                  {tr.status === "requested" && (
                    <>
                      <ActionBtn label="Approve" onClick={() => updateTestRideStatus(tr.id, "approved")} />
                      <ActionBtn label="Reject" danger onClick={() => updateTestRideStatus(tr.id, "rejected")} />
                    </>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>

      </div>
    </div>
  );
}

/* ================= SHARED COMPONENTS ================= */

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-xl border border-white/10 mb-16">
    <table className="min-w-full bg-white/5 text-sm">{children}</table>
  </div>
);

const Th = ({ children }) => (
  <th className="px-6 py-3 bg-white/10 text-slate-300 uppercase">
    {children}
  </th>
);

const Td = ({ children }) => (
  <td className="px-6 py-4">{children}</td>
);

const CarInfo = ({ car }) => (
  <div className="flex items-center gap-4">
    <img
      src={car.images?.[0] || FALLBACK_IMAGE}
      alt={car.brand}
      className="w-20 h-14 object-cover rounded-lg border border-white/10"
    />
    <div>
      <p className="font-semibold">
        {car.brand} {car.model}
      </p>
      <p className="text-xs text-slate-400">{car.year}</p>
    </div>
  </div>
);

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
    requested: "bg-yellow-400/20 text-yellow-400",
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
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition mr-2
        ${
          danger
            ? "bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
            : "bg-white/20 text-white hover:bg-white hover:text-black"
        }`}
    >
      {label}
    </button>
  );
}
