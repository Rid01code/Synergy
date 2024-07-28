"use client"
import React, { useEffect, useState } from 'react';
import styles from "../styles/allcss.module.css";
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from "../assets/logo.jpg";
import { IoCreate } from "react-icons/io5";
import { IoCreateOutline } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";
import { GoHome } from "react-icons/go";
import { FaMessage } from "react-icons/fa6";
import { FaRegMessage } from "react-icons/fa6";
import { FaUserAlt } from "react-icons/fa"; 
import { GoArrowUpRight } from "react-icons/go";
import { IoMdArrowRoundBack } from "react-icons/io";


const Nav = () => {

  const port_uri = process.env.PORT_URL

  const pathname = usePathname();
  const router = useRouter()
  
  const [isFocused, setIsFocused] = useState(false);

  const [activeTab, setActiveTab] = useState('Posts')

  const [query, setQuery] = useState('')

  const [suggestion, setSuggestion] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // const [userId , setUserId] = useState('')

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  //Authorization
  let id = null;
  let token = null;
  if (typeof window !== 'undefined') {
    id = localStorage.getItem('id');
    token = localStorage.getItem('token');
  }
  const headers = {
    id,
    authorization: `Bearer ${token}`
  };

  //Search User
  useEffect(() => {
    const fetchSuggestion = async () => {
      if (query.length > 0) {
        try {
          const response = await axios.get(`${port_uri}app/user/search-users?query=${query}`, { headers });
          setSuggestion(response.data.suggestions);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestion([]);
      }
    };
    const debounceTimer = setTimeout(fetchSuggestion, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSuggestionClick = async (suggestion) => {
    setIsLoading(true)
    try {
      console.log(suggestion)
      const response = await axios.get(`${port_uri}app/user/search-user-info?query=${suggestion}`, { headers });
      setQuery('')
      router.push(`/otherUsers/${response.data.userInfo.id}`)
    } catch (error) {
      console.log(error)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      },2000)
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      setIsLoading(true)
      handleSuggestionClick(suggestion[0]);
      setTimeout(() => {
        setIsLoading(false)
      },2000)
    }
  }


  const clearInput = () => {
    console.log('clear')
    setQuery('');
  }
  
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

  //Add Transition
  const handleTransition = async (event, href) => {
    event.preventDefault();
    document.body.classList.add("page-transition");
    setTimeout(() => {
      router.push(href);
      setTimeout(() => {
        document.body.classList.remove("page-transition");
      }, 300);
    }, 300);
  }

  //Add loader
  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className={`${styles.loader}`}></div>;
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-between px-5 w-full ${styles.navUI}`}>
      <div className='flex items-center justify-between px-1 py-2 w-full'>
        <div className='flex items-center gap-5'>
          <Image src={logo} alt='' className={`${styles.logo}`} />
          <div className="relative flex items-center z-10 group">
            <input
              placeholder="Search user..."
              name="text"
              type="text"
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={(e) => handleKeyDown(e)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${styles.input}`}
            />
            {
              suggestion.length > 0 && (
                <ul className={`${styles.nav_suggestion} rounded-md`}>
                  <div onClick={clearInput} className='m-2 cursor-pointer'><IoMdArrowRoundBack size={20}/></div>
                  {suggestion.map((suggestion, index) => (
                    <li
                      onClick={() => { handleSuggestionClick(suggestion) }}
                      className='flex gap-1 justify-center items-center py-3 px-5 border-b border-b-gray-200 hover:bg-slate-400'
                      key={index}
                    > {suggestion}
                      <GoArrowUpRight size={15} />
                    </li>
                  ))}
                </ul>
              )
            }
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`${styles.icon}`}
            >
              <g strokeWidth="0" id="SVGRepo_bgCarrier"></g>
              <g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier"></g>
              <g id="SVGRepo_iconCarrier">
                <rect fill="white"></rect>
                <path d="M7.25007 2.38782C8.54878 2.0992 10.1243 2 12 2C13.8757 2 15.4512 2.0992 16.7499 2.38782C18.06 2.67897 19.1488 3.176 19.9864 4.01358C20.824 4.85116 21.321 5.94002 21.6122 7.25007C21.9008 8.54878 22 10.1243 22 12C22 13.8757 21.9008 15.4512 21.6122 16.7499C21.321 18.06 20.824 19.1488 19.9864 19.9864C19.1488 20.824 18.06 21.321 16.7499 21.6122C15.4512 21.9008 13.8757 22 12 22C10.1243 22 8.54878 21.9008 7.25007 21.6122C5.94002 21.321 4.85116 20.824 4.01358 19.9864C3.176 19.1488 2.67897 18.06 2.38782 16.7499C2.0992 15.4512 2 13.8757 2 12C2 10.1243 2.0992 8.54878 2.38782 7.25007C2.67897 5.94002 3.176 4.85116 4.01358 4.01358C4.85116 3.176 5.94002 2.67897 7.25007 2.38782ZM9 11.5C9 10.1193 10.1193 9 11.5 9C12.8807 9 14 10.1193 14 11.5C14 12.8807 12.8807 14 11.5 14C10.1193 14 9 12.8807 9 11.5ZM11.5 7C9.01472 7 7 9.01472 7 11.5C7 13.9853 9.01472 16 11.5 16C12.3805 16 13.202 15.7471 13.8957 15.31L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L15.31 13.8957C15.7471 13.202 16 12.3805 16 11.5C16 9.01472 13.9853 7 11.5 7Z" clipRule="evenodd" fillRule="evenodd"></path>
              </g>
            </svg>
          </div>
        </div>
        <div className='flex items-center justify-center'>
          <Link href='/MyProfile' onClick={(e)=>handleTransition(e , '/MyProfile')}><FaUserAlt size={20} /></Link>
        </div>
      </div>
      <div className={`flex px-8 items-center justify-between ${styles.nav_icon_box}`}>
        <Link href='/CreatePosts' onClick={(e) => handleTransition(e, '/CreatePosts')}>
          {activeTab === "CreatePosts" ? (<IoCreate size={30} color='blue' />) : (<IoCreateOutline size={30} color='blue' />)}
        </Link>
        <Link href='/Posts' onClick={(e) => handleTransition(e, '/Posts')}>
          {activeTab === "Posts" ? (<GoHomeFill size={30} color='blue' />) : (<GoHome size={30} color='blue' />)}
        </Link>
        <Link href='/MessageBox' onClick={(e) => handleTransition(e, '/MessageBox')}>
          {activeTab === "MessageBox" ? (<FaMessage size={20} color='blue' />) : (<FaRegMessage size={20} color='blue' />)}
        </Link>
      </div>
    </div>
  )
}

export default Nav