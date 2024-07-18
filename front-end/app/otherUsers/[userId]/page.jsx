'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { LuUserCircle2 } from "react-icons/lu";
const page = () => {

  const port_uri = process.env.PORT_URL
  
  const [userName, setUserName] = useState(null)
  const [userProfilePic, setUserProfilePic] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [userPhone, setUserPhone] = useState(null)
  const [userBio, setUserBio] = useState(null)
  //get headers fot authorization
  let id = null
  let token = null
  if (typeof window !== 'undefined') {
    id = localStorage.getItem('id')
    token = localStorage.getItem('token')
  }
  const headers = {
    id,
    authorization: `Bearer ${token}`
  }

  //get user by Id
  const { userId } = useParams()

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`${port_uri}/app/user/user-info-byId/${userId}`, { headers })
        setUserName(response.data.user.name)
        setUserProfilePic(response.data.user.profilePic)
        setUserEmail(response.data.user.email)
        setUserPhone(response.data.user.phone)
        setUserBio(response.data.user.bio)
      } catch (error) {
        console.log(error)
      }
    }
    fetch()
  }, [])


  return (
    <div className='h-screen flex justify-center items-center'>
      <div className='rounded-[50px] bg-[#f5f5f5] shadow-[20px_20px_60px_#d0d0d0,_-20px_-20px_60px_#ffffff] p-8 flex flex-col items-center justify-center gap-2'>
        <div className='flex flex-col justify-center items-center'>
          <div className='relative'>
            {userProfilePic ? (<img src={userProfilePic} alt='preview' className='w-[200px] h-[200px] border-4 border-sky-600 rounded-full ' />):(<LuUserCircle2 size={200} />)}
          </div>
        </div>

        <h1 className='text-2xl font-bold'>{userName}</h1>

        <div className='flex flex-col items-center gap-1'>
              <p className='text-lg font-semibold'>{userBio}</p>
        </div>

        <div className='flex flex-col items-center justify-center'>
          <h1 className='text-3xl font-extrabold mb-4 underline'>Contact Details</h1>
          <div className='gap-4'><span className='text-xl font-bold'>Email: </span><span className='text-xl font-bold'>{userEmail}</span></div>
          <div className='gap-4'><span className='text-xl font-bold'>Number: </span><span className='text-xl font-bold'>{userPhone}</span></div>
        </div>
      </div>
    </div>
  )
}

export default page