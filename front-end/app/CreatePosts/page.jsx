"use client"
import React, { useState } from 'react';
import Page from '../CreatePostForm/Page'

const CreatePost = () => {

  const [IsOpenPopUp, setIsOpenPopUp] = useState(false)

  const createPost = (event) => {
    event.preventDefault()
    setIsOpenPopUp(true)
  }
  const closeButton = (event) => {
    event.preventDefault()
    setIsOpenPopUp(false)
  }

  return (
    <div className='h-screen flex justify-center items-center'>
      <button className="absolute group flex items-center justify-start w-[45px] h-[45px] rounded-full border-none cursor-pointer overflow-hidden transition-all duration-300 shadow-md bg-gradient-to-r from-[#af40ff] via-[#5b42f3] to-[#00ddeb] hover:w-[125px] active:translate-x-0.5 active:translate-y-0.5"
        onClick={createPost}>
        <div className="sign w-full text-4xl text-white transition-all duration-300 flex items-center justify-center group-hover:w-[30%] group-hover:pl-[15px]">
          +
        </div>
        <div className="text absolute right-0 w-0 opacity-0 text-white text-lg font-medium transition-all duration-300 group-hover:opacity-100 group-hover:w-[70%] group-hover:pr-[15px] group-hover:mt-[4px]">
          Create
        </div>
      </button>
      {
        IsOpenPopUp && <Page closeButton={closeButton } />
      }
    </div>
  )
}

export default CreatePost