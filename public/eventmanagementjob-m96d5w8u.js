import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { firestore } from "../../../data/firebase";
import { GenericButton } from "../../../components/allButtons";
import { color } from "../../../utility/color";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EventManagementJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState();
  const [isDisable, setDisable] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setData(location?.state?.dataa);
  }, [location?.state?.dataa]);

  useEffect(() => {
    if (data) {
      if (!data.noOfJobs || !data.position || !data.JobType) {
        setDisable(true);
      } else {
        setDisable(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const dateConverter = (d) => {
    const dateObject = new Date(d);
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    const year = dateObject.getFullYear();
    const formattedDateString = `${year}-${month}-${day}`;
    return formattedDateString;
  };

  const updateJob = async (e) => {
    e.preventDefault();
    if (!data.position || !data.noOfJobs) {
      toast("Required field is missing");
    } else {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(
          collection(firestore, "PostedJobs")
        );
        querySnapshot.forEach(async (d) => {
          if (d.data().post_id === data?.post_id) {
            const userRef = doc(firestore, "PostedJobs", data.post_id);
            await updateDoc(userRef, data);
          }
        });

        setLoading(false);
        if (data.user.userType === "Event") {
          navigate("/event-jobs");
        }
        if (data.user.userType === "Resturant") {
          navigate("/jobs");
        }
      } catch (err) {
        console.log("error message", err);
      }
    }
  };

  return (
    <>
      {data && (
        <div className="row">
          <div className="col-12 pb-3" style={{ marginTop: "32px" }}>
            {data.user.userType === "Event" && <h3>Edit Event Job Details</h3>}
            {data.user.userType === "Resturant" && (
              <h3>Edit Restaurant Job Details</h3>
            )}
          </div>
          <div className="col-md-12">
            <div className="applicant-info ">
              <form className=" ">
                <div className="row  align-items-center mb-3">
                  <div className="col-md-2 text-md-end">
                    <label for="inputEmail4">Position :</label>
                  </div>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="position"
                      aria-label="position"
                      value={data ? data.position : "-"}
                      onChange={(e) =>
                        setData({ ...data, position: e.target.value })
                      }
                    />
                    {!data.position && (
                      <p className="editErrors">position is mandatory</p>
                    )}
                  </div>
                </div>

                {/* <div className="row mb-3">
                  <div className="col-md-2 text-md-end">
                    <label for="inputEmail4">Job Description :</label>
                  </div>
                  <div className="col-md-10">
                    <textarea
                      class="form-control"
                      id="exampleFormControlTextarea1"
                      rows="4"
                      placeholder="Will be able to view description about the job if any"
                      value={data ? data.desc : "-"}
                      onChange={(e) =>
                        setData({ ...data, desc: e.target.value })
                      }
                    />
                  </div>
                </div> */}
                <div className="row  align-items-center mb-3">
                  <div className="col-md-2 text-md-end">
                    <label for="inputEmail4">Job Category :</label>
                  </div>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="position"
                      aria-label="position"
                      value={
                        data
                          ? data.user.userType.toLowerCase() === "resturant"
                            ? "Restaurant"
                            : data.user.userType
                          : "-"
                      }
                      disabled
                    />
                  </div>
                </div>
                <div className="row align-items-center mb-3">
                  <div className="col-md-2 text-md-end">
                    <label for="inputEmail4">Job Type :</label>
                  </div>
                  <div className="col-md-10">
                    <select
                      class="form-select"
                      value={data && data.JobType}
                      onChange={(e) =>
                        setData({ ...data, JobType: e.target.value })
                      }
                      aria-label="Default select example"
                    >
                      {/* <option selected></option> */}
                      <option value="Part Time">Part Time</option>
                      <option value="Full Time">Full Time</option>
                    </select>
                  </div>
                  {!data.JobType && (
                    <p className="editErrors">Type is mandatory</p>
                  )}
                </div>
                <div className="row  align-items-center mb-3">
                  <div className="col-md-2 text-md-end">
                    <label for="inputEmail4">Posted Date :</label>
                  </div>
                  <div className="col-md-10">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="position"
                      aria-label="position"
                      value={data && dateConverter(data.createdAt)}
                      onChange={(e) =>
                        setData({ ...data, createdAt: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="row ms-md-3 g-md-4 g-3 align-items-center mb-3 justify-content-between">
                  <div className="col-md-3">
                    <div className="row align-items-center  ">
                      <div className="col-md-7 text-md-end">
                        <label for="inputEmail4">
                          Total Number of Positions :
                        </label>
                      </div>
                      <div className="col-md-5">
                        <input
                          type="number"
                          className="form-control"
                          value={data && data.noOfJobs}
                          onChange={(e) => {
                            // if(Number(e.target.value)>0){
                            setData({
                              ...data,
                              noOfJobs:
                                Number(e.target.value) > 0 && e.target.value,
                            });
                            // }
                          }}
                        />
                        {!data.noOfJobs && (
                          <p className="editErrors">
                            Please add number of openings
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="row align-items-center ">
                      <div className="col-md-7 text-md-end">
                        <label for="inputEmail4">
                          Total Number of Applied users :
                        </label>
                      </div>
                      <div className="col-md-5">
                        <input
                          type="number"
                          className="form-control"
                          value={data && data.applicants.length}
                          // onChange={(e) =>
                          //   setData({ ...data, noOfJobs: e.target.value })
                          // }
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="row align-items-center ">
                      <div className="col-md-7 text-md-end">
                        <label for="inputEmail4">
                          Number of users approved:
                        </label>
                      </div>
                      <div className="col-md-5">
                        <input
                          type="number"
                          className="form-control"
                          value={data ? data.usersApproved : "0"}
                          onChange={(e) =>
                            setData({
                              ...data,
                              usersApproved:
                                Number(e.target.value) >= 0 && e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-md-4 g-3  align-items-center mb-3 justify-content-center"></div>

                <div className="row  align-items-center mb-3">
                  <div className="col-md-2 text-md-end">
                    <label for="inputEmail4">Job Status :</label>
                  </div>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="OPEN"
                      aria-label="OPEN"
                      value={data && data.isActive ? "Active" : "Not Active"}
                      onChange={(e) =>
                        setData({ ...data, isActive: e.target.value })
                      }
                      disabled
                    />
                  </div>
                </div>
                <div className="row -4 g-3 align-items-center mt-md-5 mt-2 justify-content-center">
                  <div className="col-md-6 col-6 text-end">
                    {/* <button className='btn custom-btn' disabled={isDisable} onClick={updateJob}>Update</button> */}
                    <GenericButton
                      style={{
                        padding: "8px 32px",
                        fontSize: "16px",
                        background: color.primary,
                      }}
                      loading={isLoading}
                      onClick={updateJob}
                      title={"Update"}
                    />
                  </div>
                  <div className="col-md-6 col-6">
                    <button
                      className="btn btn2 btn-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(-1);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
}

export default EventManagementJob;
