"use client"
import React, { useRef } from 'react'
import styles from '../styles/allcss.module.css'
import { useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import axios from 'axios';
import { authActions } from '@/Store/Auth';
import { useStore, useSelector } from 'react-redux';
import { Bree_Serif , Ubuntu } from 'next/font/google';

const bree_serif = Bree_Serif({
  weight: '400',
  subsets: ['latin'],
})

const ubuntu = Ubuntu({
  weight: '400',
  subsets: ['latin'],
})

const LogIn = () => {

  const port_uri = (process.env.PORT_URL)

  const store = useStore()

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)

    if (isLoggedIn === true) {
      if (typeof window !== 'undefined') {
        window.location.href = '/Posts'
      }
  }
  
  const [showPassword, setShowPassword] = useState(false);
  const SignInEmailOrPhone = useRef()
  const SignInPassword = useRef()
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault()
    const emailOrPhone = SignInEmailOrPhone.current.value.toLowerCase()
    const password = SignInPassword.current.value
    try {
      const response = await axios.post(`${port_uri}app/user/log-in`, {
        emailOrPhone: emailOrPhone,
        password: password
      })
      localStorage.setItem('id', response.data.id)
      localStorage.setItem('token', response.data.token)
      store.dispatch(authActions.logIn())
      setIsLoading(true)
      toast.success("Log In Success Full")
      if (typeof window !== 'undefined') {
        window.location.href = '/Posts'
      }
      SignInEmailOrPhone.current.value = " "
      SignInPassword.current.value = " "
    } catch (error) {
      console.log(error)
      if (error.response) {
        toast.error(error.response.data.message)
        setIsLoading(false)
      } else {
        toast.error('Error Occurred While Sending Request')
        setIsLoading(false)
      }
    }
  };

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className={`${styles.loader}`}></div>;
      </div>
    ) 
  }

  return (
    <div className='h-screen flex justify-center items-center'>
      <div className="border border-[#8d8d8d] p-5 rounded-[20px] bg-white">
        <div className={`text-xl font-bold mb-5 relative pl-8 ${styles.title} ${ubuntu.className}`}>LogIn to your account</div>
        <form className="max-w-[300px] flex flex-col gap-5" onSubmit={submitHandler}>

          <div className="relative">
            <input
              required
              type="text tel"
              ref={SignInEmailOrPhone}
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
              Email / Phone Number
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

          <div className="w-full flex items-center gap-5">
            <button
              type="submit"
              className={`px-5 py-2.5 text-base uppercase tracking-[3px] rounded-lg border border-[#1034aa] border-b-[#90c2ff] bg-gradient-to-br from-[#0034de] to-[#006eff] text-white font-bold transition-all duration-200 shadow-[0px_2px_3px_#000d3848,inset_0px_4px_5px_#0070f0,inset_0px_-4px_5px_#002cbb] active:shadow-[inset_0px_4px_5px_#0070f0,inset_0px_-4px_5px_#002cbb] active:scale-[0.995] ${bree_serif.className}`}
            >
              Submit
            </button>
            <div className={`text-sm ${bree_serif.className}`}>
              New here?
              <Link href='/SignIn' className="text-blue-600 cursor-pointer ml-1">Sign In</Link>
            </div>
          </div>
          
        </form>
      </div>

    </div>
  )
}

export default LogIn