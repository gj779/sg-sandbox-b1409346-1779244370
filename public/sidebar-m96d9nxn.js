import React, { useState } from 'react'
import { FaBars } from 'react-icons/fa';
import { GiCrossedBones } from 'react-icons/gi'
import { RiSignalTowerFill } from 'react-icons/ri'
import { NavLink, useNavigate } from 'react-router-dom';
import { menuItem } from '../../data/dummyData';
import { getAuth, signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { logOut, userLogin } from '../../redux/action';


const Sidebar = ({ children }) => {
    const auth = getAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onLogOut = async () => {
        try {
            await signOut(auth);
            navigate("/")
            localStorage.removeItem("authToken")
            localStorage.removeItem("userType")
            localStorage.removeItem("name")
            localStorage.removeItem("email")
            dispatch(logOut())
            dispatch(userLogin({}))
            window.location.reload();

        } catch (error) {
            console.error("Error logging out: ", error);
        }
    }

    return (
        <div className="container-fluid" style={{ padding: 0, height: "100%" }}>
            <div style={{ width: isOpen ? "255px" : "50px" }} className="sidebar">

                <div style={{ marginLeft: isOpen ? "10px" : "10px" }} className="bars">
                    {!isOpen ? <FaBars onClick={() => setIsOpen(!isOpen)} style={{ color: "#fff", marginTop: '10px', cursor: "pointer" }} /> : <GiCrossedBones onClick={() => setIsOpen(!isOpen)} style={{ height: "20px", marginTop: "10px", cursor: "pointer" }} />}
                </div>
                <div className="top_section">

                    <img src='logo.png' className='logo' alt="" style={{ display: isOpen ? "block" : "none", textDecoration: "none", fontSize: "18px" }} />

                </div>
                {
                    menuItem.map((item, index) => (
                        <NavLink to={item.path} key={index} className="link" activeclassname="active" >
                            <div className="icon">{item.icon}</div>
                            <div style={{ display: isOpen ? "block" : "none", fontSize: "18px" }} className="link_text">{item.name}</div>
                        </NavLink>
                    ))
                }
                <div style={{ marginLeft: isOpen ? "10px" : "10px" }} to="/" onClick={onLogOut} className="bars" >
                    <RiSignalTowerFill style={{ color: "#fff", position: 'absolute', bottom: "10px", cursor: "pointer", transform: 'rotate(180deg)' }} />
                </div>

            </div>
            <main className='content-area'>{children}</main>
        </div>
    );
}

export default Sidebar