"use client"
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Image from 'next/image';
import Link from 'next/link';
import styles from "../../styles/allcss.module.css"
import { toast } from 'react-toastify';
import { useStore, useSelector } from 'react-redux';
import { authActions } from '@/Store/Auth';
import background from "../../assets/background.png";
import photoVideo from "../../assets/photo-video.png"
import download from "../../assets/download.png"
import Card from '../Components/Card';

function posts() {

  const store = useStore();

  const port_uri = process.env.PORT_URL

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  //if user is not signed in redirect to Sign-In
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('id') && localStorage.getItem('token')) {
      store.dispatch(authActions.logIn());
    } else if (!isLoggedIn) {
      if (typeof window !== 'undefined') {
        window.location.href = '/SignIn';
      }
    }
  }, []);
  
  //if unauthorized then redirect to Log-In
  axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('id');
      localStorage.removeItem('token');
      window.location.href = '/LogIn';
    }
    return Promise.reject(error);
  }
  );

  const [allPost, setAllPost] = useState([{}]);

  const [userProfilePic, setUserProfilePic] = useState();

  const [isLoading, setIsLoading] = useState(true);

  const postContent = useRef(' ');

  const backgroundColor = useRef(' ')

  //get headers fot authorization
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

  //Get all post
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${port_uri}app/post/get-post`, { headers });
      setAllPost(response.data.posts);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [allPost.pro])

  //On submit
  const handleSubmit = async(event) => {
    event.preventDefault();
    const textContent = postContent.current.value
    const theme = backgroundColor.current.value
    try {
      const response = await axios.post(`${port_uri}app/post/upload-post`, {
        textContent: textContent,
        theme: theme
      }, { headers })
      
      postContent.current.value = ''
      postContent.current.style.background = '#ffffff'  
      fetchPosts()
      toast.success("Post created successfully")
    } catch (error) {
      console.log(error)
      if (error.response) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Error Occurred While Sending Request')
      }
    }
  }


    useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`${port_uri}app/user/user-info`, { headers });
        setUserProfilePic(response.data.userInfo.profilePic);
      } catch (error) {
      }
    };
    fetch();
  }, []);

  //Add loader
  if (isLoading) {
    return (
      <div className='h-screen flex mt-10 '>
        <div className={`${styles.loader}`}></div>;
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-center items-center flex-col'>
        <form
          className={`my-6 p-6 relative ${styles.postBox}`}
          onSubmit={handleSubmit}
        >
          <div className='flex items-center justify-around gap-2 border-b-2 border-b-gray-300 pb-2'>
            <div className='w-12 h-12 rounded-full overflow-hidden'>
              <img
              src={userProfilePic}
              alt='profilePic'
              className='object-cover w-full h-full'
              />
            </div>
            <input
              type='text'
              ref={postContent}
              placeholder='Type here, Whats on your mind...'
              className='w-72 h-10 rounded-xl'
            />
          </div>
          <div className='flex items-center justify-around gap-2 pt-2'>
            <label
              htmlFor='backgroundColor'
              className='flex items-center hover:bg-slate-400 rounded-md py-2 px-4 gap-1'>
              <Image src={background} alt='' className='w-5 h-5 rounded-sm' />
              <p className='text-xs'>Background</p>
            </label>
            <input
              className='sr-only'
              id='backgroundColor'
              type='color'
              ref={backgroundColor}
              onChange={(e) => { postContent.current.style.background = e.target.value }}
            />
            <Link href='/CreatePosts'>
              <div className='flex items-center cursor-pointer hover:bg-slate-400 rounded-md py-2 px-4 gap-1'>
                <Image
                  src={photoVideo} alt=''
                  className='w-6 h-6'
                />
                <p className='text-xs'>Photos</p>
              </div>
            </Link>
            <button
              className='flex items-center cursor-pointer hover:bg-slate-400 rounded-md py-2 px-4 gap-1'
              type='submit'
            >
              <Image
                src={download}
                alt=''
                className='w-6 h-6'
              />
              <p className='text-xs'>Upload</p>
            </button>
          </div>
        </form>
        <div>
        {allPost.map((post, index) => (
          <Card key={index} post={post} />  
        ))}
        </div>
      </div>
    </div>
  )
}

export default posts