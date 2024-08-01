'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { LuUserCircle2 } from "react-icons/lu";
import Card from '@/app/Components/Card';
import { Bree_Serif , Ubuntu , Rubik } from 'next/font/google';

const bree_serif = Bree_Serif({
  weight: '400',
  subsets: ['latin'],
})

const ubuntu = Ubuntu({
  weight: '700',
  subsets: ['latin'],
})

const rubik = Rubik({
  wight: '600',
  subsets:['latin']
})


const page = () => {

  const port_uri = process.env.PORT_URL
  
  const [userName, setUserName] = useState(null)
  const [userProfilePic, setUserProfilePic] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [userPhone, setUserPhone] = useState(null)
  const [userBio, setUserBio] = useState(null)
  const [allPost , setAllPost] = useState([{}])

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
        const response = await axios.get(`${port_uri}app/user/user-info-byId/${userId}`, { headers })
        setUserName(response.data.user.name)
        setUserProfilePic(response.data.user.profilePic)
        setUserEmail(response.data.user.email)
        setUserPhone(response.data.user.phone)
        setUserBio(response.data.user.bio)
        setAllPost(response.data.posts)
      } catch (error) {
        console.log(error)
      }
    }
    fetch()
  }, [])

  return (
    <div className='my-5 flex flex-col justify-center items-center '>
      <div className='rounded-md bg-[#f5f5f5] shadow-[20px_20px_60px_#d0d0d0,_-20px_-20px_60px_#ffffff] p-8 flex flex-col items-center justify-center gap-2'>
        <div className='flex flex-col justify-center items-center'>
          <div className='relative'>
            {userProfilePic ? (
              <div className='overflow-hidden w-[200px] h-[200px] border-4 border-sky-600 rounded-full'>
                <img src={userProfilePic} alt='preview' className='object-cover w-full h-full' />
              </div>)
              : (<LuUserCircle2 size={200} />)}
          </div>
        </div>

        <h1 className={`${bree_serif.className} text-2xl font-bold`}>{userName}</h1>

        <div className='flex flex-col items-center gap-1'>
          <p className={`${rubik.className} font-serif text-lg font-semibold`}>{userBio}</p>
        </div>

        <div className='flex flex-col items-center justify-center'>
          <h1 className={`text-3xl font-extrabold mb-4 underline ${ubuntu.className}`}>Contact Details</h1>
          <div className='gap-4'><span className={`text-xl font-bold ${ubuntu.className}`}>Email: </span><span className={`${bree_serif.className} text-blue-600 font-bold`}>{userEmail}</span></div>
          <div className='gap-4'><span className={`text-xl font-bold ${ubuntu.className}`}>Number: </span><span className={`${bree_serif.className} text-blue-600 font-bold`}>{userPhone}</span></div>
        </div>
      </div>
      <div>{allPost.map((post, index) => (
        <Card key={index} post={post}/>
      )) }</div>
      

    </div>
  )
}

export default page