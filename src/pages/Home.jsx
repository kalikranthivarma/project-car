import { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // ✅ ADDED
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
  const [activeIndex, setActiveIndex] = useState({});
  const [expanded, setExpanded] = useState({});

  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ================= SEARCH PARAMS (ADDED ONLY) ================= */
  const [searchParams] = useSearchParams(); // ✅ ADDED
  const searchQuery = searchParams.get("search")?.toLowerCase() || ""; // ✅ ADDED

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

  /* ================= FILTER LOGIC (ADDED ONLY) ================= */
  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(searchQuery) ||
      car.model.toLowerCase().includes(searchQuery)
  );

  /* ================= CAROUSEL CONTROLS ================= */
  const nextImage = (carId, length) => {
    setActiveIndex((prev) => ({
      ...prev,
      [carId]: ((prev[carId] || 0) + 1) % length,
    }));
  };

  const prevImage = (carId, length) => {
    setActiveIndex((prev) => ({
      ...prev,
      [carId]: ((prev[carId] || 0) - 1 + length) % length,
    }));
  };

  /* ================= VIEW MORE (ADMIN ONLY) ================= */
  const viewMore = (carId) => {
    setExpanded((prev) => ({
      ...prev,
      [carId]: true,
    }));
  };

  /* ================= BUY NOW ================= */
  const handleBuyNow = async (car) => {
    if (!user) {
      navigate("/login");
      return;
    }

    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      userEmail: user.email,
      customerName: user.displayName || "Customer",
      carId: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
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
      customerName: user.displayName || "Customer",
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

      {/* ================= HERO SECTION ================= */}
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

          <div className="mt-10">
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

              {filteredCars.length === 0 ? (
                <p className="col-span-full text-center text-slate-400">
                  No cars found for your search
                </p>
              ) : (
                filteredCars.map((car) => {
                  const images =
                    car.images?.length > 0 ? car.images : [FALLBACK_IMAGE];
                  const current = activeIndex[car.id] || 0;
                  const isExpanded = expanded[car.id];

                  return (
                    <div
                      key={car.id}
                      className="bg-[#020617] rounded-2xl border border-white/10 shadow-xl overflow-hidden"
                    >
                      {/* IMAGE */}
                      <div className="relative h-60 group">
                        <img
                          src={images[current]}
                          alt={`${car.brand} ${car.model}`}
                          className="h-full w-full object-cover"
                        />

                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                prevImage(car.id, images.length)
                              }
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white"
                            >
                              ‹
                            </button>
                            <button
                              onClick={() =>
                                nextImage(car.id, images.length)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white"
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>

                      {/* DETAILS */}
                      <div className="p-6">
                        <p className="text-sm text-slate-400">{car.brand}</p>

                        <h3 className="text-xl font-semibold mt-1">
                          {car.brand} {car.model}
                        </h3>

                        <p
                          className={`text-slate-300 text-sm mt-2 ${
                            isExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          {car.description}
                        </p>

                        {role === "admin" && !isExpanded && (
                          <button
                            onClick={() => viewMore(car.id)}
                            className="mt-4 px-6 py-2 bg-white text-black font-semibold rounded-lg"
                          >
                            View More
                          </button>
                        )}

                        {role !== "admin" && (
                          <div className="mt-6 flex gap-3">
                            <button
                              onClick={() => handleTestRide(car)}
                              className="flex-1 px-5 py-2.5 bg-white text-black font-semibold rounded-lg"
                            >
                              Book Test Ride
                            </button>
                            <button
                              onClick={() => handleBuyNow(car)}
                              className="flex-1 px-5 py-2.5 bg-white text-black font-semibold rounded-lg"
                            >
                              Buy Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

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
