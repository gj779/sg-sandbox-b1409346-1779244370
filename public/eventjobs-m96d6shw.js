import React, { useEffect, useState } from 'react'

// common
import AllTables from '../../../components/AllTables'

// firebase
import { collection, getDocs } from 'firebase/firestore'
import { firestore } from '../../../data/firebase'

// redux
import { setJobs } from '../../../redux/action'
import { useDispatch } from 'react-redux'

const EventJobs = () => {
    const dispatch = useDispatch();
    const [allJobs, setAllJobs] = useState([]);

    const headerName = [
        { title: 'TITLE' },
        { title: 'CATEGORY' },
        { title: 'TYPE' },
        { title: 'APPLICANTS' },
        { title: 'ADDRESS' },
        { title: 'CONTACT' },
        { title: 'ACTION' }
    ]

    useEffect(() => {
        const data = async () => {
            let allJobs = []
            const querySnapshot = await getDocs(collection(firestore, "PostedJobs"));
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    allJobs.push(doc.data());
                });
            }
            const eventsJobs = allJobs && allJobs.filter((e) => {
                return e.user.userType === "Event"
            })
            setAllJobs(eventsJobs)
            dispatch(setJobs(allJobs))
        }
        data();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allJobs]);

    return (
        <div style={{ marginTop: "32px" }}>
            <AllTables
                isAllJobs
                // tableStyle={{ maxHeight: `${window.innerHeight - 350}px`, overflowY: 'auto' }} 
                btnTitle={'View'} to={'/jobs/profile'} title={'Posted Jobs'} headerName={headerName}
                searchplaceholder={'Search job by job type'} data={allJobs} cardTitle={'Events Posted Jobs'}
            />
        </div>
    )
}

export default EventJobs