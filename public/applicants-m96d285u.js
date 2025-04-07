import React, { useEffect, useState } from 'react'
import AllTables from '../../../components/AllTables'
import { useSelector } from 'react-redux'


const Applicants = () => {
  const users = useSelector(state => state?.users)
  const [applicants, setApplicants] = useState([])

  useEffect(() => {
    const applicants = users && users.filter((e) => {
      return e.userType === "Applicant"
    })

    setApplicants(applicants)
  }, [users]);

  const headerName = [
    { title: "PROFILE" },
    { title: "NAME" },
    { title: "EMAIL" },

    { title: "RATING" },
    { title: "ACTION" },
  ]

  return (
    <div className='content' style={{ marginTop: "32px" }}>

      <AllTables
        data={applicants}
        tableStyle={{
          maxHeight: `${window.innerHeight}px`,
          overflowY: 'auto'
        }}
        to={'/applicants/profile'}
        btnTitle={'View'}
        cardTitle={'All Applicants'}
        headerName={headerName}
        searchplaceholder={'Search Applicants By Name'}
      />

    </div>
  )
}

export default Applicants