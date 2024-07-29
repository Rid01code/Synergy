'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter , usePathname } from 'next/navigation'
import styles from "../styles/allcss.module.css"
import Message from "../assets/Message.png"
import Home from "../assets/Home.png"
import Create from "../assets/Create.png"
import axios from 'axios'
import { IoIosArrowDropdownCircle } from "react-icons/io";
import { Ubuntu } from 'next/font/google'

const ubuntu = Ubuntu({
  weight: '700',
  subsets: ['latin'],
})

const SideBar = () => {

  const port_uri = process.env.PORT_URL

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

  const [profilePic, setProfilePic] = useState()
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`${port_uri}app/user/user-info`, { headers })
        setProfilePic(response.data.userInfo.profilePic)
      } catch (error) {
        console.log(error)
      }
    }
    fetch()
  }, [])
  
  //Set Active Tab
  const router = useRouter()
  const pathname = usePathname()

  const [activeTab, setActiveTab] = useState('Posts')
  
  useEffect(() => {
    switch (pathname) {
      case '/Posts':
        setActiveTab('Posts');
        break;
      case '/CreatePosts':
        setActiveTab('CreatePosts');
        break;
      case '/MessageBox':
        setActiveTab('MessageBox');
        break;
      default:
        setActiveTab('');
    }
  }, [pathname]);
  
  //Add Transitionconst 
  const handleTransition = async (event, href) => {
    event.preventDefault();
    document.body.classList.add("page-transition");
    setTimeout(() => {
      router.push(href);
      setTimeout(() => {
        document.body.classList.remove("page-transition");
      }, 400);
    }, 400);
  }

  return (
    <div className={`h-full relative ${styles.navUI}`}>

      <div className={`${styles.sidebar} border-b-2 border-black ${ubuntu.className}`}>
        <Link href='/Posts' onClick={(e) => handleTransition(e, '/Posts')}>
          <div className={`flex gap-2 items-end justify-start ${styles.sidebar_btn} ${activeTab === "Posts" ? styles.sidebar_btn_active : ''}`}>
            <Image src={Home} alt='Home' className='w-12 h-12' />
            <p className='mb-1'>Feed</p>
          </div>
        </Link>

        <Link href='/CreatePosts' onClick={(e) => handleTransition(e, '/CreatePosts')}>
          <div className={`flex gap-2 items-end justify-start ${styles.sidebar_btn} ${activeTab === "CreatePosts" ? styles.sidebar_btn_active : ''}`}>
            <Image src={Create} alt='Create' className='w-12 h-12' />
            <p className='mb-1'>Create</p>
          </div>
        </Link>

        <Link href='/MessageBox' onClick={(e) => handleTransition(e, '/MessageBox')}>
          <div className={`flex gap-2 items-end justify-start ${styles.sidebar_btn} ${activeTab === "MessageBox" ? styles.sidebar_btn_active : ''}`}>
            <Image src={Message} alt='Message' className='w-12 h-12' />
            <p className='mb-1'>Message</p>
          </div>
        </Link>
      </div>

      <div className={`flex items-center justify-center ${styles.sidebar_profile_btn}`}>
        <Link href='/MyProfile' onClick={(e) => handleTransition(e, '/MyProfile')}>
          <div className='relative'>
            <img src={profilePic} alt='' className='w-12 h-12 rounded-full'/>
            <div className='absolute z-10 bottom-1 right-1'>
              <IoIosArrowDropdownCircle color='white' size={15} />
            </div>
          </div>
        </Link>

      </div>

    </div>
  )
}

export default SideBar