import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { BsFillBellFill } from "react-icons/bs";
import { BiUserCircle } from "react-icons/bi";
import { auth } from "../data/firebase";
import { useSelector } from "react-redux";

function Header({ children }) {
  const navigate = useNavigate();
  const currentUser = auth?.currentUser;
  const users = useSelector((state) => state.users);
  const [user, setUser] = useState();

  useEffect(() => {
    users &&
      // eslint-disable-next-line array-callback-return
      users.map((e) => {
        if (e.user_id === currentUser.uid) {
          setUser(e);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  return (
    <div className="header-top-bar d-flex justify-content-end align-items-center sticky-top">
      <div className="notification-btn">
        <div className="dropdown text-white">
          <button
            className="btn"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            onClick={() => {
              navigate("/notification");
            }}
          >
            <BsFillBellFill />
          </button>
        </div>
      </div>
      <div className="user-profile-btn">
        <Link to={"/edit-profile"}>
          {user && user ? (
            <img
              src={user.profilePhoto}
              alt={user.profilePhoto}
              style={{ width: "100%" }}
            />
          ) : (
            <BiUserCircle />
          )}
        </Link>
      </div>
    </div>
  );
}

export default Header;
