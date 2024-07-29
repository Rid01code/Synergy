"use client"
import React, { useState, useRef } from 'react';
import styles from  "../styles/allcss.module.css"
import axios from 'axios';
import { toast } from 'react-toastify';
import { Bree_Serif , Ubuntu } from 'next/font/google';

const bree_serif = Bree_Serif({
  weight: '400',
  subsets: ['latin'],
})

const ubuntu = Ubuntu({
  weight: '400',
  subsets: ['latin'],
})

const VerifyOTP = ({ SignInName, SignInPhone, SignInEmail, SignInPassword, setIsOpenPopUp }) => {

  const port_uri = process.env.PORT_URL
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 3) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleClear = () => {
    setOtp(['', '', '', '']);
    inputRefs[0].current.focus();
  };

  const handleVerify = async (event) => {
    event.preventDefault()
    const otpValue = otp.join('');
    const name = SignInName.current.value
    const phone = SignInPhone.current.value
    const email = SignInEmail.current.value
    const password = SignInPassword.current.value
    try {
      await axios.post(`${port_uri}app/user/sign-in`, {
        name: name,
        email: email,
        phone: phone,
        password: password,
        otp: otpValue
      })
      setIsLoading(true)
      toast.success("Sign In Successfully")
      if (typeof window !== 'undefined') {
        window.location.href = '/posts'
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message)
        setIsLoading(false)
      } else {
        toast.error('Error occurred while sending request')
        setIsLoading(false)
      }
    }
  };

  const cross = () => {
    setIsOpenPopUp(false)
  }

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className={`${styles.loader}`}></div>;
      </div>
    ) 
  }

  return (
    <div className='flex justify-center items-center'>
      <div className={`font-sans max-w-[420px] p-6 flex flex-col items-center bg-white text-[#2e2e2e] border-2 border-[#000000] rounded-lg relative shadow-lg ${styles.OtpPage}`}>

        <button className="absolute right-2 top-2 bg-[#e1e1e1] text-[#f3f3f3] h-8 w-8 grid place-items-center rounded cursor-pointer font-semibold transition-all duration-500 hover:bg-[#fa5656] hover:text-white"
          onClick={cross}>
          X
        </button>
      
        <div className="mb-5 text-center">
          <h2 className={`text-2xl font-black ${ubuntu.className}`}>Two-Factor Verification</h2>
          <p className={`mt-2.5 text-base ${ubuntu.className}`}>Enter the two-factor authentication code provided by the authenticator app</p>
        </div>

        <div className="flex justify-between gap-2.5">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-10 w-10 text-center text-xl text-[#141414] rounded border-2 border-[#e1e1e1] bg-[#e1e1e1] outline-none focus:border-[#2e2e2e] focus:shadow-inner focus:scale-105 transition-all duration-500"
            />
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={handleVerify}
            className={`px-5 py-2.5 rounded text-base font-medium text-white bg-[#141414] border border-[#2e2e2e] transition-all duration-500 hover:bg-[#2e2e2e] ${bree_serif.className}`}
          >
            Verify
          </button>
          <button
            onClick={handleClear}
            className={`px-5 py-2.5 rounded text-base font-medium text-[#2e2e2e] border border-[#2e2e2e] transition-all duration-500 hover:text-[#fa5656] hover:border-[#fa5656] ${bree_serif.className}`}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP;