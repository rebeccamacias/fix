import { useContext, useEffect, useState, useRef } from 'react';
import { ApiContext } from '../../utils/api_context';
import { useNavigate } from 'react-router';
import { Rooms } from './rooms';
import { Room } from './room';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChatRoom } from '../chat_room/_chat_room';
import { NewRoomModal } from './new_room_modal';

export const Home = () => {
  const api = useContext(ApiContext);

  const [chatRooms, setChatRooms] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [updates, setUpdates] = useState([]);
  const updatesRef = useRef([]);
  const navigate = useNavigate();

  useEffect(async () => {
    const res = await api.get('/users/me');
    const { chatRooms } = await api.get('/chat_rooms');
    setChatRooms(chatRooms);
    setUser(res.user);
    const watch = navigator.geolocation.watchPosition(
      (location) => { //never going to be called until the user pushes "allow"
        updatesRef.current.push(location);
        setUpdates([...updatesRef.current]);
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
        setLoading(false);
    }, 
    (err) => {
      setErrorMessage(err.message);
    }, [updates]);

    return () => {
      navigator.geolocation.clearWatch(watch);
    }
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const createRoom = async (name, latitude, longitude) => {
    setIsOpen(false);
    const { chatRoom } = await api.post('/chat_rooms', { name, latitude, longitude });
    setChatRooms([...chatRooms, chatRoom]);
    navigate(`/chat_rooms/${chatRoom.id}`);
  };

  // Code modified from users Manjunath Bilwar and Akash on StackOverflow
  // Date:    2018-09-06
  // Purpose: to calculate the distance, in km, from the user's location
  //          to surrounding chatRooms in order to display relevant existing 
  //          chat rooms
  // URL: https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
  function getDistance(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI * 60 * 1.1515 * 1.609344
    return dist
}

  return (
    <div className="container">
      <Rooms>
        {chatRooms.map((room )=> {
          if (getDistance(room.latitude, room.longitude, latitude, longitude) < 25) {
            return (
              <Room key={room.id} to={`chat_rooms/${room.id}`}>
                {room.name}
              </Room>
            );
          }
        })}
        <Room action={() => setIsOpen(true)}>+</Room>
      </Rooms>
      <div className="chat-window">
        <Routes>
          <Route path="chat_rooms/:id" element={<ChatRoom />} />
          <Route path="/*" element={<div className="instructions">Select a room to get started or create a new one.</div>} />
        </Routes>
      </div>
      {isOpen && <NewRoomModal createRoom={createRoom} action={() => setIsOpen(false)} latitude={latitude} longitude={longitude}/>}
    </div>
  );
};
