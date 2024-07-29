"use client"
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios';
import { FaFileUpload } from "react-icons/fa";
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
  const [croppedImagePreview, setCroppedImagePreview] = useState(null);

  const PostTitle = useRef()
  const PostTags = useRef()
  const imgRef = useRef(null)

  //authenticate
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

  //Crop Image
  const getCroppedImg = (image, crop) => {
    return new Promise((resolve, reject) => {
      if (!image || !image.complete) {
        reject(new Error('Image not loaded'));
        return;
      }

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
    });
  }

  //Upload Image
  const submitHandler = async (event) => {
    event.preventDefault();

    const title = PostTitle.current.value;
    const tags = PostTags.current.value;

    try {
      if (image) {
        const formData = new FormData();

        const imageToUpload = croppedImagePreview ? await fetch(croppedImagePreview).then(r => r.blob()) : image;
        formData.append('file', imageToUpload);
        formData.append('upload_preset', 'Synergy');
      
        const res = await fetch(
          'https://api.cloudinary.com/v1_1/ddysc3tge/image/upload',
          {
            method: 'post',
            body: formData
          }
        );

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
        setCroppedImagePreview(null);
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

  //Set image
  const handleImage = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setIsCropButtonVisible(true);
    }
  };

  //Cancel Image
  const discardImage = () => {
    setImage(null);
    setIsCropping(false);
    setIsCropButtonVisible(false);
    setCroppedImagePreview(null);
  };

  //Preview Crop Image
  const previewCroppedImage = async () => {
    try {
      if (image && completedCrop) {
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
        const croppedImagePreviewUrl = URL.createObjectURL(croppedImageBlob);
        setCroppedImagePreview(croppedImagePreviewUrl);
        setIsCropping(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleCropping = () => {
    setIsCropping(!isCropping);
  };

  useEffect(() => {
    return () => {
      if (croppedImagePreview) {
        URL.revokeObjectURL(croppedImagePreview);
      }
    };
  }, [croppedImagePreview]);

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
        <div className='flex justify-center items-center relative overflow-hidden'>
          <label
            htmlFor='file'
            className={`flex justify-center items-center bg-slate-600 border-2 rounded-lg hover:border-black overflow-hidden cursor-pointer relative w-80 h-80`}
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
              <div className='z-10 w-80 h-80 overflow-hidden relative flex justify-center items-center'>
                <img
                  src={croppedImagePreview || URL.createObjectURL(image)}
                  alt='preview'
                  className='max-w-full max-h-full object-cover '
                />
              </div>
            )}
            {image && isCropping && (
              <ReactCrop
                src={URL.createObjectURL(image)}
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
              >
                <div className='w-80 h-80 overflow-hidden flex items center justify center'>
                    <img
                      ref={imgRef}
                      src={URL.createObjectURL(image)}
                      alt="Crop me" 
                      className='w-full h-full object-cover'
                  />
                </div>
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
              onClick={isCropping ? previewCroppedImage : toggleCropping}
            >
              {isCropping ? 'Preview Crop' : 'Crop Image'}
            </button>
          )}
          {image && (<button
            type='button'
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