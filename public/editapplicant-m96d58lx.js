import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { FaDownload, FaUpload } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router";
import { firestore, storage } from "../../../data/firebase";
import Rating from "../../../components/Ratings";
import { GenericButton } from "../../../components/allButtons";
import { getDownloadURL, ref, uploadBytes, refFromURL } from "firebase/storage";
import { ClipLoader } from "react-spinners";
import { color } from "../../../utility/color";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditApplicant() {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicant, setApplicant] = useState({});
  const [isDisable, setDisable] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [country, setCountry] = useState();
  const [states, setStates] = useState();
  const [cities, setCities] = useState();
  const [selectedImage, setSelectedImage] = useState();

  useEffect(() => {
    const data = location?.state?.dataa;
    setApplicant(data);
    setSelectedImage(data.profilePhoto);
  }, [location?.state?.dataa]);

  const updateProfile = async (e) => {
    e.preventDefault();
    if (!applicant.firstName || !applicant.lastName) {
      toast("Required field is missing");
    } else {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(firestore, "Users"));
        querySnapshot.forEach(async (d) => {
          if (d.data().user_id === applicant?.user_id) {
            const userRef = doc(firestore, "Users", applicant.user_id);
            await updateDoc(userRef, applicant);
          }
        });
        setLoading(false);
        if (applicant.userType.toLowerCase() === "applicant") {
          navigate("/applicants");
        }
      } catch (err) {
        console.log("error message", err);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/positions"
        );
        const result = await response.json();
        setCountry(result.data);
      } catch (error) {
        console.log("error while fetching counties : ", error);
      }
    };
    fetchData();

    const cont = async () => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              country: applicant && applicant.location.country.name,
            }),
          }
        );

        const result = await response.json();
        setStates(result.data.states);
      } catch (error) {
        console.log("error while fetching states", error);
      }
    };
    cont();

    const ste = async () => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/state/cities",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              state: applicant.location.state.name,
              country: applicant.location.country.name,
            }),
          }
        );

        const result = await response.json();
        setCities(result.data);
        // setApplicant({ ...applicant, state: state })
      } catch (error) {
        console.log("error while fetching cities", error);
      }
    };
    ste();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicant]);

  const selectCountry = async (country) => {
    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ country }),
        }
      );

      const result = await response.json();
      setStates(result.data.states);
      setApplicant((prevState) => ({
        ...prevState,
        location: {
          ...prevState.location,
          country: {
            ...prevState.location.state,
            name: country,
          },
        },
      }));
    } catch (error) {
      console.log("error while fetching states", error);
    }
  };

  const selectState = async (state) => {
    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: state, country: applicant.country }),
        }
      );

      const result = await response.json();
      setCities(result.data);
      setApplicant((prevState) => ({
        ...prevState,
        location: {
          ...prevState.location,
          state: {
            ...prevState.location.state,
            name: state,
          },
        },
      }));
    } catch (error) {
      console.log("error while fetching states", error);
    }
  };

  const uploadImage = () => {
    document.getElementById("image-upload").click();
  };
  const handleChangeImage = async (e) => {
    e.preventDefault();
    try {
      setImgLoading(true);
      const img = applicant.profilePhoto;
      // const path = img.split(storage.app.options.storageBucket)[1];
      const existingImageRef = ref(storage, img);
      console.log(img);
      const inputElement = document.getElementById("image-upload");
      const newImageFile = inputElement.files[0];
      await uploadBytes(existingImageRef, newImageFile);
      console.log("image changed");
      setSelectedImage(URL.createObjectURL(newImageFile));
      setImgLoading(false);
    } catch (error) {
      console.error("Error changing image:", error);
    }
  };

  return (
    <div style={{ marginTop: "32px" }}>
      {applicant &&
        (applicant.userType === "Applicant" ||
          applicant.userType === "Resturant" ||
          applicant.userType === "Event") && (
          <div className="row">
            <div className="col-12 pb-3">
              <h3>Edit {applicant && applicant.userType} Details</h3>
            </div>
            <div className="col-md-12">
              <div className="applicant-info ">
                <form className=" ">
                  <div className="row  mb-3">
                    <div className="col-md-10">
                      <div className="profile-img-box">
                        {selectedImage && (
                          <img
                            src={selectedImage}
                            style={{ height: "100px", width: "100px" }}
                            alt=""
                          />
                        )}

                        {imgLoading ? (
                          <ClipLoader size={30} color={color.primary} />
                        ) : (
                          <FaUpload
                            onClick={uploadImage}
                            className="fa-upload-image"
                            style={{ cursor: "pointer" }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="uploader-profile">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleChangeImage}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                  <div className="row  align-items-center mb-3">
                    <div className="col-md-2 text-md-end">
                      <label for="inputEmail4">First Name :</label>
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="First name"
                        aria-label="First Name"
                        value={applicant ? applicant.firstName : "-"}
                        onChange={(e) =>
                          setApplicant({
                            ...applicant,
                            firstName: e.target.value,
                          })
                        }
                      />
                      {!applicant.firstName && (
                        <p className="editErrors">First name is mandatory</p>
                      )}
                    </div>
                    <div className="col-md-2 text-md-end">
                      <label for="inputEmail4">Last Name :</label>
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Last name"
                        aria-label="Last name"
                        value={applicant ? applicant.lastName : "-"}
                        onChange={(e) =>
                          setApplicant({
                            ...applicant,
                            lastName: e.target.value,
                          })
                        }
                      />
                      {!applicant.lastName && (
                        <p className="editErrors">Last name is mandatory</p>
                      )}
                    </div>
                  </div>

                  <div className="row  align-items-center mb-3">
                    <div className="col-md-2 text-md-end">
                      <label for="inputEmail4">Email ID :</label>
                    </div>
                    <div className="col-md-10">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email ID"
                        aria-label="Email ID"
                        value={applicant ? applicant.email : "-"}
                        onChange={(e) =>
                          setApplicant({ ...applicant, email: e.target.value })
                        }
                        disabled
                      />
                      {!applicant.email && (
                        <p className="editErrors">Email is mandatory</p>
                      )}
                    </div>
                  </div>
                  <div className="row  align-items-center mb-3">
                    <div className="col-md-2 text-md-end">
                      <label for="inputEmail4">Country :</label>
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={applicant && applicant.location.country.name}
                        onChange={(e) => selectCountry(e.target.value)}
                      >
                        <option>Select country</option>
                        {country &&
                          country.map((e) => {
                            return <option value={e.name}>{e.name}</option>;
                          })}
                      </select>

                      {!applicant.location.country.name && (
                        <p className="editErrors">Country is mandatory</p>
                      )}
                    </div>
                  </div>
                  <div className="row  align-items-center mb-3">
                    <div className="col-md-2 text-md-end">
                      <label for="inputEmail4">State :</label>
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={applicant.location.state.name}
                        onChange={(e) => selectState(e.target.value)}
                      >
                        <option>Select state</option>
                        {states &&
                          states.map((e) => {
                            return <option value={e.name}>{e.name}</option>;
                          })}
                      </select>

                      {!applicant.location.state.name && (
                        <p className="editErrors">State is mandatory</p>
                      )}
                    </div>
                  </div>
                  <div className="row  align-items-center mb-3">
                    <div className="col-md-2 text-md-end">
                      <label for="inputEmail4">City :</label>
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={applicant && applicant.location.city}
                        onChange={(e) => {
                          setApplicant((prevState) => ({
                            ...prevState,
                            location: {
                              ...prevState.location,
                              city: e.target.value,
                            },
                          }));
                        }}
                      >
                        <option>Select city</option>
                        {cities &&
                          cities.map((e) => {
                            return <option value={e}>{e}</option>;
                          })}
                      </select>

                      {!applicant.location.city && (
                        <p className="editErrors">City is mandatory</p>
                      )}
                    </div>
                  </div>
                  <div className="row  align-items-center mb-3">
                    <div className="col-md-2 text-md-end">
                      <label for="inputEmail4">Ratings :</label>
                    </div>
                    <div className="col-md-10">
                      <Rating
                        max={5}
                        value={
                          applicant && applicant.ratings ? applicant.ratings : 2
                        }
                      />
                    </div>
                  </div>
                  {/* <div className='row  mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Description :</label>
                                </div>
                                <div className="col-md-10">
                                    <textarea
                                        class="form-control"
                                        id="exampleFormControlTextarea1"
                                        rows="3"
                                        value={applicant ? applicant.description : "-"}
                                        onChange={(e) => setApplicant({ ...applicant, description: e.target.value })}
                                        placeholder='Description' />
                                    {!applicant.description && <p className='editErrors'>Description is mandatory</p>}

                                </div>
                            </div> */}

                  {applicant.userType === "Applicant" && (
                    <div className="row  align-items-center">
                      <div className="col-sm-2 text-md-end">
                        <label for="inputEmail4">Resume :</label>
                      </div>
                      <div className="col-sm-10">
                        <button
                          className="btn custom-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            if (applicant && applicant.resume) {
                              window.open(applicant.resume, "_blank");
                            } else {
                              window.alert("Resume not found!!!");
                            }
                          }}
                        >
                          Download Resume <FaDownload />
                        </button>
                      </div>
                    </div>
                  )}
                  {applicant.userType === "Resturant" && (
                    <div className="col-md-6">
                      <h3>Images</h3>
                      <div className="images-box mt-3">
                        {applicant &&
                          applicant.photos.map((e) => {
                            return (
                              <div className="images-list">
                                <img src="logo.png" className="" alt="" />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  <div className="row -4 g-3 align-items-center mt-md-5 mt-2 justify-content-center">
                    <div className="col-md-6 col-6 text-end">
                      <GenericButton
                        style={{
                          padding: "8px 32px",
                          fontSize: "16px",
                          background: color.primary,
                        }}
                        loading={isLoading}
                        // disabled={isDisable}
                        onClick={updateProfile}
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
    </div>
  );
}

export default EditApplicant;
