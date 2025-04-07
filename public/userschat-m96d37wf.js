import React, { useEffect, useRef } from 'react'
import "../../../styles/users-chat.css"
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { toGetDate, toGetTime } from '../../../components/common';
import { color } from '../../../utility/color';


function UsersChat() {
    const navigate = useNavigate();
    const location = useLocation();
    const chatContainerRef = useRef(null);

    useEffect(() => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }, [])

    return (
        <>
            <div class="chat">
                <div class="chat-container">
                    <div class="conversation">
                        <h4
                            style={{ position: "fixed", background: "white", width: "100vw", marginTop: "-20px", marginBottom: "16px", padding: "24px" }}>
                            <FaArrowLeft onClick={() => navigate(-1)} style={{ cursor: "pointer", color: color.primary, paddingBottom: "4px", marginBottom: "1px" }} />
                            {location?.state.users[0].user_type || ""}
                            <img style={{ width: "30px", height: "30px", borderRadius: "50%", margin: "0 8px" }} src={location?.state.users[0].user_photo} alt="" />
                            {location?.state.users[0].user_name + " "}
                            &
                            {location?.state.users[1].user_type || ""}
                            <img style={{ width: "30px", height: "30px", borderRadius: "50%", margin: "0 8px" }} src={location?.state.users[1].user_photo} alt="" />
                            {location?.state.users[1].user_name}
                        </h4>
                        <div class="conversation-container" ref={chatContainerRef}>
                            {location?.state?.messages && location?.state?.messages.map((e) => {
                                return (
                                    <div key={e._id}>
                                        {location?.state.users[1]._id === e.receiver_id
                                            && <div className='message sent'>
                                                <span style={{ fontSize: "12px", marginLeft: "8px", color: "gray" }}>{location?.state.users[0].user_name}</span>
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    background: "#E0DEED",

                                                    borderRadius: "10px 10px 0 10px",
                                                    padding: "10px"
                                                }}>
                                                    <span>{e.text}</span>

                                                    <span class="metadata" style={{ fontWeight: "600" }}>
                                                        <span
                                                            class="time"
                                                            style={{ fontSize: "10px", marginRight: "12px" }}
                                                        >
                                                            {toGetTime(e.createdAt)}
                                                        </span>
                                                        <span class="time" style={{ fontSize: "10px" }}>{toGetDate(e.createdAt)} </span>
                                                    </span>
                                                </div>
                                            </div>}

                                        {location?.state.users[0]._id === e.receiver_id
                                            && <div className='message received'>
                                                <span style={{ fontSize: "12px", marginLeft: "8px", color: "gray" }}>{location?.state.users[1].user_name}</span>
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    background: "#E0DEED",

                                                    borderRadius: "10px 10px 0 10px",
                                                    padding: "10px"
                                                }}>
                                                    <span>{e.text}</span>

                                                    <span class="metadata" style={{ fontWeight: "600" }}>
                                                        <span
                                                            class="time"
                                                            style={{ fontSize: "10px", marginRight: "12px" }}
                                                        >
                                                            {toGetTime(e.createdAt)}
                                                        </span>
                                                        <span class="time" style={{ fontSize: "10px" }}>{toGetDate(e.createdAt)} </span>
                                                    </span>
                                                </div>
                                            </div>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UsersChat
