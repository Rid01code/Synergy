'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { LuUserCircle2 } from "react-icons/lu";
import { FaRightFromBracket } from "react-icons/fa6";
import { useStore } from 'react-redux';
import { authActions } from '@/Store/Auth';
import styles from "../../styles/allcss.module.css"

const page = () => {

  const store = useStore()
  const port_uri = process.env.PORT_URL
  
  const [userPic, setUserPic] = useState()
  const [userName, setUserName] = useState()
  const [userEmail, setUserEmail] = useState()
  const [userPhone, setUserPhone] = useState()
  const [userBio, setUserBio] = useState(null)
  const [bio, setBio] = useState('')
  const [profilePicture, setProfilePicture] = useState()
  const [isBioEditable, setIsBioEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


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

  const handelImage = (e) => {
    setProfilePicture(e.target.files[0])
  }

  const updateProfile = async (event) => {
    event.preventDefault()
    console.log(bio)
    try {
      if (profilePicture) {
        const formData = new FormData()
        formData.append('file', profilePicture)
        formData.append('upload_preset', 'Synergy')
        
        const res = await fetch(
          'https://api.cloudinary.com/v1_1/ddysc3tge/image/upload', {
          method: 'post',
          body: formData
        }
        )
        if (!res) {
          toast.error("Error while getting Photo URL")
        }

        const data = await res.json()
        const imageUrl = data.secure_url;

        const response = await axios.put(`${port_uri}app/user/update-profile`, {
          profilePic: imageUrl,
        }, { headers })
        
        setUserPic(profilePicture)
        toast.success(response.data.message)

        setProfilePicture('')
        setBio('')
      }

      if (bio) {
        const response = await axios.put(`${port_uri}app/user/update-profile`, {
          bio: bio
        }, { headers })
        setIsBioEditable(false)
        setUserBio(bio)
        setBio('')
      }

    } catch (error) {
      console.log(error)
      if (error.response) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Error occurred while sending request')
      }
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`${port_uri}app/user/user-info`, { headers })
      
        setUserPic(response.data.userInfo.profilePic)
        setUserName(response.data.userInfo.name)
        setUserEmail(response.data.userInfo.email)
        setUserPhone(response.data.userInfo.phone)
        setUserBio(response.data.userInfo.bio)
        setIsLoading(false)
      } catch (error) {
        console.log(error)
      }
    }
    fetch()
  })

  const changeBio = async () => {
    setIsBioEditable(true);
  }

  const logout = () => { 
    alert('Do You Want To Log Out')
    store.dispatch(authActions.logOut())
    localStorage.clear('id')
    localStorage.clear('token')
    window.location.href= '/LogIn'
  }

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className={`${styles.loader}`}></div>;
      </div>
    ) 
  }

  return (
    <div className='h-screen flex justify-center items-center'>
      <div className='rounded-[50px] bg-[#f5f5f5] shadow-[20px_20px_60px_#d0d0d0,_-20px_-20px_60px_#ffffff] p-8 flex flex-col items-center justify-center gap-2'>
        <div className='flex flex-col justify-center items-center'>
          <div className='relative'>
            <label htmlFor='image'>{userPic ? (<img src={userPic} alt='preview' className='w-[200px] h-[200px] border-4 border-sky-600 rounded-full' />) : (<LuUserCircle2 size={200} />)}</label>
            <input
              className='sr-only'
              type='file'
              id='image'
              onChange={handelImage}
            />
            {profilePicture && (<Image src={URL.createObjectURL(profilePicture)} alt='preview' width={200} height={200} className='w-[200px] h-[200px] border-4 border-sky-600 rounded-full absolute top-0 z-10' />)}

          </div>
          {
            profilePicture && (
              <button onClick={updateProfile} className='bg-blue-700 px-4 py-2 text-white border-2 border-blue-700 rounded-md'>Upload Picture</button>
            )
          }
        </div>

        <h1 className='text-2xl font-bold'>{userName}</h1>

        <div className='flex flex-col items-center gap-1'>
          {
            isBioEditable === true ? (
              <input
                placeholder='Write About Your Bio...'
                type='text'
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className='border-s-2 border-b-2 hover:outline-none hover:border-s-black hover:border-b-black focus:outline-none focus:border-s-blue-600 focus:border-b-blue-600'
              />
            ) : (
              <p className='text-lg text-slate-800 font-semibold'>{userBio}</p>
            )
          }

          {
            isBioEditable ? (
              <button onClick={updateProfile} className='bg-blue-700 px-[4px] py-[5px] text-white text-xs border-2 border-blue-700 rounded-md'>Update Bio</button>
            ) : (
              <button onClick={changeBio} className='bg-blue-700 px-[4px] py-[5px] text-white text-xs border-2 border-blue-700 rounded-md'>Change Bio</button>
            )
          }
        </div>

        <div className='flex flex-col items-center justify-center'>
          <h1 className='text-3xl font-extrabold mb-4 underline'>Contact Details</h1>
          <div className='gap-4'><span className='text-xl text-slate-800 font-bold'>Email: </span><span className='text-xl font-bold text-slate-700'>{userEmail}</span></div>
          <div className='gap-4'><span className='text-xl font-bold text-slate-800'>Number: </span><span className='text-xl font-bold
          text-slate-700'>{userPhone}</span></div>
        </div>

        <div onClick={logout}>
          <FaRightFromBracket size={30} />
        </div>
        
      </div>
    </div>
  )
}

export default page