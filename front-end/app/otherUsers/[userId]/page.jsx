'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment';
import { useParams } from 'next/navigation'
import { LuUserCircle2 } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";
import { FaRegThumbsUp } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { toast } from 'react-toastify';
import styles from "../../../styles/allcss.module.css"
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
  const [allPost, setAllPost] = useState([])
  const [postComment, setPostComment] = useState({});
  const [postLikes, setPostLikes] = useState({});
  const [openCommentInput, setOpenCommentInput] = useState({});
  const [AddComment, setAddComment] = useState(' ');

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

  //Add Like
  const addLike = async (post) => {
    try {
      const response = await axios.put(`${port_uri}app/post/add-likes/${post._id}`, {}, { headers });

      setPostLikes((prevPostLikes) => ({
        ...prevPostLikes,
        [post._id]: {
          ...prevPostLikes[post._id],
          likesCount: prevPostLikes[post._id].likesCount + 1,
          hasLiked: true,
        },
      }));
      toast.success(response.data.message);
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error occurred while sending request");
      }
    }
  };

  //Get all likes
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`${port_uri}app/post/get-post`, { headers });
        const posts = response.data.posts;
        const postLikesObj = {};
        await Promise.all(posts.map(async (post) => {
          const likesResponse = await axios.get(`${port_uri}app/post/get-likes/${post._id}`, { headers });
          postLikesObj[post._id] = {
            likesCount: likesResponse.data.likesCount,
            usersWhoLike: likesResponse.data.usersWhoLike,
            hasLiked: likesResponse.data.hasLiked,
          };
        }));
        setPostLikes(postLikesObj);
      } catch (error) {
        console.log(error);
        if (error.response) {
          toast.error(error.response.data.message);
        }
      }
    };
    fetch();
  }, []);


  //Open comment Input
  const doComment = (postId) => {
    setOpenCommentInput((prevOpenCommentInput) => ({
      ...prevOpenCommentInput,
      [postId]: !prevOpenCommentInput[postId],
    }));
  };


  //Add comment
  const addComments = async (post) => {
    try {
      const response = await axios.put(`${port_uri}app/post/add-comments/${post._id}`, { comment: AddComment }, { headers });

      const currentUserResponse = await axios.get(`${port_uri}app/user/user-info`, { headers });
      const currentUserName = currentUserResponse.data.userInfo.name;
      setPostComment((prevPostComment) => ({
        ...prevPostComment,
        [post._id]: {
          ...prevPostComment[post._id],
          commentsCount: prevPostComment[post._id].commentsCount + 1,
          usersWhoComment: [...prevPostComment[post._id].usersWhoComment, { userId: { name: currentUserName }, comment: AddComment }],
        },
      }));

      toast.success(response.data.message);
      setAddComment("");
      setOpenCommentInput(false);
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error occurred while sending request");
      }
    }
  };


  //Get comment
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`${port_uri}app/post/get-post`, { headers });
        const posts = response.data.posts;
        const postCommentsObj = {};
        await Promise.all(posts.map(async (post) => {
          const commentsResponse = await axios.get(`${port_uri}app/post/get-comments/${post._id}`, { headers });
          postCommentsObj[post._id] = {
            commentsCount: commentsResponse.data.numberOfComments,
            usersWhoComment: commentsResponse.data.comments,
          };
        }));
        setPostComment(postCommentsObj);
      } catch (error) {
        console.log(error);
        if (error.response) {
          toast.error(error.response.data.message);
        }
      }
    };
    fetch();
  }, []);


  return (
    <div className='my-5 flex flex-col justify-center items-center '>
      <div className='rounded-[50px] bg-[#f5f5f5] shadow-[20px_20px_60px_#d0d0d0,_-20px_-20px_60px_#ffffff] p-8 flex flex-col items-center justify-center gap-2'>
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

      {allPost.map((post, index) => (
        <div
          key={index}
          className={`my-6 p-6 relative ${styles.postBox}`}>
          <div className='flex items-end gap-1'>
            {post.profilePic ?
              (<div className='overflow-hidden w-10 h-10 object-cover rounded-full'>
                <img
                src={post.profilePic}
                alt={post.name} className='object-cover w-full h-full '/>
              </div>)
              : post.profilePic = ' '
                (<FaUserCircle
                  size={30}/>)}
            <div className={`text-xl ${bree_serif.className}`}>
              {post.name}
            </div>
          </div>

          <div className='ml-10 text-xs font-light'>
            {moment(post.date).format('MMMM Do, YYYY')}
          </div>

          {post.title && (
            <div
              className='ml-10'>
              {post.title}
            </div>)}
            
          <div>{
            post.hashtags && post.hashtags.map((tag, index) => (
              <p key={index} className='ml-10 text-blue-600'>{` #${tag} `}</p>
            ))}
          </div>

          {post.photoUrl ?
            (<div className='overflow-hidden w-80 h-80 object-cover rounded-md ml-10'>
              <img src={post.photoUrl} alt={post.title} className='object-cover w-full h-full' />
            </div>  )
            :
            (<div
              className={`${styles.postBox_forText} w-80 h-80 object-cover rounded-md ml-10 text-white text-lg font-semibold`}
              style={{ backgroundColor: post.theme }}
            >
              {post.textContent}
            </div>)}

          <div className='flex justify-between items-center ml-10 mt-8 px-5 border-t-2'>
            <div className='flex gap-2 items-start'>
              <p className='font-semibold text-xl mt-[1px]'>{postLikes[post._id] ? postLikes[post._id].likesCount : 0}</p>
              {postLikes[post._id] && postLikes[post._id].hasLiked ? (
                <FaThumbsUp size={20} color='blue' />
              ) : (
                <FaRegThumbsUp size={20} color='blue' onClick={() => addLike(post)} />
              )}
              <details className='text-blue-600 text-xl'>
                <summary></summary>
                <div className={`absolute left-[12px] bg-slate-400 p-4 rounded-lg z-10 ${bree_serif.className}`}>
                  {postLikes[post._id] && postLikes[post._id].usersWhoLike.map((users, index) => (
                    <p key={index}>{users.userId.name} </p>
                  ))}
                </div>
              </details>
            </div>
            <div className='flex items-start gap-2'>
              <div className='font-semibold text-xl'>{postComment[post._id] ? postComment[post._id].commentsCount : 0}</div>
              <FaRegComment size={20} color='blue' className='mt-[1px]' onClick={() => doComment(post._id)} />
              <details className='text-blue-600 text-xl '>
                <summary> </summary>
                <div className='absolute right-[12px] bg-slate-400 p-4 rounded-lg z-10'>
                  {postComment[post._id] && postComment[post._id].usersWhoComment.map((comment, index) => (
                    <div key={index}>
                      <p className={`font-semibold text-blue-500 text-lg ${bree_serif.className}`}>{comment.userId.name}</p>
                      <p className='ml-6 text-black font-xs'>{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {openCommentInput[post._id] && (

            <div className='flex items-center justify-end mt-4'>
              <input
                type="text"
                className='border-l-2 border-l-blue-600 border-b-2 border-b-blue-600 focus:outline-none focus:border-l-blue-800 focus:border-b-blue-800'
                placeholder="Add a comment..."
                value={AddComment}
                onChange={(e) => { setAddComment(e.target.value); }} />
              <button className='ml-2' onClick={() => addComments(post)}><IoMdSend size={20} /></button>
            </div>
          )}
        </div>
      ))}
      

    </div>
  )
}

export default page