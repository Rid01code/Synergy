'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
import { LuUserCircle2 } from "react-icons/lu";
import { FaRightFromBracket } from "react-icons/fa6";
import { useStore } from 'react-redux';
import { authActions } from '@/Store/Auth';
import ReactCrop from 'react-image-crop';
import Card from '../Components/Card';
import 'react-image-crop/dist/ReactCrop.css';
import styles from "../../styles/allcss.module.css"
import { IoTrashBinOutline } from "react-icons/io5";
import { IoTrashBin } from "react-icons/io5";
import { Bree_Serif , Ubuntu , Rubik , Roboto_Slab} from 'next/font/google';

const bree_serif = Bree_Serif({
  weight: '400',
  subsets: ['latin'],
})

const rubik = Rubik({
  wight: '600',
  subsets:['latin']
})

const roboto = Roboto_Slab({
  wight: '600',
  subsets:['latin']
})

const ubuntu = Ubuntu({
  weight: '700',
  subsets: ['latin'],
})



const page = () => {

  const store = useStore()

  const port_uri = process.env.PORT_URL
  
  const [userPic, setUserPic] = useState()

  const [userName, setUserName] = useState()

  const [userEmail, setUserEmail] = useState()

  const [userPhone, setUserPhone] = useState()

  const [userBio, setUserBio] = useState(null)

  const [userPosts, setUserPosts] = useState([])

  const [bio, setBio] = useState('')

  const [profilePicture, setProfilePicture] = useState()

  const [isBioEditable, setIsBioEditable] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [crop, setCrop] = useState({ unit: '%', x: 0, y: 0, width: 50, height: 50, aspect: 1 });

  const [completedCrop, setCompletedCrop] = useState(null);

  const [isCropping, setIsCropping] = useState(false);

  const imgRef = useRef(null);

  const [croppedImagePreview, setCroppedImagePreview] = useState(null);
  
  const [hoverStates, setHoverStates] = useState({});


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

  //crop Image
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


  //Upload image
  const handleImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
    } else {
      setProfilePicture(null);
    }
  };

  //Update Profile
  const updateProfile = async (event) => {
    event.preventDefault();
    console.log(bio);
    try {
      if (profilePicture) {
        const formData = new FormData();
        const imageToUpload = croppedImagePreview ? await fetch(croppedImagePreview).then(r => r.blob()) : profilePicture;
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
          toast.error("Error while getting Photo URL");
          return;
        }
        const data = await res.json();
        const imageUrl = data.secure_url;
      
        const response = await axios.put(`${port_uri}app/user/update-profile`, {
          profilePic: imageUrl,
        }, { headers });
      
        setUserPic(imageUrl);
        toast.success(response.data.message);
        setProfilePicture('');
        setCroppedImagePreview(null);
      }
    
      if (bio) {
        const response = await axios.put(`${port_uri}app/user/update-profile`, {
          bio: bio
        }, { headers });
        setIsBioEditable(false);
        setUserBio(bio);
        setBio('');
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error occurred while sending request');
      }
    }
  };

  //Preview Image
  const previewCroppedImage = async () => {
    try {
      if (profilePicture && completedCrop) {
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
        const croppedImagePreviewUrl = URL.createObjectURL(croppedImageBlob);
        setCroppedImagePreview(croppedImagePreviewUrl);
        setIsCropping(false)
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  //Cancel Preview Image
  const cancel = () => {
    setIsCropping(false);
  };

  //Toggle Crop
  const toggleCropping = () => {
    setIsCropping(!isCropping);
  };

  //fetch-user
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`${port_uri}app/user/user-info`, { headers })
      
        setUserPic(response.data.userInfo.profilePic)
        setUserName(response.data.userInfo.name)
        setUserEmail(response.data.userInfo.email)
        setUserPhone(response.data.userInfo.phone)
        setUserBio(response.data.userInfo.bio)
        setUserPosts(response.data.userInfo.posts)
        setIsLoading(false)
      } catch (error) {
        console.log(error)
      }
    }
    fetch()
  });

  //Change Bio
  const changeBio = async () => {
    setIsBioEditable(true);
  };

  //Log-out
  const logout = () => {
    alert('Do You Want To Log Out')
    store.dispatch(authActions.logOut())
    localStorage.clear('id')
    localStorage.clear('token')
    window.location.href = '/LogIn'
  };

  //Delete Post
  const deletePost = async (post) => {
    event.preventDefault();
    const postId = post._id
    console.log(postId)
    try {
      const response = await axios.delete(`${port_uri}app/post/delete-post/${postId}`, { headers })
      toast.success(response.data.message)

      setUserPosts(userPosts.filter((p) => p._id !== postId));
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error occurred while sending request");
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
    <div className='my-5 flex flex-col items-center'>
      <div className='rounded-md bg-[#f5f5f5] shadow-[20px_20px_60px_#d0d0d0,_-20px_-20px_60px_#ffffff] p-8 flex flex-col items-center justify-center gap-2'>
        <div className='flex flex-col justify-center items-center'>
          <div className='relative'>
            <label htmlFor='image'>
              {userPic ?
                (<div className='w-[200px] h-[200px] border-4 border-sky-600 rounded-full overflow-hidden'>
                  <img src={userPic} alt='preview' className='object-cover h-full w-full' />
                </div>)
                :
                (<LuUserCircle2 size={200} />)}
            </label>
            <input
              className='sr-only'
              type='file'
              id='image'
              onChange={handleImage}
            />
            {profilePicture && (
              <div className='w-[200px] h-[200px] border-4 border-sky-600 rounded-full absolute top-0 z-10 overflow-hidden flex justify-center items-center '>
                <img
                  src={URL.createObjectURL(profilePicture)}
                  alt='preview'
                  className='object-cover w-full h-full' />
              </div>)}
            
            {croppedImagePreview && (
              <div className='w-[200px] h-[200px] border-4 border-sky-600 rounded-full absolute top-0 z-10 overflow-hidden'>
                <img
                  src={croppedImagePreview}
                  alt='preview'
                  className='object-cover h-full w-full' />
              </div>
            )}

            {profilePicture && isCropping && (
              <div className={`w-80 h-96 flex flex-col items-center mt-5 p-5 absolute top-0 right-[-50px] z-30 ${styles.navUI}`}>
                <ReactCrop
                  src={URL.createObjectURL(profilePicture)}
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  className='flex justify-center items-center w-80 h-80 overflow-hidden'
                >
                  <img
                    ref={imgRef}
                    src={URL.createObjectURL(profilePicture)}
                    alt="Crop me"
                    className='object-fit w-full h-full'
                  />
                </ReactCrop>
                <div className='flex justify-between gap-2'>
                  <button
                    className={`text-xs bg-slate-700 px-4 py-2 text-white border-2 border-slate-700 rounded-md ${roboto.className}`}
                    onClick={previewCroppedImage}>
                    Preview
                  </button>
                  <button
                    onClick={cancel}
                    className={`text-xs bg-red-700 px-4 py-2 text-white border-2 border-red-700 rounded-md ${roboto.className}`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
          {
            profilePicture && (
              <div className='flex justify-between gap-2'>
                <button
                  onClick={updateProfile}
                  className={`bg-blue-700 px-4 py-2 text-white border-2 border-blue-700 rounded-md text-xs ${roboto.className}`}
                >
                  Upload Picture
                </button>
                <button
                  onClick={toggleCropping}
                  className={`bg-slate-700 px-4 py-2 text-white border-2 border-slate-700 rounded-md text-xs ${roboto.className}`}>
                  Crop Image
                </button>
              </div>
            )
          }
        </div>

        <h1 className={`text-2xl font-bold ${bree_serif.className}`}>{userName}</h1>

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
              <p className={`font-serif text-lg text-slate-800 font-semibold ${rubik.className}`}>{userBio}</p>
            )
          }

          {
            isBioEditable ? (
              <button onClick={updateProfile} className={`bg-blue-700 px-[4px] py-[5px] text-white text-xs border-2 border-blue-700 rounded-md ${roboto.className}`}>Update Bio</button>
            ) : (
              <button onClick={changeBio} className={`bg-blue-700 px-[4px] py-[5px] text-white text-xs border-2 border-blue-700 rounded-md ${roboto.className}`}>Change Bio</button>
            )
          }
        </div>

        <div className='flex flex-col items-center justify-center'>
          <h1 className={`text-3xl font-extrabold mb-4 underline ${ubuntu.className}`}>Contact Details</h1>
          <div className='gap-4'><span className={`text-xl text-slate-800 font-bold ${ubuntu.className}`}>Email: </span><span className={`${bree_serif.className} font-mono font-bold text-blue-700`}>{userEmail}</span></div>
          <div className='gap-4'><span className={`text-xl font-bold text-slate-800 ${ubuntu.className}`}>Number: </span><span className={`font-mono font-bold
          text-blue-700 ${bree_serif.className}`}>{userPhone}</span></div>
        </div>

        <div onClick={logout}>
          <FaRightFromBracket size={30} />
        </div>
        
      </div>
      <div>
        {userPosts.map((post, index) => (
          <div key={index} className='relative'>
            <div
              onMouseOver={() => setHoverStates({ ...hoverStates, [post._id]: true })}
              onMouseOut={() => setHoverStates({ ...hoverStates, [post._id]: false })}
              onClick={() => deletePost(post)}
              className='absolute top-4 right-1 z-10'
            >
              {hoverStates[post._id] ? <IoTrashBin size={30} color='red' /> : <IoTrashBinOutline size={30} color='red' />}
            </div>
            <Card post={post} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default page