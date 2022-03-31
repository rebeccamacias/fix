import { useState } from 'react';
import { Button } from '../common/button';

export const NewRoomModal = ({ createRoom, action, latitude, longitude }) => {
  const [name, setName] = useState('');

  return (
    <div className="overlay">
      <div className="modal-container">
        <div className="modal">
          <span className="title">Create New Chat Room</span>
          <input type="text" value={name} onChange={(e) => {setName(e.target.value)}} />
          <div className="button-container">
            <Button onClick={action}>Close</Button>
            <Button onClick={() => {createRoom(name, latitude, longitude)}}>Create Room</Button>
          </div>
        </div>
      </div>
    // </div>
  );
};