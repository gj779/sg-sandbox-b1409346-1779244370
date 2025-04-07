import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Form,
  FormGroup,
  Input,
  Row,
} from "reactstrap";
// import { GenericButton } from '../../components/allButtons'
import { color } from "../../../utility/color";

// firebase
import { doc, getDoc } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, firestore } from "../../../data/firebase";
import { GenericButton } from "../../../components/allButtons";
import DeleteAccountModal from "../../../components/DeleteAccountModal";

const DeleteAccount = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isUser, setUser] = useState(false);
  const [isLoading, setLoading] = useState(false);
const [show, setShow] = useState(false);
const [normalUser, setNormalUser] = useState()

  const onPressLogin = (event) => {
    event.preventDefault()
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const docRef = doc(firestore, "Users", user.uid);

        const docSnap = await getDoc(docRef);
        const userObj = docSnap.data();
        userObj["uid"] = user.uid;
        
        setEmail("");
        setPassword("");
        if (userObj.userType === "admin") {
            setUser(true);
        } else {
            setShow(true)
            setNormalUser(userObj)
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("error at login : ", err);
        setUser(true);
        setLoading(false);
      });
  };

  return (
    <div>
      <Row
        style={{
          justifyContent: "center",
          alignSelf: "center",
          alignItems: "center",
          backgroundColor: color.primary,
          display: "flex",
          height: "100vh",
          marginRight: 0,
        }}
      >
        <Col className="col-md-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ textAlign: "center" }}>
                <img className="logo" src="logo.png" alt="" />
              </CardTitle>
            </CardHeader>
            <CardBody>
              {isUser && (
                <p style={{ color: "tomato", fontSize: "14px" }}>
                  **Email or Password not valid
                </p>
              )}
              <Form method="POST" responsive>
                <Row>
                  <Col className="pr-md-1 col-md-12">
                    <FormGroup>
                      <label style={{ paddingBottom: "10px" }}>Email</label>
                      <Input
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setUser(false);
                        }}
                        placeholder={"Enter your valid email"}
                        type="email"
                      ></Input>
                    </FormGroup>
                  </Col>
                </Row>
                  <Row>
                    <Col className="pr-md-1 col-md-12">
                      <FormGroup>
                        <label style={{ paddingBottom: "10px" }}>
                          Password
                        </label>
                        <Input
                          placeholder="********"
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setUser(false);
                          }}
                        ></Input>
                      </FormGroup>
                    </Col>
                  </Row>
              </Form>
            </CardBody>
            <CardFooter className="d-flex justify-content-center text-center delete-btn " >          
               
                <GenericButton
                  loading={isLoading}
                  title={"Delete"}
                  onClick={onPressLogin}
                  style={{padding:"0 40px"}}
                />             
            </CardFooter>
          </Card>
        </Col>
      </Row>
      <DeleteAccountModal show={show} setShow={setShow} normalUser={normalUser} />
    </div>
  );
};

export default DeleteAccount;
