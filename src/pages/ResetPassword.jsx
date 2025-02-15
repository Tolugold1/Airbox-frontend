// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { FiArrowLeft } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const [message, setMessage] = useState('');

  let [ searchParam, setSearchParam ] = useSearchParams();

  const onSubmit = async (data) => {
    let id = searchParam.get("userId");
    data.id = id;
    try {
      let response = await api.post('/api/auth/change-password', data);
      console.log("response", response);
      if (response.data.data == "Password changed successfully")
      toast(response.data.data, {
        position: "top-center"
      })
      setTimeout(() => {
        navigate("/login");
      },50)
    } catch (error) {
      console.error('Error during password reset:', error);
      setMessage('Error processing your request.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-4">

       {/* Back to Home Button */}
       <Link to="/login" className="absolute top-4 left-4 text-gray-400 hover:text-pink-400 flex items-center">
          <FiArrowLeft className="mr-2" /> Login
        </Link>
      <div className="bg-[#29293f] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center">Sign In</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {/* Username / Email Field */}
          <div className="mb-4">
            <label className="block text-gray-400">Password:</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-2 bg-[#1a1a2e] text-white rounded border border-gray-600 focus:border-pink-500 focus:ring focus:ring-pink-500 outline-none"
              {...register('password', { required: 'Password is required' })}
              placeholder="Enter your new password"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-400">Confirm Password:</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-2 bg-[#1a1a2e] text-white rounded border border-gray-600 focus:border-pink-500 focus:ring focus:ring-pink-500 outline-none"
              {...register('confirmPassword', { required: 'ConfirmPassword is required' })}
              placeholder="Enter confirm password"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 py-2 rounded text-white font-semibold hover:opacity-90"
          >
            Change Password
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ResetPasswordPage;
