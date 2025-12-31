import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

const FALLBACK_IMAGE =
  "https://wallpapers.com/images/hd/bmw-images-hu28ebwv6hz1z3by.jpg";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ================= FETCH CARS ================= */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const snapshot = await getDocs(collection(db, "cars"));
        setCars(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchCars();
  }, []);

  /* ================= BUY NOW ================= */
  const handleBuyNow = async (car) => {
    if (!user) {
      navigate("/login");
      return;
    }

    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      userEmail: user.email,
      carId: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      description: car.description || "",
      images: car.images || [],
      status: "pending",
      createdAt: serverTimestamp(),
    });

    navigate("/bookings");
  };

  /* ================= TEST RIDE ================= */
  const handleTestRide = async (car) => {
    if (!user) {
      navigate("/login");
      return;
    }

    await addDoc(collection(db, "testRides"), {
      userId: user.uid,
      userEmail: user.email,
      carId: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      images: car.images || [],
      status: "requested",
      createdAt: serverTimestamp(),
    });

    alert("Test ride request submitted!");
    navigate("/bookings");
  };

  return (
    <div className="bg-[#020617] text-slate-100">

      {/* ================= HERO ================= */}
      <section
        className="relative min-h-screen flex items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${FALLBACK_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-black/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold">
            Own the <span className="text-white">Luxury</span>
          </h1>

          <p className="mt-6 max-w-xl text-slate-300">
            Buy or test drive premium BMW, Audi & Mercedes cars.
          </p>

          <div className="mt-10 flex gap-4">
            <a
              href="#cars"
              className="px-7 py-3 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition"
            >
              Explore Cars
            </a>
          </div>
        </div>
      </section>

      {/* ================= AVAILABLE CARS ================= */}
      <section id="cars" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-center mb-12">
            Available Cars
          </h2>

          {loading ? (
            <p className="text-center text-slate-400">Loading cars...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="bg-[#020617] rounded-2xl border border-white/10 shadow-xl hover:border-white/40 transition"
                >
                  {/* Image */}
                  <img
                    src={car.images?.[0] || FALLBACK_IMAGE}
                    onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                    alt={`${car.brand} ${car.model}`}
                    className="h-60 w-full object-cover rounded-t-2xl"
                  />

                  {/* Info */}
                  <div className="p-6">
                    <p className="text-sm text-slate-400">{car.brand}</p>

                    <h3 className="text-xl font-semibold mt-1">
                      {car.brand} {car.model}
                    </h3>

                    <p className="text-slate-300 text-sm mt-2 line-clamp-2">
                      {car.description}
                    </p>

                    {/* ACTIONS */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">

                      {/* TEST RIDE – CLEAR & VISIBLE */}
                      <button
                        onClick={() => handleTestRide(car)}
                        className="
                          flex-1
                          px-5 py-2.5
                          bg-white text-black
                          font-semibold
                          rounded-lg
                          hover:bg-slate-200
                          hover:scale-[1.03]
                          transition
                        "
                      >
                         Book Test Ride
                      </button>

                      {/* BUY NOW */}
                      <button
                        onClick={() => handleBuyNow(car)}
                        className="
                          flex-1
                          px-5 py-2.5
                          bg-white text-black
                          font-semibold
                          rounded-lg
                          hover:bg-slate-200
                          hover:scale-[1.03]
                          transition
                        "
                      >
                        Buy Now
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black py-8 text-center text-slate-400 text-sm">
        © {new Date().getFullYear()} Premium Cars
      </footer>
    </div>
  );
}
