import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ApiContext } from '../../utils/api_context';

import { Button } from '../common/button';
import { useMessages } from '../../utils/use_messages';
import { Message } from '../chat_room/message';
import { Rooms } from '../home/rooms';
import { Room } from '../home/room';

export const ChatRoom = () => {
  const [chatRoom, setChatRoom] = useState(null); //when a value has changed, rerender 
  const [contents, setContents] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const api = useContext(ApiContext);
  const { id } = useParams();
  const [messages, sendMessage] = useMessages(chatRoom);
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(async () => { //when the page first starts, executes this
    setLoading(true);
    if (!user) {
      const { user } = await api.get('/users/me');
      setUser(user);
    }
    const { chatRoom } = await api.get(`/chat_rooms/${id}`);
    setChatRoom(chatRoom);
    setLoading(false);
  }, [id]); //will rerun everytime the id changes

  if (loading) return 'Loading...';

  return (
    <div className="chat-container">
      <div>
        {messages.map((message) => (
          <Message message={message} key={message.timestamp}></Message>
        ))}
      </div>
      <div className="bottom-stuff">
        <input type="text" className="message-input" value={contents} onChange={(e) => setContents(e.target.value)} />
        <Button
          onClick={() => {
          sendMessage(contents, user)
          setContents('');
        }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};