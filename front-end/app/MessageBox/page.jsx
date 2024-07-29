'use client'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { IoIosSend } from "react-icons/io";
import { LuUserCircle2 } from "react-icons/lu";
import { IoMdArrowRoundBack } from "react-icons/io";
import styles from "../../styles/allcss.module.css"
import { Bree_Serif } from 'next/font/google';

const bree_serif = Bree_Serif({
  weight: '400',
  subsets: ['latin'],
})

const ChatPage = () => {

  const port_uri = process.env.PORT_URL

  const socket = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'


  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null)
  const [currentUserId, setCurrentUserId] = useState()
  const [isLoading, setIsLoading] = useState(true);
  const [chatHistories, setChatHistories] = useState()
  const [usersWithNewMessages, setUsersWithNewMessages] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('usersWithNewMessages');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return [];
});

  //Authorization
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  let id = null;
  let token = null;
  if (typeof window !== 'undefined') {
    id = localStorage.getItem('id');
    token = localStorage.getItem('token');
  }
  const headers = {
    id,
    authorization: `Bearer ${token}`
  }

  useEffect(() => {
    //Get current user
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${port_uri}app/user/user-info`, { headers });
        setCurrentUser(response.data.userInfo)
        setCurrentUserId(response.data.userInfo.id)
      } catch (error) {
        console.error('Error fetching current user:', error.response?.data || error.message);
      }
    };
    
    //Get all user
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${port_uri}app/user/all-users`, { headers });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
      }
    };

    //Get new messages
    const handleNewMessage = (message) => {
      if (message.sender !== currentUserId) {
        setMessages((prevMessages) => [...prevMessages, message]);
        setUsersWithNewMessages((prev) => {
          const updatedUsers = prev.includes(message.sender) ? prev : [...prev, message.sender];
          localStorage.setItem('usersWithNewMessages', JSON.stringify(updatedUsers));
          return updatedUsers;
        });
      }
    }

    //Call the function
    Promise.all([fetchCurrentUser(), fetchUsers()])
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));

    //Set up SocketIo
    socketRef.current = io(socket, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    //Handle events
    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    socketRef.current.on('newMessage', handleNewMessage);
    socketRef.current.on('messageSent', handleMessageSent);

    //Clean up
    return () => {
      socketRef.current.off('newMessage', handleNewMessage);
      socketRef.current.off('messageSent', handleMessageSent);
      socketRef.current.disconnect();
    };
  }, [])

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

  //Get previous chat
  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${port_uri}app/chat/history/${selectedUser._id}`, { headers });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error.response?.data || error.message);
    }
  };

  //Fetch chat history for all users
  useEffect(() => {
    const fetchChatHistoryForAllUsers = async () => {
      if (!users || !currentUser) return;
      const promises = users.filter(user => user._id !== currentUserId).map(user => {
        return axios.get(`${port_uri}app/chat/history/${user._id}`, { headers });
      });
      try {
        const responses = await Promise.all(promises);
        const chatHistories = responses.map(response => response.data);
        setChatHistories(chatHistories);
      } catch (error) {
        console.error('Error fetching chat histories:', error);
        setChatHistories([]);
      }
    };
    fetchChatHistoryForAllUsers();
  }, [users, currentUser, currentUserId, headers]);

  //Get last message for showing in chat list
  const getLastMessage = (userId) => {
    if (!chatHistories || !Array.isArray(chatHistories)) {
      return "No message";
    }
    const chatHistory = chatHistories.find(history =>
      history && history.length > 0 && (history[0].sender === userId || history[0].recipient === userId)
    );
    if (chatHistory && chatHistory.length > 0) {
      return chatHistory[chatHistory.length - 1].message;
    } else {
      return "No message";
    }
  };

  //Set user who sent new message
useEffect(() => {
  if (selectedUser) {
    fetchChatHistory();
    setUsersWithNewMessages((prev) => {
      const updatedUsers = prev.filter(id => id !== selectedUser._id);
      localStorage.setItem('usersWithNewMessages', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  }
}, [selectedUser]);

  //Set users with new messages in localStorage
useEffect(() => {
  localStorage.setItem('usersWithNewMessages', JSON.stringify(usersWithNewMessages));
}, [usersWithNewMessages]);
  
  useEffect(() => {
  const savedUsersWithNewMessages = localStorage.getItem('usersWithNewMessages');
  if (savedUsersWithNewMessages) {
    setUsersWithNewMessages(JSON.parse(savedUsersWithNewMessages));
  }
}, []);

  const handleMessageSent = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  //Send message
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

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className={`${styles.loader}`}></div>
      </div>
    )
  }

  return (
    <div className=" h-screen bg-gray-100">
      {selectedUser === null ? (
        <div className="w-full h-full flex flex-col bg-white border-b sm:border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 border-b-2">Chats</h2>
          <ul>
            {users.filter(user => user._id !== currentUser.id).map(user => (
              <li
                key={user._id}
                className={`flex items-center p-2 mb-2 hover:bg-gray-100 cursor-pointer ${
                  selectedUser?._id === user._id ? 'bg-gray-200' : ''
                } ${usersWithNewMessages.includes(user._id) ? 'font-bold' : ''}`}
                onClick={() => {
                  setSelectedUser(user);
                  setUsersWithNewMessages((prev) => prev.filter(id => id !== user._id));
                }}
              >
                {user.profilePic ? (
                  <div className=' w-12 h-12 rounded-full mr-4 overflow-hidden'>
                    <img src={user.profilePic} className="object-cover w-full h-full" alt={user.name} />
                  </div>  
                ) : (
                  <LuUserCircle2 size={48} className="mr-4" />
                )}
                <div className='flex flex-col'>
                  <span className={`${bree_serif.className}`}>{user.name}</span>
                  <span className='text-xs text-gray-600'>{getLastMessage(user._id)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-screen">
          <>
            <div className="flex items-center justify-start p-4 bg-white border-b border-gray-200">
              <button
                className="mr-2"
                onClick={() => setSelectedUser(null)}
              >
                <IoMdArrowRoundBack size={30} />
              </button>
                {selectedUser.profilePic ? (
                <div className="w-10 h-10 rounded-full mr-3 overflow-hidden">
                  <img src={selectedUser.profilePic} className="object-cover w-full h-full" alt={selectedUser.name} />
                </div>) : (
                <LuUserCircle2 size={40} className="mr-3" />
              )}
                <h3 className={`text-lg font-semibold ${bree_serif.className}`}>{selectedUser.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.sender === currentUser.id ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      message.sender === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="bg-white p-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <IoIosSend size={24} />
                </button>
              </div>
            </form>
          </>
        </div>
      )}
    </div>
  )
}

export default ChatPage;
