"use client"
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import ContactLogo from "../../assets/Contact.png"
import DoMsg from "../../assets/DoMsg.png"
import styles from "../../styles/allcss.module.css"
import axios from 'axios'
import io from "socket.io-client"
import { LuUserCircle2 } from "react-icons/lu";
import { IoIosSend } from "react-icons/io";
import { Bree_Serif , Ubuntu } from 'next/font/google'

const bree_serif = Bree_Serif({
  weight: '400',
  subsets: ['latin'],
})

const ubuntu = Ubuntu({
  weight: '400',
  subsets: ['latin'],
})


const Contact = () => {

  const port_uri = process.env.PORT_URL
  
  const socket = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [currentUserId , setCurrentUserId] = useState(null)
  const [selectedUser, setSelectedUser] = useState()
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState([])
  
  const socketRef = useRef()
  const messagesEndRef = useRef(null)

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
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${port_uri}app/user/user-info`, { headers });
        setCurrentUser(response.data.userInfo)
        setCurrentUserId(response.data.userInfo.id)
      } catch (error) {
        console.log(error);
      }
    };


    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${port_uri}app/user/all-users`, { headers });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
      }
    };

    fetchCurrentUser();
    fetchUsers();

    socketRef.current = io(socket, {
      transports: ['websocket'],
      withCredentials: true,
      upgrade: false,
      forceNew: true,
      reconnection: true,
      timeout: 60000,
      secure: true,
    })

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      console.error('Error details:', error.message, error.description); 
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket general error:', error);
    });

    socketRef.current.on('newMessage', handleNewMessage);
    socketRef.current.on('messageSent', handleMessageSent);

    return () => {
      socketRef.current.off('newMessage', handleNewMessage);
      socketRef.current.off('messageSent', handleMessageSent);
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      socketRef.current.emit('join', currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchChatHistory();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${port_uri}app/chat/history/${selectedUser._id}`, { headers });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error.response?.data || error.message);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const handleMessageSent = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };


  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && selectedUser) {
      socketRef.current.emit('sendMessage', {
        senderId: currentUser.id,
        recipientId: selectedUser._id,
        message: inputMessage
      });
      setInputMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };




  return (
    <>
      <div className={`flex flex-col justify-center ${styles.navUI}`}>
        <div className='flex items-end justify-center'>
          <Image src={ContactLogo} alt='' className='w-12 h-12' />
          <h1 className={`font-bold text-lg ${ubuntu.className}`}>Contact</h1>
        </div>

        <div>
          <ul>
            {users.filter(user => user._id !== currentUserId).map(user => (
              <li
                key={user._id}
                className={`${bree_serif.className} flex items-center p-2 ${styles.contact_list} hover:bg-gray-100 cursor-pointer ${selectedUser?._id === user._id ? 'bg-gray-200' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                {user.profilePic ? (
                  <div className="w-10 h-10 rounded-full mr-4 overflow-hidden"><img src={user.profilePic} className='object-cover w-ful h-full' alt={user.name} /></div>
                ) : (
                  <LuUserCircle2 size={48} className="mr-4" />
                )}
                <div className='flex justify-center items-center'>
                  <span className='text-xs'>{user.name}</span>
                  <Image src={DoMsg} alt='' className='w-8 h-8' />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {selectedUser && (
        <div className={`w-80 h-2/3 absolute top-16 right-60  flex flex-col justify-between p-4 ${styles.navUI}`}>
          <div>
            <div className='flex items-center justify-between px-2 border-b-2 border-black mb-2 pt-2'>
              <div className='flex items-end'>
                {selectedUser.profilePic ? <div className="w-10 h-10 rounded-full mr-4 overflow-hidden"> <img src={selectedUser.profilePic} className="object-cover w-full h-full" alt={selectedUser.name} /> </div> : <LuUserCircle2 size={48} className="mr-4" />}
                <span className='text-xs font-bold'>{selectedUser.name}</span>
              </div>
              <div
                onClick={() => setSelectedUser(null)}
                className='font-bold py-1 px-2 hover:bg-red-600 text-xs'>
                X
              </div>
            </div>
          </div>
          <div className={`overflow-y-auto ${styles.scrollbar_hide}`}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${message.sender === currentUser.id ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded-lg text-xs ${message.sender === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {message.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className='bg-white py-2 border-t border-gray-200'>
            <div className='flex items-center'>
              <input
                type='text'
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className='flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Type a message...'
              />
              <button
                type='submit'
                className='bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                <IoIosSend size={24} />
              </button>
            </div>
          </form>
        </div>)}
    </>
  )
}

export default Contact