import React, { useEffect, useState } from 'react'
import Editor from '../components/Editor'
import Client from '../components/Client';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../components/Loader';

const EditorPage = () => {
  const [clients, setClients] = useState([]);

  const { roomId } = useParams();
  const navigate = useNavigate()

  useEffect(() => {
    // verifies whether the roomId is valid
    const verifyRoom = async () => {
      try {
        await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/room/verify/${roomId}`
      );
      }
      catch (err) {
        toast.error(err.response.data.message)
        navigate('/')
      }
    }

    verifyRoom()

  }, [roomId])

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
    toast.success("RoomID copied to clipboard");
  }

  const handleLeave = () => {
    navigate('/')
  }

  return (
    <div className="editor_page">
      <div className="sidebar">
        <Loader />
        <div className="collaborators">Collaborators</div>
        <div className="clientList">
          {clients.map((client) => {
            return <Client {...client} />;
          })}

          <div className="btns">
            <div className="btn copyBtn" onClick={handleCopy}>
              Copy Room Id
            </div>
            <div className="btn leaveBtn" onClick={handleLeave}>
              Leave Room
            </div>
          </div>
        </div>
      </div>
      <Editor setClients={setClients} />
    </div>
  );
}

export default EditorPage