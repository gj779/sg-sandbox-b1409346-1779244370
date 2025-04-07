import { collection, deleteDoc, doc } from "firebase/firestore";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { auth, firestore } from "../data/firebase";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeleteAccountModal({ show, setShow, normalUser }) {
  const [loader, setLoader] = useState(false)
  const handleClose = () => {
    setShow(false);
  };
 
  const deleteUser = async()=>{
    setLoader(true)
    try{
      const myCollection = collection(firestore, 'Users');
      const myDoc = doc(myCollection, normalUser.user_id);
      await deleteDoc(myDoc)
      await auth.currentUser.delete();
      setShow(false);
      setLoader(false)
      toast("Account deleted successfully");
    }catch(err){
      console.log(err)
      setLoader(false)
    }
  }

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
       
          <Modal.Body>
          Are you sure you want to delete?
          </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteUser}>
              {!loader ? 'Delete' : <div style={{padding:"0 24px"}}><ClipLoader size={15} color="white" loading={loader} /></div>}
            </Button>
           
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </>
  );
}

export default DeleteAccountModal;
