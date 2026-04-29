import React, { useState, useEffect } from 'react';
import RoomForm from '../components/rooms/RoomForm';
import RoomTable from '../components/rooms/RoomTable';
import { roomsAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

export default function Rooms() {
  const [roomList, setRoomList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const { refreshStats } = useAppContext();

  const fetchRooms = async () => {
    try {
      const data = await roomsAPI.getAll();
      setRoomList(data);
      refreshStats();
    } catch (e) {}
  };

  useEffect(() => { fetchRooms(); }, [refreshStats]);

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="max-w-5xl mx-auto flex flex-col h-full">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Manage Rooms</h1>
        <p className="text-slate-500 text-lg">Define the available rooms for scheduling classes.</p>
      </div>
      
      <RoomForm onRefresh={fetchRooms} editItem={editItem} setEditItem={setEditItem} />
      
      {roomList.length > 0 && <div className="w-full h-px bg-slate-200 mt-4 mb-2"></div>}
      
      <RoomTable roomList={roomList} onRefresh={fetchRooms} onEdit={setEditItem} />
    </motion.div>
  );
}
