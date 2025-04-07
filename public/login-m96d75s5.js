import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Form, FormGroup, Input, Row } from 'reactstrap'
import { GenericButton } from '../../components/allButtons'
import { color } from '../../utility/color'
import { useDispatch } from 'react-redux'
import { userLogin } from '../../redux/action'

// firebase
import { doc, getDoc } from "firebase/firestore"
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from '../../data/firebase'
import { useNavigate } from 'react-router';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [isUser, setUser] = useState(false);
    const [isForgetPass, setForgetPass] = useState(false);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        navigate("/")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate])

    const onPressLogin = () => {

        setLoading(true)
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const docRef = doc(firestore, "Users", user.uid);

                const docSnap = await getDoc(docRef);
                const userObj = docSnap.data();
                userObj["uid"] = user.uid
                dispatch(userLogin(userObj))

                if (userObj.userType === "admin") {
                    localStorage.setItem("authToken", user.accessToken);
                    localStorage.setItem("userType", userObj.userType);
                    localStorage.setItem("email", userObj.email)
                    localStorage.setItem("name", userObj.firstName + " " + userObj.lastName)
                    navigate("/")
                    setEmail('')
                    setPassword('');
                    window.location.reload();
                } else {
                    setUser(true)
                    setEmail('')
                    setPassword('')
                }
                setLoading(false)
            }).catch((err) => {
                console.log("error at login : ", err)
                setUser(true)
                setLoading(false)
            })
    }

    const changePass = async (e) => {
        e.preventDefault()
        setLoading(true)
        const auth = getAuth();
        sendPasswordResetEmail(auth, email).then(() => {
            window.alert("Reset password link sent to your email. Please check your inbox!")
            setLoading(false)
        }).catch((err) => {
            console.log(err);
            setUser(true)
            setLoading(false)
        })
        setEmail('')
        setPassword('')
    }

    return (
        <div>
            <Row style={{
                justifyContent: 'center',
                alignSelf: 'center',
                alignItems: 'center',
                backgroundColor: color.primary,
                display: "flex",
                height: '100vh',
                marginRight: 0
            }}>
                <Col className='col-md-4'>
                    <Card>
                        <CardHeader>

                            <CardTitle style={{ textAlign: "center" }}><img className='logo' src='logo.png' alt="" /></CardTitle>
                        </CardHeader>
                        <CardBody>
                            {isUser && <p style={{ color: "tomato", fontSize: "14px" }}>**Email {!isForgetPass && "or Password"} not valid</p>}
                            <Form method='POST' responsive>
                                <Row>
                                    <Col className='pr-md-1 col-md-12'>
                                        <FormGroup>
                                            <label style={{ paddingBottom: '10px' }}>Email</label>
                                            <Input
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value)
                                                    setUser(false)
                                                }}
                                                placeholder={isForgetPass ? 'Enter your valid email' : 'admin@example.com'}
                                                type='email'
                                            ></Input>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                {!isForgetPass && <Row>
                                    <Col className='pr-md-1 col-md-12'>
                                        <FormGroup>
                                            <label style={{ paddingBottom: '10px' }}>Password</label>
                                            <Input
                                                placeholder='********'
                                                type='password'
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value)
                                                    setUser(false)
                                                }}
                                            ></Input>

                                            <p style={{ textAlign: "right", color: "#0D6EFD", fontSize: "14px" }}>
                                                <span
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setForgetPass(true)
                                                        setEmail('')
                                                        setPassword('')
                                                        setUser(false)
                                                    }}>
                                                    Forget password?
                                                </span>
                                            </p>
                                        </FormGroup>
                                    </Col>
                                </Row>}
                            </Form>
                        </CardBody>
                        <CardFooter className='text-center login-btn'>
                            {!isForgetPass ? <GenericButton loading={isLoading} to={"/"} title={'Login'} className="btn custom-btn" onClick={onPressLogin} /> :
                                <>
                                    <GenericButton loading={isLoading} to={"/"} title={'Reset Password'} className="btn custom-btn" onClick={changePass} />
                                    <p
                                        style={{ marginTop: "12px", color: "#0D6EFD", cursor: "pointer" }}
                                        onClick={() => {
                                            setForgetPass(false)
                                            setEmail('')
                                            setPassword('')
                                            setUser(false)
                                        }}
                                    >
                                        Go to login
                                    </p>
                                </>}
                        </CardFooter>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Login