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
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCar({ ...car, [e.target.name]: e.target.value });
  };

  /* ================= IMAGE VALIDATION ================= */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = /image\/(jpeg|jpg|png|webp)/;

    // ❌ Reject non-image files
    const invalidFiles = files.filter(
      (file) => !allowedTypes.test(file.type)
    );

    if (invalidFiles.length > 0) {
      alert(
        "Only image files are allowed (JPG, JPEG, PNG, WEBP). Documents are not permitted."
      );
      e.target.value = null;
      setImages([]);
      setPreview([]);
      return;
    }

    setImages(files);

    // preview images
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreview(previews);
  };

  /* ================= CLOUDINARY UPLOAD ================= */
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one valid image.");
      return;
    }

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
      setPreview([]);
    } catch (error) {
      console.error(error);
      alert("Error adding car");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">

        <h3 className="text-2xl font-bold text-center mb-6">
          Add New Car
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          <input
            name="brand"
            value={car.brand}
            onChange={handleChange}
            placeholder="Brand"
            required
            className="border px-4 py-2 rounded-lg"
          />

          <input
            name="model"
            value={car.model}
            onChange={handleChange}
            placeholder="Model"
            required
            className="border px-4 py-2 rounded-lg"
          />

          <input
            type="number"
            name="year"
            value={car.year}
            onChange={handleChange}
            placeholder="Year"
            required
            className="border px-4 py-2 rounded-lg"
          />

          <input
            type="number"
            name="price"
            value={car.price}
            onChange={handleChange}
            placeholder="Price"
            required
            className="border px-4 py-2 rounded-lg"
          />

          {/* IMAGE UPLOAD */}
          <div className="sm:col-span-2">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full border p-2 rounded-lg"
            />

            {/* PREVIEW */}
            {preview.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {preview.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="preview"
                    className="h-24 w-full object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}
          </div>

          <textarea
            name="description"
            value={car.description}
            onChange={handleChange}
            placeholder="Description"
            rows="3"
            className="sm:col-span-2 border px-4 py-2 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className={`sm:col-span-2 py-3 rounded-lg font-semibold ${
              loading
                ? "bg-gray-400"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            {loading ? "Uploading..." : "Add Car"}
          </button>
        </form>
      </div>
    </div>
  );
}
