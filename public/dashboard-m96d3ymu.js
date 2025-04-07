import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, Col, Row } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { FaCoffee, FaHotel, FaRegChartBar, FaSuitcase, FaUserAlt } from 'react-icons/fa'

import { color } from '../../utility/color'

import { useDispatch } from 'react-redux'
import { setUsers } from '../../redux/action'

import { firestore } from '../../data/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { ClipLoader } from 'react-spinners'

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [allUsers, setAllUsers] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [isLoading, setLoading] = useState(true)

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      navigate("/")
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, allUsers])

  useEffect(() => {
    let users = []
    const data = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Users"));
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        dispatch(setUsers(users));
        setAllUsers(users);
        setLoading(false)
      } catch (err) {
        console.log("error message", err);
      };

    }
    data();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers]);

  useEffect(() => {
    let jobss = []
    const data = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "PostedJobs"));
        querySnapshot.forEach((doc) => {
          if (doc.data().isActive) {
            jobss.push(doc.data());
          }

        });

        setAllJobs(jobss);
        setLoading(false)
      } catch (err) {
        console.log("error message", err);
      };

    }
    data();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allJobs]);

  const applicants = allUsers && allUsers.filter((e) => {
    return e.userType === "Applicant"
  });
  const events = allUsers && allUsers.filter((e) => {
    return e.userType === "Event"
  });
  const resturants = allUsers && allUsers.filter((e) => {
    return e.userType === "Resturant"
  });

  const actveEventJobs = allJobs && allJobs.filter((e) => {
    return e.user.userType === "Event"
  })
  const actveRestaurantJobs = allJobs && allJobs.filter((e) => {
    return e.user.userType === "Resturant"
  })



  const totalUsers = [
    {
      title: "Total Applicants",
      icon: <FaUserAlt />,
      total_user: applicants && applicants.length
    },
    {
      title: "Total Events",
      icon: <FaRegChartBar />,
      total_user: events && events.length
    },
    {
      title: "Total Restaurants",
      icon: <FaCoffee />,
      total_user: (resturants && resturants.length)
    },
    {
      title: "Total Events Jobs",
      icon: <FaSuitcase />,
      total_user: (actveEventJobs && actveEventJobs.length)
    },
    {
      title: "Total Restaurants Jobs",
      icon: < FaHotel />,
      total_user: (actveRestaurantJobs && actveRestaurantJobs.length)
    }
  ]

  return (
    <div>
      <Row style={{ marginBottom: "10px", marginTop: "48px" }}>
        {
          totalUsers.map((e, index) => (
            <Col xs="4" key={index} style={{ marginBottom: "30px", height: "100px" }}>
              <Card className="card-chart" style={{
                backgroundColor: color.secondary, boxShadow: color.shadow
              }}>
                <CardHeader style={{ color: color.headerColor }}>
                  <Row>
                    <Col className="text-left" sm="12">
                      <h5 className="card-category" style={{ color: color.primary, }}>
                        <span style={{ marginRight: "12px" }}>{e.icon}</span>
                        {e.title}
                      </h5>
                      {!isLoading ?
                        <CardTitle tag="h3" style={{ marginLeft: "12px" }}>{e.total_user || 0}</CardTitle>
                        :
                        <ClipLoader
                          size={15}
                          color={color.primary}
                        />}
                    </Col>
                  </Row>
                </CardHeader>
              </Card>
            </Col>
          ))
        }
      </Row>

    </div>
  )
}

export default Dashboard