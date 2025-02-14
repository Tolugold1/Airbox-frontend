import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getClientBookingItem } from "../store/getClientBookings"
import { BsArrowReturnLeft } from "react-icons/bs";
import { logout } from "../store/authSlice";
import api from "../services/api.js"
import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clientBooking, status, error } = useSelector((state) => state.getClientBookingItem);

  const { clientProfile  } = useSelector((state) => state.getClientProfile);

  useEffect(() => {
    if (clientProfile !== null) {
      dispatch(getClientBookingItem(clientProfile._id));
    }
  }, [dispatch]);

  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    localStorage.removeItem("jwt");
    navigate("/");
    dispatch(logout());
}

const formatData = (isoDate) => {
  const dateObj = new Date(isoDate);

  // Format to display "February 24"
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  });
  return formattedDate;
}

console.log("Bookings", clientBooking)

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-gray-900 flex w-full">
      <div className="w-20 md:w-64 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold text-purple-600">Client Dashboard</h2>
        <nav className="mt-6">
          <Link to="/client-dashboard" className="block p-3 rounded-md text-gray-700 hover:bg-gray-200">🏠 <span className="hidden md:block">Overview</span></Link>
          <Link to="/client-bookings" className="block p-3 rounded-md text-gray-700 hover:bg-gray-200">📅 <span className="hidden md:block">My Bookings</span></Link>
          <Link to="/client-profile" className="block p-3 rounded-md text-gray-700 hover:bg-gray-200">👤 <span className="hidden md:block">Profile</span></Link>
          <Link to="#" onClick={handleLogout} className="block p-3 rounded-md text-gray-700 hover:bg-gray-200">
            <div className="flex items-center "><BsArrowReturnLeft className="mr-2 w-[50px] h-[25px]" /> <span className="hidden md:block">Logout</span></div>
          </Link>
        </nav>
      </div>

      <div className="min-h-screen bg-[#f5f6fa] text-gray-900 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Booking History</h1>
        </div>

        {status === "loading" && <p>Loading bookings...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {clientBooking?.map((booking) => (
            <div key={booking._id} className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold">{booking.bookedItemId.name}</h2>
              <p className="text-gray-600">Date: {formatData(booking.appointmentDate)}</p>
              <p><strong>Status:</strong> {booking.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
