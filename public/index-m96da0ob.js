import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Applicants from "../layouts/pages/applicants/Applicants";
import Chat from "../layouts/pages/chat/Chat";
import Dashboard from "../layouts/pages/Dashboard";
import Events from "../layouts/pages/events/Events";
import Jobs from "../layouts/pages/jobs/Jobs";
import JobsProfile from "../layouts/pages/jobs/JobsProfile";
import Login from "../layouts/pages/Login";
import Profile from "../layouts/pages/profile/Profile";
import Restaurants from "../layouts/pages/restaurants/Restaurants";
import Sidebar from "../layouts/sidebar/Sidebar";
import EditProfile from "../layouts/pages/edit-profile/EditProfile";
import EditApplicant from "../layouts/pages/edit-applicant/EditApplicant";
import RestaurantUser from "../layouts/pages/restaurant-user/RestaurantUser";
import RestaurantJob from "../layouts/pages/restaurant-job/RestaurantJob";
import EventManagementUser from "../layouts/pages/event-management-user/EventManagementUser";
import EventManagementJob from "../layouts/pages/event-management-job/EventManagementJob";
import PrivacyPolicy from "../layouts/pages/cms-pages/PrivacyPolicy";
import EventJobs from "../layouts/pages/jobs/EventJobs";
import Notification from "../layouts/pages/notification/Notification";
import Header from "../components/Header";
import CmsManagment from "../layouts/pages/cms-managment/CmsManagment.js";
import Chats from "../layouts/pages/chats/Chats.js";
import UsersChat from "../layouts/pages/chats/UsersChat.js";
import { firestore } from "../data/firebase.js";
import { collection, getDocs } from "firebase/firestore";
import DeleteAccount from "../layouts/pages/DeleteAccount/DeleteAccount.jsx";

const AppRoutes = () => {
  let userType = localStorage.getItem("userType");
  const [users, setUsers] = useState();

  useEffect(() => {
    let user = [];
    const data = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Users"));

        querySnapshot.forEach((doc) => {
          user.push(doc.data());
        });
      } catch (err) {
        console.log("error message on route", err);
        localStorage.setItem("userType", "");
      }
    };
    data();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    userType = localStorage.getItem("userType");
      }, [localStorage]);

  return (
    <BrowserRouter>
    {userType !== "admin" ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
        </Routes>
      ) : (
        <Sidebar>
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applicants" element={<Applicants />} />
            <Route
              path="/applicants/profile"
              element={<Profile profileTitle={"Applicant Profile"} />}
            />
            <Route
              path="/event/profile"
              element={<Profile profileTitle={"Event Profile"} />}
            />
            <Route
              path="/restaurant/profile"
              element={<Profile profileTitle={"Restaurant Profile"} />}
            />
            <Route path="/events" element={<Events />} />
            <Route path="/restaurant" element={<Restaurants />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/event-jobs" element={<EventJobs />} />
            <Route path="/jobs/profile" element={<JobsProfile />} />
            <Route path="/edit-profile/" element={<EditProfile />} />
            <Route path="/edit-applicant/" element={<EditApplicant />} />
            <Route path="/restaurant-user/" element={<RestaurantUser />} />
            <Route path="/restaurant-job/" element={<RestaurantJob />} />
            <Route
              path="/event-management-user/"
              element={<EventManagementUser />}
            />
            <Route
              path="/event-management-job/"
              element={<EventManagementJob />}
            />
            <Route path="/cms-pages/" element={<PrivacyPolicy />} />
            <Route path="/notification/" element={<Notification />} />
            <Route path="/cms-managment/" element={<CmsManagment />} />
            <Route path="/chats/" element={<Chats />} />
            <Route path="/chats/users-chat" element={<UsersChat />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Sidebar>
      )}
    </BrowserRouter>
  );
};

export default AppRoutes;
