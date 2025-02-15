// src/pages/BusinessDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Link } from 'react-router-dom';
import BusinessSideBar from './businessSideBar';
// ✅ Register Chart.js components
// ✅ Register all required ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);
import { ToastContainer, toast } from 'react-toastify';
import { getBusinessProfile } from '../store/getBusinessProfile';
import { getBusinessBooking, setBusinessBooking } from '../store/getBusinessBookings';
import { getBusinessAnalytics } from '../store/businessAnalytics';
// import { getBusinessAnalytics } from '../store/';
import { useDispatch, useSelector } from 'react-redux';
import { MdArrowDropDown } from "react-icons/md";
import { AiFillEdit } from "react-icons/ai";

const BusinessDashboard = () => {
  let dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [bookableItems, setBookableItems] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  const [ edit, setEdit ] = useState(false);

  let { businessProfile, status, businessProfileError } = useSelector((state) => state.getBusinessProfile);
  const [period, setPeriod] = useState("Daily"); // Default selection
  const [isOpen, setIsOpen] = useState(false); // Dropdown state
  const [ schedule, setSchedule ] = useState(0);
  const [ cancel, setCancel ] = useState(0);
  const [ complete, setComplete ] = useState(0);
  const [bookings, setBookings] = useState({
    status: "",
    bookingId: "",
  });


  const handleSelect = (value) => {
    setPeriod(value);
    setIsOpen(false); // Close dropdown after selection
  };

  const  analyticsStore = useSelector((state) => state.getBusinessAnalytics);

  let businessBooking  = useSelector((state) => state.getBusinessBooking);

  useEffect(() => {
    if (businessProfile !== null) {
      dispatch(getBusinessAnalytics({businessId: businessProfile?._id, timeframe: period}));
    }
  }, [period])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const profileResponse = await api.get('/api/business/get-profile');
        const profileResponse = await dispatch(getBusinessProfile())
        console.log("profileResponse", profileResponse)
        if (profileResponse.payload == undefined) {
          // it means no profile exist
          // redirect to profile page
          toast("Please complete your profile to continue.", {
            position: "top-center",
          });
          window.location.href = "/business-profile";
        }
        setProfile(profileResponse.data);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    if (businessProfile == null) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    // const itemsResponse = await api.get('/api/booking/get-business-bookings');
    const getAllNecessaryThing = async () => {
      const [ itemsResponse, analyticsResponse] = await Promise.all([
        dispatch(getBusinessBooking(businessProfile?._id)), 
        dispatch(getBusinessAnalytics({businessId: businessProfile?._id, timeframe: period}))
      ]);
      setBookableItems(itemsResponse.data);
  
      // const analyticsResponse = await dispatch(getBusinessAnalytics({businessId: businessProfile?._id, timeframe: period}));
      setAnalytics(analyticsResponse.payload.formattedData);
  
      setSchedule(analyticsResponse.payload.overallAnalytics?.TotalScheduledBooking);
  
      setCancel(analyticsResponse.payload.overallAnalytics?.TotalCancelledBooking);
  
      setComplete(analyticsResponse.payload.overallAnalytics?.TotalCompletedBooking);
    }
    if (businessProfile !== null) {
      getAllNecessaryThing();
    }
  }, [businessProfile]);

  // Handler to add a new bookable item
  const onEditBooking = async (data) => {
    try {
      setEdit(true)
      setBookings({ bookingId: data._id, status: "cancelled" });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleChange = (e) => {
    setBookings({ ...bookings, [e.target.name]: e.target.value });
  };

  const EditBookingSchedule = async () => {
    try {
      let update = await api.post("/api/booking/update-booking-by-business", bookings);
      console.log("update", update);
      if (update.data.data !== null && update.data.data.length > 0) {
        dispatch(setBusinessBooking(update.data.data));
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  const barChartRef = useRef(null);
  const lineChartRef  = useRef(null);

  // Clean up charts on unmount
  useEffect(() => {
    return () => {
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
    };
  }, []);

  const bookingData = {
    // labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    labels: analytics.map((data) => data.date),
    datasets: [
      {
        label: "Total Bookings",
        backgroundColor: "#2D85DE",
        data: analytics?.map((data) => data.totalBookings), //[80, 90, 30, 60, 50, 100, 70],
      },
      {
        label: "Total Scheduled",
        backgroundColor: "#E74C3C",
        data: analytics?.map((data) => data.scheduledBookings) // [20, 25, 10, 15, 20, 35, 15],
      },
      {
        label: "Total Completed",
        backgroundColor: "#3BAF6F",
        data: analytics?.map((data) => data.completedBookings) // [20, 25, 10, 15, 20, 35, 15],
      },
      {
        label: "Total Cancelled",
        backgroundColor: "#FF9800",
        data: analytics?.map((data) => data.cancelledBookings) // [20, 25, 10, 15, 20, 35, 15],
      },
    ],
  };

  // ✅ Corrected Data for Line Chart
  const lineChartData = {
    labels: analytics.map((data) => data.date),
    datasets: [
      {
        label: "Total Bookings",
        data: analytics.map((data) => data.totalBookings),
        borderColor: "#2D85DE",
        backgroundColor: "rgba(45, 133, 222, 0.2)",
        fill: true,
      },
      {
        label: "Scheduled",
        data: analytics.map((data) => data.scheduledBookings),
        borderColor: "#E74C3C",
        backgroundColor: "rgba(231, 76, 60, 0.2)",
        fill: true,
      },
      {
        label: "Completed",
        data: analytics.map((data) => data.completedBookings),
        borderColor: "#3BAF6F",
        backgroundColor: "rgba(59, 175, 111, 0.2)",
        fill: true,
      },
      {
        label: "Cancelled",
        data: analytics.map((data) => data.cancelledBookings),
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.2)",
        fill: true,
      },
    ],
  };
  const analyticsData = {
    labels: analytics.map((data) => data.date) || ["Confirm", "Pending", "Cancel", "Success"],
    datasets: [
      {
        data: [35, 35, 15, 15],
        backgroundColor: ["#4A90E2", "#FF9800", "#E74C3C", "#2ECC71"],
      },
    ],
  };
   console.log("businessBooking", businessBooking.businessBookings);
   businessBooking = businessBooking.businessBookings;

   const formatData = (isoDate) => {
    const dateObj = new Date(isoDate);
  
    // Format to display "February 24"
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric"
    });
    return formattedDate;
  }
  
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      {/* <div className=''>
        <BusinessSideBar />
      </div> */}

      {/* Main Dashboard */}
      <main className="flex-1 p-6 bg-gray-100">
        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-gray-500">Scheduled</h3>
            <p className="text-xl font-bold">{schedule}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-gray-500">Cancelled</h3>
            <p className="text-xl font-bold">{cancel}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-gray-500">Completed</h3>
            <p className="text-xl font-bold">{complete}</p>
          </div>
          <div className="p-4 shadow rounded-lg">
          <div className="relative inline-block text-left">
          {/* Dropdown Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center justify-between min-w-[120px] hover:bg-pink-600"
          >
            {period} <MdArrowDropDown className='w-[30px] h-[30px]' />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute mt-2 bg-white text-gray-800 shadow-md rounded-lg w-40">
              <button
                onClick={() => handleSelect("Daily")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                Daily
              </button>
              <button
                onClick={() => handleSelect("Weekly")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                Weekly
              </button>
              <button
                onClick={() => handleSelect("Monthly")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                Monthly
              </button>
            </div>
          )}
        </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid vsm:grid-col-2 md:grid-cols-4 gap-6 mt-6">
          {/* Weekly Bookings */}
          <div className="bg-white shadow rounded-lg p-6 col-span-2">
            <h3 className="text-lg font-bold text-gray-700">This Week Booking</h3>
            <Bar ref={barChartRef} key={JSON.stringify(bookingData)} data={bookingData} />
          </div>

          {/* Analytics */}
          <div className="bg-white shadow rounded-lg p-6 col-span-2">
            <h3 className="text-lg font-bold text-gray-700">Analytics</h3>
            <Line ref={lineChartRef} key={JSON.stringify(lineChartData)} data={lineChartData} />
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-700">Recent Bookings</h3>
          <table className="w-full mt-4">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Customer Name</th>
                <th className="py-3 px-6 text-left">Appointment date</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Service Name</th>
                <th className="py-3 px-6 text-left">Edit Booking</th>
                {/* <th className="py-3 px-6 text-left">Payment Method</th> */}
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {businessBooking?.map(booking => {
                return (
                  <tr className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{booking.clientProfileId?.Fullname}</td>
                    <td className="py-3 px-6 text-left">{formatData(booking?.appointmentDate)}</td>
                    <td className="py-3 px-6 text-left text-green-500">{booking?.status}</td>
                    <td className="py-3 px-6 text-left">{booking.bookedItemId?.name}</td>
                    <td className="py-3 px-6 text-left" onClick={() => onEditBooking(booking)}><AiFillEdit /></td>
                    {/* <td className="py-3 px-6 text-left">{booking.paymentMethod}</td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {edit && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Book Service</h2>
              <form onSubmit={EditBookingSchedule} className="space-y-4">
                <input type="hidden" name="bookedItemId" value={bookings.bookingId} />
  
                <label className="block text-gray-700">Booking Status:</label>
                <select
                  name="status"
                  // value="cancelled"
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
  {/* 
                <label className="block text-gray-700">Appointment Date:</label>
                <input
                  type="date"
                  name="appointmentDate"
                  className="w-full p-2 border border-gray-300 rounded"
                  onChange={handleChange}
                  required
                /> */}
  
                <button
                  type="submit"
                  className="w-full bg-pink-500 py-2 rounded-md text-white hover:bg-pink-700"
                >
                  Confirm Booking
                </button>
              </form>
              <button
                onClick={() => setEdit(false)}
                className="w-full mt-2 bg-gray-500 py-2 rounded-md text-white hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
          )}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

export default BusinessDashboard;
