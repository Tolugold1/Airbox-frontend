import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearClientprofile, updateProfile } from "../store/getClientProfile";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createClientProfile, setClientProfile } from "../store/createClientProfile";
import { getClientProfile } from "../store/getClientProfile";
import api from "../services/api";
import { BsArrowReturnLeft } from "react-icons/bs";
import { logout } from "../store/authSlice";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { IoPersonSharp } from "react-icons/io5";

const ClientProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clientProfile, status, error } = useSelector((state) => state.getClientProfile);
  const [formData, setFormData] = useState({
    Fullname: "",
    Address: "",
    Email: "",
    phone_number: "",
    About: "",
  });

  useEffect(() => {
    dispatch(getClientProfile());
  }, [dispatch]);

  useEffect(() => {
    if (clientProfile) {
      setFormData(clientProfile);
    }
  }, [clientProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        let response
        if (!clientProfile) {
            response = await dispatch(createClientProfile(formData));
        } else {
          response = await api.put("/api/client/update-profile", formData);
        }
        console.log("response", response);
        if (response.data.data !== null) {
          dispatch(setClientProfile(response.data.data))
          // redirect to profile page
          toast("Profile created successfully.", {
            position: "top-center",
          });
          setFormData({
            Fullname: "",
            Address: "",
            Email: "",
            phone_number: "",
            About: "",
          })
        } else {
            dispatch(clearClientprofile());
        }
    } catch (error) {
      console.log("error", error);

    }
  };

  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    localStorage.removeItem("jwt");
    navigate("/");
    dispatch(logout());
  }


  return (
    <div className="min-h-screen bg-[#f5f6fa] text-gray-900 flex">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-white p-6 shadow-lg">
        <h2 className="hidden sm:flex text-xl font-bold text-purple-600">Client Dashboard</h2>
        <nav className="mt-6">
          <Link to="/client-dashboard" className="flex md:p-3 rounded-md text-gray-700 hover:bg-gray-200">
            <div className="flex my-3 items-center"><FaHome className="m-0 md:mr-2 w-[50px] h-[25px]"  /> <span className="hidden md:flex">Overview</span></div>
          </Link>
          <Link to="/client-bookings" className="flex md:p-3 rounded-md text-gray-700 hover:bg-gray-200">
          <div className="flex my-3 items-center">
            <SlCalender className="mr-2 w-[50px] h-[25px]" /> <span className="hidden md:flex">My Bookings</span>
            </div>
          </Link>
          <Link to="/client-profile" className="flex md:p-3 rounded-md text-gray-700 hover:bg-gray-200">
          <div className="flex items-center my-3"><IoPersonSharp  className="mr-2 w-[50px] h-[25px]" /> <span className="hidden md:flex">Profile</span></div>
          </Link>
          <Link to="#" onClick={handleLogout} className="flex md:p-3 rounded-md text-gray-700 hover:bg-gray-200">
            <div className="flex items-center my-3 "><BsArrowReturnLeft className="mr-0 md:mr-2 w-[50px] h-[25px]" /> <span className="hidden md:flex">Logout</span></div>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">My Profile</h1>

        {/* Profile Information */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-lg font-semibold text-gray-700">Profile Details</h2>

          {status === "loading" && <p>Loading profile...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {clientProfile && (
            <div className="mt-4 text-gray-700">
              <p><strong>Full Name:</strong> {clientProfile.Fullname}</p>
              <p><strong>Email:</strong> {clientProfile.Email}</p>
              <p><strong>Phone Number:</strong> {clientProfile.Phone_number}</p>
              <p><strong>Address:</strong> {clientProfile.Address}</p>
              <p><strong>About:</strong> {clientProfile.About}</p>
            </div>
          )}
        </div>

        {/* Edit Profile Form */}
        <h2 className="text-lg font-semibold text-gray-700 mt-6">Update Profile</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mt-4 space-y-4">
          <input
            type="text"
            name="Fullname"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />

          <input
            type="email"
            name="Email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />

          <input
            type="text"
            name="Phone_number"
            placeholder="Phone Number"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />

          <input
            type="text"
            name="Address"
            placeholder="Address"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />

          <textarea
            name="About"
            placeholder="About Yourself"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />

          <button
            type="submit"
            className="w-full bg-purple-600 py-2 rounded-md text-white hover:bg-purple-700"
          >
            Save Changes
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ClientProfilePage;
