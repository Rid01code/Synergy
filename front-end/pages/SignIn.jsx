"use client"
import { useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../styles/allcss.module.css'
import VerifyOTP from './VerifyOTP';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Bree_Serif , Ubuntu } from 'next/font/google';

const bree_serif = Bree_Serif({
  weight: '400',
  subsets: ['latin'],
})

const ubuntu = Ubuntu({
  weight: '400',
  subsets: ['latin'],
})


const SignIn = () => {

  const port_uri = process.env.PORT_URL

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  console.log(isLoggedIn)

    if (isLoggedIn === true) { 
      if (typeof window !== 'undefined') {
        window.location.href = '/Posts'
    }
  }


  const [showPassword, setShowPassword] = useState(false);
  const [isOpenPopUp, setIsOpenPopUp] = useState(false)
  const SignInName = useRef();
  const SignInEmail = useRef();
  const SignInPhone = useRef();
  const SignInPassword = useRef();
  const SignInReEnterPassword = useRef();
  

  const getOtp = async (event) => {
    try {
      event.preventDefault()
      const password = SignInPassword.current.value
      const reEnteredPassword = SignInReEnterPassword.current.value
      const email = SignInEmail.current.value
      if (password !== reEnteredPassword) {
        alert('Password does not match')
        SignInPassword.current.value = '';
        SignInReEnterPassword.current.value = '';
      } else {
        await axios.post(`${port_uri}app/user/get-otp`, {
          email: email
        })
        toast.success("OTP send to your email")
        setIsOpenPopUp(true)
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Error Occurred While Sending Request')
      }
    }
  };
  
  return (
    
    <div className='h-screen flex justify-center items-center'>
      <div className="border border-[#8d8d8d] p-5 rounded-[20px] bg-white">


        <div className={`text-xl font-bold mb-5 relative pl-8 ${styles.title} ${ubuntu.className}`}>SignIn to your account</div>

        <form className="max-w-[300px] flex flex-col gap-5">
          <div className="relative">
            <input
              required
              type="text"
              ref={SignInName}
              className="w-full px-4 py-2.5 text-base rounded-lg border border-[#8d8d8d] focus:outline-none focus:border-[#0034de] peer"
            />
            <label
              htmlFor="username"
              className="absolute text-[#8d8d8d] left-4 transform transition-all duration-300 pointer-events-none 
            peer-focus:text-[#0034de] peer-focus:bg-white peer-focus:px-1 peer-focus:text-sm peer-focus:font-bold peer-focus:tracking-wide
            peer-focus:-translate-y-1/2 peer-focus:-translate-x-2 peer-focus:top-0
            peer-valid:text-[#0034de] peer-valid:bg-white peer-valid:px-1 peer-valid:text-sm peer-valid:font-bold peer-valid:tracking-wide
            peer-valid:-translate-y-1/2 peer-valid:-translate-x-2 peer-valid:top-0"
            >
              Full Name
            </label>
          </div>

          <div className="relative">
            <input
              required
              type="email"
              ref={SignInEmail}
              className="w-full px-4 py-2.5 text-base rounded-lg border border-[#8d8d8d] focus:outline-none focus:border-[#0034de] peer"
            />
            <label
              htmlFor="email"
              className="absolute text-[#8d8d8d] left-4 transform transition-all duration-300 pointer-events-none 
            peer-focus:text-[#0034de] peer-focus:bg-white peer-focus:px-1 peer-focus:text-sm peer-focus:font-bold peer-focus:tracking-wide
            peer-focus:-translate-y-1/2 peer-focus:-translate-x-2 peer-focus:top-0
            peer-valid:text-[#0034de] peer-valid:bg-white peer-valid:px-1 peer-valid:text-sm peer-valid:font-bold peer-valid:tracking-wide
            peer-valid:-translate-y-1/2 peer-valid:-translate-x-2 peer-valid:top-0"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              required
              type="tel"
              ref={SignInPhone}
              className="w-full px-4 py-2.5 text-base rounded-lg border border-[#8d8d8d] focus:outline-none focus:border-[#0034de] peer"
            />
            <label
              htmlFor="email"
              className="absolute text-[#8d8d8d] left-4 transform transition-all duration-300 pointer-events-none 
            peer-focus:text-[#0034de] peer-focus:bg-white peer-focus:px-1 peer-focus:text-sm peer-focus:font-bold peer-focus:tracking-wide
            peer-focus:-translate-y-1/2 peer-focus:-translate-x-2 peer-focus:top-0
            peer-valid:text-[#0034de] peer-valid:bg-white peer-valid:px-1 peer-valid:text-sm peer-valid:font-bold peer-valid:tracking-wide
            peer-valid:-translate-y-1/2 peer-valid:-translate-x-2 peer-valid:top-0"
            >
              Phone Number
            </label>
          </div>

          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              ref={SignInPassword}
              className="w-full px-4 py-2.5 text-base rounded-lg border border-[#8d8d8d] focus:outline-none focus:border-[#0034de] peer"
            />
            <label
              htmlFor="password"
              className="absolute text-[#8d8d8d] left-4 transform transition-all duration-300 pointer-events-none 
            peer-focus:text-[#0034de] peer-focus:bg-white peer-focus:px-1 peer-focus:text-sm peer-focus:font-bold peer-focus:tracking-wide
            peer-focus:-translate-y-1/2 peer-focus:-translate-x-2 peer-focus:top-0
            peer-valid:text-[#0034de] peer-valid:bg-white peer-valid:px-1 peer-valid:text-sm peer-valid:font-bold peer-valid:tracking-wide
            peer-valid:-translate-y-1/2 peer-valid:-translate-x-2 peer-valid:top-0"
            >
              Password
            </label>
            <button
              type="button"
              className="absolute top-2.5 right-3 text-xl cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div className="relative">
            <input
              required
              type="password"
              ref={SignInReEnterPassword}
              className="w-full px-4 py-2.5 text-base rounded-lg border border-[#8d8d8d] focus:outline-none focus:border-[#0034de] peer"
            />
            <label
              htmlFor="password"
              className="absolute text-[#8d8d8d] left-4 transform transition-all duration-300 pointer-events-none 
            peer-focus:text-[#0034de] peer-focus:bg-white peer-focus:px-1 peer-focus:text-sm peer-focus:font-bold peer-focus:tracking-wide
            peer-focus:-translate-y-1/2 peer-focus:-translate-x-2 peer-focus:top-0
            peer-valid:text-[#0034de] peer-valid:bg-white peer-valid:px-1 peer-valid:text-sm peer-valid:font-bold peer-valid:tracking-wide
            peer-valid:-translate-y-1/2 peer-valid:-translate-x-2 peer-valid:top-0"
            >
              Re Enter Password
            </label>
          </div>

          <div className="w-full flex items-center gap-5">
            <button
              type="submit"
              className={`px-2 py-2.5 text-base uppercase tracking-[3px] rounded-lg border border-[#1034aa] border-b-[#90c2ff] bg-gradient-to-br from-[#0034de] to-[#006eff] text-white font-bold transition-all duration-200 shadow-[0px_2px_3px_#000d3848,inset_0px_4px_5px_#0070f0,inset_0px_-4px_5px_#002cbb] active:shadow-[inset_0px_4px_5px_#0070f0,inset_0px_-4px_5px_#002cbb] active:scale-[0.995] ${bree_serif.className}`}
              onClick={getOtp}
            >
              Get OTP
            </button>

            {
              isOpenPopUp && <VerifyOTP SignInName={SignInName} SignInPhone={SignInPhone} SignInEmail={SignInEmail} SignInPassword={SignInPassword} setIsOpenPopUp={setIsOpenPopUp} />
            }

            <div className={`${bree_serif.className} text-sm`}>
              All ready have an account ?
              <Link href='/LogIn' className="text-blue-600 cursor-pointer ml-1">Log In</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
    
  )
}

export default SignIn;