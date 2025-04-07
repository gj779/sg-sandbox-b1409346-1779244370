import React, { useEffect, useState } from "react";
import { GenericButton } from "../../../components/allButtons";
import { useNavigate } from "react-router";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../../data/firebase";
import { ClipLoader } from "react-spinners";
import { color } from "../../../utility/color";

function CmsManagment() {
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const d = [];
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(firestore, "CMS"));
        querySnapshot.forEach((doc) => {
          d.push(doc.data());
        });
        setData(d);
        setLoading(false);
      } catch (err) {
        console.log("error message", err);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="row">
        <div className="col-12 pb-3">
          <h3>CMS Management</h3>
        </div>
        {!isLoading ? (
          <div className="col-md-10">
            {data && data.length > 0 ? <div className="applicant-info ">
              <div className="cms-page row border-bottom justify-content-between">
                <div className="col-6">
                  <h6 className="primary-color">Title</h6>
                </div>
                <div className="col-3">
                  <h6 className="primary-color">Action</h6>
                </div>
              </div>

              {data &&
                data.map((e) => {
                  return (
                    <div className="cms-page row mt-2 justify-content-between">
                      <div className="col-6">
                        <p>{e.title} </p>
                      </div>
                      <div className="col-3">
                        <GenericButton
                          className=" btn btn-secondary"
                          title={"Edit"}
                          state={e}
                          to={"/cms-pages"}
                        />
                      </div>
                    </div>
                  );
                })}
            </div> : 
            <h3 className="d-flex justify-content-center align-items-center text-bold">CMS policies not found</h3>
            }
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <ClipLoader size={100} color={color.primary} />
          </div>
        )}
      </div>
    </>
  );
}

export default CmsManagment;
