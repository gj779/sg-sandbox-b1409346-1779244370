import React, { useEffect, useState } from 'react'
import AllTables from '../../../components/AllTables'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

const Events = () => {
  const navigate = useNavigate()
  const users = useSelector(state => state?.users)
  const [events, setEvents] = useState([])
  const token = localStorage.getItem("authToken");

  const headerName = [
    { title: "PROFILE" },
    { title: "NAME" },
    { title: "EMAIL" },
    { title: "RATING" },
    { title: "ACTION" },
  ]

  useEffect(() => {
    const events = users && users.filter((e) => {
      return e.userType === "Event"
    })

    setEvents(events)
  }, [users]);

  useEffect(() => {
    if (!token) {
      navigate("/")
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ marginTop: "32px" }}>

      <AllTables
        data={events}
        tableStyle={{
          maxHeight: `${window.innerHeight}px`,
          overflowY: 'auto'
        }}
        to={'/event/profile'}
        btnTitle={'View'}
        cardTitle={'All Events'}
        headerName={headerName}
        searchplaceholder={'Search Posted Events'}
      />

    </div>
  )
}

export default Events