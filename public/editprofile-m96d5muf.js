/* eslint-disable array-callback-return */
import React, { useEffect, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { auth, firestore, storage } from "../../../data/firebase";
import { collection, doc, getDocs, updateDoc } from "@firebase/firestore";
import { ref, uploadBytes } from "@firebase/storage";
import { getAuth, sendPasswordResetEmail } from "@firebase/auth";
import { useDispatch } from "react-redux";
import { setUsers } from "../../../redux/action";
import { FaUpload } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { color } from "../../../utility/color";

function EditProfile() {
  const [user, setUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const currentUser = auth?.currentUser;
  const dispatch = useDispatch();
  const [imgLoading, setImgLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState();

  useEffect(() => {
    const admin =
      allUsers &&
      allUsers.filter((e) => {
        return e.user_id === currentUser?.uid;
      });
    setUser(admin[0]);
    allUsers &&
      allUsers.map((e) => {
        if (e.user_id === currentUser?.uid) {
          setSelectedImage(e.profilePhoto);
        }
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers]);

  useEffect(() => {
    let users = [];
    const data = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Users"));
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        dispatch(setUsers(users));
        setAllUsers(users);
      } catch (err) {
        console.log("error message", err);
      }
    };
    data();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadImage = () => {
    document.getElementById("image-upload1").click();
  };
  const handleChangeImage = async (e) => {
    e.preventDefault();
    try {
      setImgLoading(true);
      const img = user.profilePhoto;
      // const path = img.split(storage.app.options.storageBucket);
      
      const existingImageRef = ref(storage, img);
      const inputElement = document.getElementById("image-upload1");
      const newImageFile = inputElement.files[0];
      await uploadBytes(existingImageRef, newImageFile)
      setSelectedImage(URL.createObjectURL(newImageFile));
      setImgLoading(false);
    } catch (error) {
      console.error("Error changing image:", error);
    }
  };

  const changePass = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    sendPasswordResetEmail(auth, user.email)
      .then(() => {
        window.alert(
          "Reset password link sent to your email. Please check your inbox!"
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateUser = async (e) => {
    e.preventDefault();
    try {
      const querySnapshot = await getDocs(collection(firestore, "Users"));
      querySnapshot.forEach(async (d) => {
        if (d.data().user_id === currentUser?.uid) {
          const u = d.data();
          const updatedUser = {
            ...u,
            firstName: user.firstName,
            lastName: user.lastName,
          };
          setUser(updatedUser);
          const userRef = doc(firestore, "Users", currentUser.uid);
          await updateDoc(userRef, updatedUser);
          window.location.reload();
        }
      });
    } catch (err) {
      console.log("error message", err);
    }
  };

  return (
    <>
      <div style={{ marginTop: "32px" }}>
        <div className="row">
          <div className="col-12 pb-3">
            <h3>Profile Setting</h3>
          </div>
          <div className="col-12">
            <div className="profile-info ">
              <h4 className="pb-3">Profile Information</h4>
              <form className="row g-4  ">
                <div className="col-md-12">
                  <div className="input-group ">
                    <span className="input-group-text" id="basic-addon1">
                      <AiOutlineUser />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={user && user.firstName}
                      style={{ marginRight: "16px" }}
                      onChange={(e) =>
                        setUser({ ...user, firstName: e.target.value })
                      }
                    />

                    <span className="input-group-text" id="basic-addon1">
                      <AiOutlineUser />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={user && user.lastName}
                      onChange={(e) =>
                        setUser({ ...user, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="input-group">
                    <span className="input-group-text" id="basic-addon1">
                      @
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Email Address"
                      value={user && user.email}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="uploader-profile">
                    <div className="upload-img">
                      {selectedImage &&
                        <img
                          style={{ height: "100px", width: "100px" }}
                          src={selectedImage || (user && user.profilePhoto)}
                          alt=""
                        />
                      }
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
                      id="image-upload1"
                      accept="image/*"
                      onChange={handleChangeImage}
                      style={{ display: "none" }}
                    />
                  </div>
                  <div className="reset-pass">
                    <button
                      id=""
                      className="btn custom-btn"
                      onClick={updateUser}
                    >
                      Update profile
                    </button>

                    <button
                      id=""
                      className="btn custom-btn"
                      onClick={changePass}
                    >
                      Click here to Reset Password
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditProfile;
