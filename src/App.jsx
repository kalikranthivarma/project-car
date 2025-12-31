import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Bookings from "./pages/Bookings.jsx";
import AddCar from "./pages/AddCar.jsx";
import Enquiries from "./pages/Enquiries.jsx"
import Dashboard from "./pages/Dashboard.jsx";
import MyEnquiries from "./pages/MyEnquiries.jsx"

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/add-car" element={<AddCar />} />
        <Route path="/enquiries" element={<Enquiries />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myenquiries" element={<MyEnquiries />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;