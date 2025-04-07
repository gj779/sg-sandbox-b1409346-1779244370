import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardText, CardTitle, Col, Form, FormGroup, Input, Row } from 'reactstrap'
import { BackBtn } from '../../../components/allButtons'
import { color } from '../../../utility/color'


const Profile = ({ profileTitle }) => {

    const navigate = useNavigate();
    const location = useLocation();
    const [dataa, setDataa] = useState()

    useEffect(() => {
        setDataa(location?.state?.dataa)

    }, [location?.state?.dataa])

    return (
        <div>
            <Row>
                <Col md="8" sm="10" xs="10">
                    <Row>
                        <Card style={{ boxShadow: color.shadow, backgroundColor: color.secondary, color: color.primary }}>
                            <CardHeader className='card-header'>
                                <div style={{ display: 'flex', justifyContent: "space-between" }}>
                                    <BackBtn onClick={() => navigate(-1)} />
                                    {/* <GenericButton
                                        to={'/chat'}
                                        title={'Chat'}
                                    /> */}
                                </div>
                                <CardTitle tag={'h4'} style={{ padding: "10px 0" }}>{profileTitle}</CardTitle>
                            </CardHeader>
                            <CardBody style={{
                                overflowY: 'auto',
                                // maxHeight: "263px"
                            }}>
                                <Form method="POST">
                                    <Row>
                                        <Col className="pr-md-1 " md="4">
                                            <FormGroup>
                                                <label style={{ marginBottom: "10px", color: color.primary, fontWeight: "bold" }}>{dataa && dataa.userType} Name</label>
                                                <Input
                                                    disabled
                                                    value={dataa ? dataa.firstName + " " + dataa.lastName : "-"}
                                                    placeholder="Applicant Name"
                                                    type="text"
                                                    autoComplete="off"
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col className="col-md-6 " md="4">
                                            <FormGroup>
                                                <label style={{ marginBottom: "10px", color: color.primary, fontWeight: "bold" }}>Email</label>
                                                <Input
                                                    disabled
                                                    value={dataa ? dataa.email : "-"}
                                                    name="applicantemail"
                                                    placeholder="Applicant Email"
                                                    type="email"
                                                    autoComplete="off"
                                                />
                                            </FormGroup>
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Col className="pr-md-1 " md="4">
                                            <FormGroup>
                                                <label style={{ marginBottom: "10px", color: color.primary, fontWeight: "bold" }}>Category</label>
                                                <Input
                                                    disabled
                                                    value={dataa ? dataa.userType : "-"}
                                                    placeholder="Category"
                                                    type="text"
                                                    autoComplete="off"
                                                    name="Category"
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col className="col-md-6 " md="4">
                                            <FormGroup>
                                                <label style={{ marginBottom: "10px", color: color.primary, fontWeight: "bold" }}>Address</label>
                                                <Input
                                                    disabled
                                                    value={dataa ? dataa.location.city + ", " + dataa.location.state.name + ", " + dataa.location.country.name : "-"}
                                                    placeholder="Phone Number"
                                                    type="text"
                                                    autoComplete="off"
                                                    name="phoneNumber"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {/* <Row>

                                        <Col className="col-md-10" md="4">
                                            <FormGroup>
                                                <label style={{ marginBottom: "10px", color: color.primary, fontWeight: "bold" }}>Desciption </label>
                                                
                                                <textarea class="form-control"
                                                    disabled
                                                    id="exampleFormControlTextarea1"
                                                    rows="3"
                                                    value={dataa ? dataa.description : "-"}

                                                />
                                            </FormGroup>
                                        </Col>

                                    </Row> */}
                                </Form>
                            </CardBody>
                        </Card>
                    </Row>
                </Col>
                <Col md="4" sm="10" className='' >
                    <Card className="img-card" style={{ boxShadow: color.shadow, backgroundColor: color.secondary }}>
                        <CardBody>
                            <CardText />
                            <div className="author"
                                style={{
                                    margin: "0 auto",
                                    display: 'flex'
                                }}>
                                <img
                                    src={dataa && dataa.profilePhoto}

                                    // src='https://firebasestorage.googleapis.com/v0/b/react-native-staffspace.appspot.com/o/Resturant%2FpostImages%2F4d38c138-e268-1eee-7fc8-dc68747828afa7a88708-6d39-bd95-9e08-4d0815d4e1c8.png?alt=media&token=448a9896-d112-45f0-9026-5f06fd35275d'
                                    alt="..."
                                    style={{
                                        maxWidth: "100%",
                                        margin: "0 auto",
                                        height: "265px"
                                    }}
                                />

                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Profile