import { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddCar() {
  const [car, setCar] = useState({
    brand: "",
    model: "",
    year: "",
    price: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCar({ ...car, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // 🔹 Upload images to Cloudinary
  const uploadImagesToCloudinary = async () => {
    const uploadedUrls = [];

    for (const image of images) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "cars-imgs");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dks1bmug9/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      uploadedUrls.push(data.secure_url);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrls = await uploadImagesToCloudinary();

      await addDoc(collection(db, "cars"), {
        ...car,
        year: Number(car.year),
        price: Number(car.price),
        images: imageUrls,
        status: "available",
        createdAt: serverTimestamp(),
      });

      alert("Car added successfully!");

      setCar({
        brand: "",
        model: "",
        year: "",
        price: "",
        description: "",
      });
      setImages([]);
    } catch (error) {
      console.error(error);
      alert("Error adding car");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-vector/dark-black-backdrop-with-abstract-silver-shape-design_1017-59595.jpg?semt=ais_hybrid&w=740&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* Card */}
      <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8">

        {/* Heading */}
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center">
          Add New Car
        </h3>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Brand
            </label>
            <input
              name="brand"
              value={car.brand}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Model
            </label>
            <input
              name="model"
              value={car.model}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Year
            </label>
            <input
              type="number"
              name="year"
              value={car.year}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={car.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
            />
          </div>

          {/* Image Upload */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Upload Car Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-dashed rounded-lg bg-white"
            />
            <p className="text-xs text-slate-400 mt-1">
              Upload multiple images (JPG / PNG)
            </p>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              value={car.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-black"
              }`}
            >
              {loading ? "Uploading..." : "Add Car"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
