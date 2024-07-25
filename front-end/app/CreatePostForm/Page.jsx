"use client"
import React, { useState, useRef } from 'react'
import Image from 'next/image';
import axios from 'axios';
import { FaFileUpload } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { toast } from 'react-toastify';

const page = ({closeButton}) => {


  const port_uri = process.env.PORT_URL
  
  const [image, setImage] = useState()

  const PostTitle = useRef()
  const PostTags = useRef([])

  let id = null;
  let token = null;

  if (typeof window !== 'undefined') {
    id = localStorage.getItem('id');
    token = localStorage.getItem('token');
  }

  const headers = {
    id,
    authorization: `Bearer ${token}`,
  };
  console.log(headers)  


  const submitHandler = async (event) => {
    event.preventDefault()

    const title = PostTitle.current.value
    const tags = PostTags.current.value

    try {
      if (image) {
        const formData = new FormData()
        formData.append('file', image)
        formData.append('upload_preset', 'Synergy')
        
        const res = await fetch(
          'https://api.cloudinary.com/v1_1/ddysc3tge/image/upload', {
          method: 'post',
          body: formData
        })
        if (!res) {
          toast.error("Error while getting Photo URL")
        }
        const data = await res.json()
        const imageUrl = data.secure_url;

        await axios.post(`${port_uri}app/post/upload-post`, {
          title: title,
          hashtags: tags,
          photoUrl: imageUrl
        }, {
          headers
        })
        PostTitle.current.value = '';
        PostTags.current.value = '';
        setImage(null);
        toast.success("Post created successfully")
        if (typeof window !== 'undefined') {
          window.location.href = '/Posts'
        }
      }
    } catch (error) {
      console.log(error)
      if (error.response) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Error Occurred While Sending Request')
      }
    }
  }
  
  const handelImage = (e) => {
    setImage(e.target.files[0])
  }

  const discardImage = () => {
    setImage(null)
  }

  return (
    
      <form className='w-96 px-8 py-4 border-2 border-black rounded-lg lg:w-full md:w-1/2 sm:w-4/5 xs:w-4/5 items-center relative z-20' onSubmit={submitHandler}>
        <div className='w-full flex items-center justify-center'><h1 className='text-center text-2xl font-bold text-blue-500'>Create Post</h1></div>
        <button className='bg-red-500 absolute top-1 right-1 font-semibold text-white w-6 h-6 hover:bg-red-700' onClick={closeButton}>X</button>
        <div className='flex flex-col'>
          <label htmlFor='title' className='text-xl'>Title</label>
          <input
            type='text'
            id='title'
            ref={PostTitle}
            className='border-s-2 border-b-2 hover:border-black focus:outline-none focus:border-sky-500'
            required
          />
        </div>

        <div className='flex flex-col'>
          <label htmlFor='tags' className='text-xl'>Tags</label>
          <input
            type='text'
            id='tags'
            ref={PostTags}
            className='border-s-2 border-b-2 hover:border-black focus:outline-none focus:border-sky-500'
            required
          />
        </div>

        <div className='flex flex-col mb-8'>
          <label htmlFor='image' className='text-xl'>Image</label>
          <div className='flex justify-center items-center'>
            <label htmlFor='file' className='flex justify-center items-center bg-slate-600 border-2 rounded-lg w-4/5 lg:w-1/2 h-72 relative hover:border-black overflow-hidden'>
              <FaFileUpload
                size={30}
                className='absolute'
              />
              {image && (
                <div className='z-10'>
                <Image
                  src={URL.createObjectURL(image)}
                  alt='preview'
                  width={400}
                  height={400}
                  className='object-cover h-full w-full'
                />
                </div>
              )}
              <ImCross
                color='red'
                className='absolute top-1 right-1'
                onClick={discardImage}
              />
            </label>
            <input
              className='sr-only'
              type='file'
              id='file'
              onChange={handelImage}
              required
            />
          </div>
        </div>
        <button className='bg-blue-700 py-2 px-6 border-2 border-blue-700 rounded-lg text-white'>POST</button>
      </form>
    
  )
}

export default page