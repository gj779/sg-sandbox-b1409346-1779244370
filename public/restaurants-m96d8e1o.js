import React, { useEffect, useState } from 'react'
import AllTables from '../../../components/AllTables'
import { useSelector } from 'react-redux'

const Restaurants = () => {
  const users = useSelector(state => state?.users)
  const [restaurants, setRestaurants] = useState([])

  const headerName = [
    { title: "PROFILE" },
    { title: "NAME" },
    { title: "EMAIL" },

    { title: "RATING" },
    { title: "ACTION" },
  ]


  useEffect(() => {
    const restaurants = users && users.filter((e) => {
      return e.userType === "Resturant"
    })

    setRestaurants(restaurants)
  }, [users]);

  return (
    <div style={{ marginTop: "32px" }}>
      <AllTables
        tableStyle={{
          maxHeight: `${window.innerHeight}px`,
          overflowY: 'auto'
        }}
        data={restaurants}
        to={'/restaurant/profile'}
        btnTitle={'View'}
        cardTitle={'All Restaurants'}
        headerName={headerName}
        searchplaceholder={'Search Restaurants By Name'}
      />
    </div>
  )
}

export default Restaurants