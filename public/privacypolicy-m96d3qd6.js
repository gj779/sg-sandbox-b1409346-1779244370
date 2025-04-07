import React, { useEffect, useState } from 'react'

import { useLocation, useNavigate } from "react-router-dom";
import { GenericButton } from '../../../components/allButtons';
import { firestore } from '../../../data/firebase';
import { addDoc, collection, deleteDoc, deleteField, doc, getDocs, updateDoc } from 'firebase/firestore';
import { color } from '../../../utility/color';


function PrivacyPolicy() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState();
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const d = []
      try {
        const querySnapshot = await getDocs(collection(firestore, "CMS"));
        querySnapshot.forEach((doc) => {
          d.push(doc.data())
        });
        const cms = d && d.filter((e) => {
          return e.cms_id === location?.state?.cms_id
        })

        setData(cms[0])

      } catch (err) {
        console.log("error message", err);
      };
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const updatePolicies = async (e) => {
    try {
      setLoading(true)
      const myCollection = collection(firestore, 'CMS');
      const myDoc = doc(myCollection, data.cms_id);
      await updateDoc(myDoc, data)
      setLoading(false)
      navigate(-1)
    } catch (error) {
      console.error('Error adding documents: ', error);
    }
  }





  return (
    <>
      <div className='row' style={{ marginTop: "24px" }}>
        <div className='col-12 pb-3'>
          <h3>Update {data && data.title}</h3>
        </div>
        <div className='col-md-12'>
          <div className='applicant-info '>
            <div className="mb-2">
              <h4>{data && data.title}</h4>
            </div>
            <div className="mb-2">
              <textarea
                className="form-control"
                id="cms-page-content"
                value={data && data.description}
                onChange={(e) => { setData({ ...data, description: e.target.value }) }}
              />

              <div className='row -4 g-3 align-items-center mt-md-4 mt-1 justify-content-end'>
                <div className="col-md-6 col-6 text-end">
                  <GenericButton
                    className='btn btn btn-danger'
                    style={{ fontSize: "20px", padding: "5px 10px", background: color.primary }}
                    title={"Save changes"}
                    loading={isLoading}
                    onClick={updatePolicies}
                  >

                  </GenericButton>
                </div>
                <div className="col-md-6 col-6">
                  <GenericButton
                    className='btn btn btn-danger'
                    style={{ fontSize: "20px", padding: "5px 10px", background: color.primary }}
                    title={"Cancel"}
                    to={-1}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default PrivacyPolicy