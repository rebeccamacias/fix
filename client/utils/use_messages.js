import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from './auth_context';
import { io } from 'socket.io-client';

export const useMessages = (chatRoom) => {
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef([]);
  const [socket, setSocket] = useState(null);
  const [authToken] = useContext(AuthContext);

  useEffect(() => {
    if (chatRoom) {
      const socket = io({
        auth: {
          token: authToken,
        },
        query: {
          chatRoomId: chatRoom.id,
        },
      });

      setSocket(socket);
      socket.on('message', (message) => {
        messagesRef.current.push(message);
        setMessages([...messagesRef.current]);
      });
      return () => {
        socket.off('message');
        socket.disconnect();
      };
    }
    return () => {};
  }, [chatRoom]); //rerun everytime the chatroom changes

  const sendMessage = (contents, user) => {
    socket.emit('message', {
      contents,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().getTime(),
    });
  };

  return [messages, sendMessage];
};