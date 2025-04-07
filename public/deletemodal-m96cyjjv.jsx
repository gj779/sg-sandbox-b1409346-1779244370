import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { deleteJob, removeUser } from "../redux/action";
import { useDispatch } from "react-redux";
import { firestore } from "../data/firebase";
import { ClipLoader } from "react-spinners";
import { useState } from "react";

function Example({ show, setShow, data, action }) {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);

  const handleClose = () => {
    setShow(false);
  };
  const deleteUser = async () => {
    if (data?.userType) {
      try {
        const userRef = doc(firestore, "Users", data.user_id);
        await deleteDoc(userRef);
        dispatch(removeUser(data.user_id));
        setShow(false);
      } catch (err) {
        console.log("User delete error : ", err);
      }
    }
    if (data?.JobType) {
      try {
        await deleteDoc(doc(firestore, "PostedJobs", data.post_id));
        dispatch(deleteJob(data.post_id));
        setShow(false);
      } catch (err) {
        console.log("Posted job delete error : ", err);
      }
    }
  };

  const blockUser = async () => {
    setLoader(true);
    if (data?.userType) {
      try {
        let updatedUser;
        if (data.isBlocked) {
          updatedUser = { ...data, isBlocked: false };
        } else {
          updatedUser = { ...data, isBlocked: true };
        }
        const userRef = doc(firestore, "Users", data.user_id);
        await updateDoc(userRef, updatedUser);
        setShow(false);
        setLoader(false);
      } catch (err) {
        console.log("user blocking error : ", err);
      }
    }
    if (data?.JobType) {
      try {
        let updatedUser;
        if (data.isBlocked) {
          updatedUser = { ...data, isBlocked: false };
        } else {
          updatedUser = { ...data, isBlocked: true };
        }
        const jobRef = doc(firestore, "PostedJobs", data.post_id);
        await updateDoc(jobRef, updatedUser);
        setShow(false);
        setLoader(false);
      } catch (err) {
        console.log("job blocking error : ", err);
      }
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Please confirm</Modal.Title>
        </Modal.Header>
        {action && action === "delete" && (
          <Modal.Body>
            {data &&
              data?.JobType &&
              "Are you sure you want to delete this job?"}
            {data &&
              data?.userType &&
              "Are you sure you want to delete this user?"}
          </Modal.Body>
        )}
        {action && action === "block" && (
          <Modal.Body>
            {data &&
              data?.JobType &&
              `Are you sure you want to ${
                data.isBlocked ? "unblock" : "block"
              } this job?`}
            {data &&
              data?.userType &&
              `Are you sure you want to ${
                data.isBlocked ? "unblock" : "block"
              } this user?`}
          </Modal.Body>
        )}

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {action === "delete" && (
            <Button variant="danger" onClick={deleteUser}>
              Delete
            </Button>
          )}
          {action === "block" && (
            <Button variant="danger" onClick={blockUser}>
              {!loader ? (
                data.isBlocked ? (
                  "Unblock"
                ) : (
                  "Block"
                )
              ) : (
                <div style={{padding : "0 18px"}}>

                <ClipLoader
                  size={20}
                  color={"white"}
                 
                  />
                  </div>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Example;
