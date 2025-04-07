import React, { useState, useEffect } from 'react'
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../data/firebase';
import { ClipLoader } from 'react-spinners';
import { useDispatch, useSelector } from 'react-redux';
import { setPage } from '../../../redux/action';
import { color } from '../../../utility/color';


function Chats() {
    const dispatch = useDispatch()
    const [chats, setChats] = useState()
    const [isLoading, setLoading] = useState(true)

    const currentPage = useSelector(state => state?.currentPage) || 1;
    const itemsPerPage = useSelector(state => state.itemPerPage) || 10;
    const sortedChats = chats && chats.sort((a, b) => b.last_message_time - a.last_message_time);
    const currentData = sortedChats && sortedChats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const maxPage = sortedChats && (Math.ceil(sortedChats.length / itemsPerPage));

    useEffect(() => {
        let chatsData = []
        const data = async () => {
            const chat = await getDocs(collection(firestore, "Chats"));
            chat.forEach((doc) => {
                chatsData.push(doc.data())
            })
            setChats(chatsData)
            setLoading(false)
        }
        data();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chats])


    const timeConverter = (timestamp) => {
        const secondsAgo = (Date.now() - timestamp) / 1000;
        const minute = 60;
        const hour = minute * 60;
        const day = hour * 24;
        const month = day * 30;
        const year = day * 365;
        let agoValue, agoUnit;
        if (secondsAgo < minute) {
            agoValue = secondsAgo + 3;
            agoUnit = 's';
        } else if (secondsAgo < hour) {
            agoValue = Math.floor(secondsAgo / minute);
            agoUnit = 'min';
        } else if (secondsAgo < day) {
            agoValue = Math.floor(secondsAgo / hour);
            agoUnit = 'hr';
        } else if (secondsAgo < month) {
            agoValue = Math.floor(secondsAgo / day);
            agoUnit = 'd';
        } else if (secondsAgo < year) {
            agoValue = Math.floor(secondsAgo / month);
            agoUnit = 'month';
        } else {
            agoValue = Math.floor(secondsAgo / year);
            agoUnit = 'yr';
        }
        const ago = Math.floor(agoValue)
        return `${ago}${agoUnit} ago`;
    }

    const deleteChat = async (id) => {
        await deleteDoc(doc(firestore, "Chats", id))
    }

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= maxPage) {
            dispatch(setPage(pageNumber));
        }
    };

    return (
        <>
            <div className='row g-3 '>
                <div className='col-12 pb-3'>
                    <h4>Chats</h4>
                </div>
                {!isLoading ?
                    <div>{
                        currentData && currentData.length > 0 ? (<div>
                            {chats && currentData.map((e) => {
                                return (
                                    <div className='col-10 chat-box'>
                                        <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>

                                            <div className='chats-container'>
                                                <div className="chats-photo-container">
                                                    <img className="chats-photo" src={e.users[0].user_photo} alt={e.users[0].user_photo} />
                                                </div>
                                                <span style={{ margin: "0 8px", fontSize: "16px", fontWeight: "700" }}>{e.users[0].user_name} chat with </span>

                                                <div className="chats-photo-container">
                                                    <img className="chats-photo" src={e.users[1].user_photo} alt={e.users[0].user_photo} />
                                                </div>
                                                <span style={{ margin: "0 8px", fontSize: "16px", fontWeight: "700" }}>{e.users[1].user_name}</span>
                                                <span style={{ fontSize: "12px", color: color.primary, fontWeight: "600" }}>{timeConverter(e.last_message_time)}</span>
                                            </div>
                                            <div>

                                                <Link to={"/chats/users-chat"} state={e} style={{ textDecoration: "none", color: color.primary, marginRight: "16px" }}>
                                                    <FaEye />
                                                </Link>

                                                <span className='trash-icon' onClick={() => deleteChat(e.roomId)}><FaTrash /></span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>) : (<h3 style={{ textAlign: "center" }}>No data found</h3>)
                    }

                    </div> :
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }} >
                        <ClipLoader
                            size={100}
                            color={color.primary}
                        />
                    </div>
                }
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", marginTop: "24px" }}>
                    {currentPage !== 1 && <FaAngleDoubleLeft style={{ fontSize: "24px", cursor: "pointer" }} onClick={() => handlePageChange(currentPage - 1)} />}
                    {!isLoading && chats && chats.length > 10 && <span style={{ marginLeft: "16px", marginRight: "16px" }}>{currentPage}</span>}
                    {maxPage !== currentPage && <FaAngleDoubleRight style={{ fontSize: "24px", cursor: "pointer" }} onClick={() => handlePageChange(currentPage + 1)} />}
                </div>
            </div>
        </>

    )
}

export default Chats