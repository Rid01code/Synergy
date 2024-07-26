"use client"
import React, { useState, useRef } from 'react'
import Image from 'next/image';
import axios from 'axios';
import { FaFileUpload } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { toast } from 'react-toastify';
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const Page = ({ closeButton }) => {
  const port_uri = process.env.PORT_URL

  const [image, setImage] = useState(null)
  const [crop, setCrop] = useState({ unit: '%', x: 0, y: 0, width: 50, height: 50, aspect: 1 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const [isCropping, setIsCropping] = useState(false)
  const [isCropButtonVisible, setIsCropButtonVisible] = useState(false)

  const PostTitle = useRef()
  const PostTags = useRef()
  const imgRef = useRef(null)

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

const getCroppedImg = (imageSrc, crop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = 'cropped.jpeg';
        resolve(blob);
      }, 'image/jpeg');
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageSrc;
  });
};

const submitHandler = async (event) => {
  event.preventDefault();

  const title = PostTitle.current.value;
  const tags = PostTags.current.value;

  try {
    if (image && completedCrop) {
      const croppedImageBlob = await getCroppedImg(image, completedCrop);
      
      const formData = new FormData();
      formData.append('file', croppedImageBlob, 'cropped.jpeg');
      formData.append('upload_preset', 'Synergy');
      
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/ddysc3tge/image/upload', {
        method: 'post',
        body: formData
      });

      if (!res.ok) {
        throw new Error("Error while getting Photo URL");
      }

      const data = await res.json();
      const imageUrl = data.secure_url;

      await axios.post(`${port_uri}app/post/upload-post`, {
        title: title,
        hashtags: tags,
        photoUrl: imageUrl
      }, {
        headers
      });

      PostTitle.current.value = '';
      PostTags.current.value = '';
      setImage(null);
      setIsCropping(false);
      setIsCropButtonVisible(false);
      toast.success("Post created successfully");
      if (typeof window !== 'undefined') {
        window.location.href = '/Posts';
      }
    }
  } catch (error) {
    console.error(error);
    if (error.response) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Error Occurred While Sending Request');
    }
  }
};

const handleImage = (e) => {
  if (e.target.files && e.target.files.length > 0) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImage(reader.result);
      setIsCropButtonVisible(true);
    });
    reader.readAsDataURL(e.target.files[0]);
  }
};

  const discardImage = () => {
    setImage(null)
    setIsCropping(false)
    setIsCropButtonVisible(false)
  }

  const toggleCropping = () => {
    setIsCropping(!isCropping);
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
        <div className='flex justify-center items-center relative'>
          <label
            htmlFor='file'
            className={`flex justify-center items-center bg-slate-600 border-2 rounded-lg w-4/5 lg:w-1/2 h-96 hover:border-black overflow-hidden cursor-pointer`}
            onClick={(e) => {
              if (image) {
                e.preventDefault()
              }
            }}
          >
            <FaFileUpload
              size={30}
              className='absolute'
            />
            {image && !isCropping && (
              <div className='z-10 flex items-center justify-center'>
                <img
                  src={image}
                  alt='preview'
                />
              </div>
            )}
            {image && isCropping && (
              <ReactCrop
                src={image}
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
              >
                <img
                  ref={imgRef}
                  src={image}
                  alt="Crop me" />
              </ReactCrop>
            )}
          </label>
          <input
            className='sr-only'
            type='file'
            id='file'
            onChange={handleImage}
            required
          />
        </div>
        <div className='flex justify-evenly'>
          {isCropButtonVisible && (
            <button
              type='button'
              className='bg-slate-500 mt-2 py-2 px-1 text-white rounded-lg hover:bg-slate-700'
              onClick={toggleCropping}
            >
              {isCropping ? 'Finish Cropping' : 'Crop Image'}
            </button>
          )}
          {image && (<button
            className='bg-red-500 mt-2 py-2 px-1 text-white rounded-lg hover:bg-red-700'
            onClick={discardImage}
          >
            Cancel Image
          </button>)}
        </div>
      </div>
      <button className='bg-blue-700 py-2 px-6 border-2 border-blue-700 rounded-lg text-white' type="submit">POST</button>
    </form>
  )
}

export default Page
