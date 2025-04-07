import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { firestore } from '../../../data/firebase';

function Notification() {

  const [noti, setNoti] = useState();


  useEffect(() => {
    let notifications = []
    const data = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Admin Notifications"));
        querySnapshot.forEach((doc) => {
          notifications.push(doc.data());
        });

        setNoti(notifications);
      } catch (err) {
        console.log("error message while fetching notifications", err);
      };

    }
    data();
  }, []);

  const timeCoverter = (timestamp) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const secondsAgo = currentTimestamp - timestamp;

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;

    let agoValue, agoUnit;

    if (secondsAgo < minute) {
      agoValue = secondsAgo;
      agoUnit = 'second';
    } else if (secondsAgo < hour) {
      agoValue = Math.floor(secondsAgo / minute);
      agoUnit = 'minute';
    } else if (secondsAgo < day) {
      agoValue = Math.floor(secondsAgo / hour);
      agoUnit = 'hour';
    } else if (secondsAgo < month) {
      agoValue = Math.floor(secondsAgo / day);
      agoUnit = 'day';
    } else if (secondsAgo < year) {
      agoValue = Math.floor(secondsAgo / month);
      agoUnit = 'month';
    } else {
      agoValue = Math.floor(secondsAgo / year);
      agoUnit = 'year';
    }

    if (agoValue !== 1) {
      agoUnit = agoUnit + 's';
    }

    return `${agoValue} ${agoUnit} ago`;
  }

  return (
    <>
      <div className='row g-3 '>
        <div className='col-12 pb-3'>
          <h4>Notifications</h4>
        </div>
        <div className='col-10'>
          {noti && noti.user_name ? noti.map((e) => {
            return (
              <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
                <h6 className='user-name'>{e.user_name}</h6>
                <span className='jon-tile'>{e.description}</span>
                <span className='time primary-color'>{timeCoverter(e.created_at.seconds)} </span>
              </div>
            )
          }) : <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>No data found</h1>}


        </div>
        {/* <div className='col-8'>
          <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
            <h6 className='user-name'>User Name </h6>
            <span className='jon-tile'> Job Title</span>
            <span className='time primary-color'>2 ago </span>
          </div>
        </div>
        <div className='col-8'>
          <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
            <h6 className='user-name'>User Name </h6>
            <span className='jon-tile'> Job Title</span>
            <span className='time primary-color'>2 ago </span>
          </div>
        </div>
        <div className='col-8'>
          <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
            <h6 className='user-name'>User Name </h6>
            <span className='jon-tile'> Job Title</span>
            <span className='time primary-color'>2 ago </span>
          </div>
        </div>
        <div className='col-8'>
          <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
            <h6 className='user-name'>User Name </h6>
            <span className='jon-tile'> Job Title</span>
            <span className='time primary-color'>2 ago </span>
          </div>
        </div>
        
        <div className='col-8'>
          <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
            <h6 className='user-name'>User Name </h6>
            <span className='jon-tile'> Job Title</span>
            <span className='time primary-color'>2 ago </span>
          </div>
        </div>
        <div className='col-8'>
          <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
            <h6 className='user-name'>User Name </h6>
            <span className='jon-tile'> Job Title</span>
            <span className='time primary-color'>2 ago </span>
          </div>
        </div>
        <div className='col-8'>
          <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
            <h6 className='user-name'>User Name </h6>
            <span className='jon-tile'> Job Title</span>
            <span className='time primary-color'>2 ago </span>
          </div>
        </div>
        <div className='col-8'>
          <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
            <h6 className='user-name'>User Name </h6>
            <span className='jon-tile'> Job Title</span>
            <span className='time primary-color'>2 ago </span>
          </div>
        </div>
        <div className='col-8'>
          <div className='notification-box applicant-info' style={{ display: "flex", justifyContent: "space-between" }}>
            <h6 className='user-name'>User Name </h6>
            <span className='jon-tile'> Job Title</span>
            <span className='time primary-color'>2 ago </span>
          </div>
        </div>
         */}

      </div>
    </>

  )
}

export default Notification