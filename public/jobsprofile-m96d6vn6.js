import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardText,
  CardTitle,
  Col,
  Form,
  FormGroup,
  Input,
  Row,
} from "reactstrap";
import { BackBtn } from "../../../components/allButtons";
import { color } from "../../../utility/color";

const JobsProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let dataa;
  if (location?.state?.dataa) {
    dataa = location?.state?.dataa;
  }

  return (
    <div>
      <Row>
        <Col md="8" sm="10" xs="10">
          <Row>
            <Card
              style={{
                boxShadow: color.shadow,
                backgroundColor: color.secondary,
                color: color.primary,
              }}
            >
              <CardHeader className="card-header">
                <BackBtn onClick={() => navigate(-1)} />
                <CardTitle tag={"h4"} style={{ padding: "10px 0" }}>
                  {dataa ? dataa.title : "-"}
                </CardTitle>
              </CardHeader>
              <CardBody
                style={{
                  overflowY: "auto",
                  maxHeight: "263px",
                }}
              >
                <Form method="POST">
                  <Row>
                    <Col className="pr-md-1 " md="10">
                      <FormGroup>
                        {dataa && dataa.user && (
                          <label
                            style={{
                              marginBottom: "10px",
                              color: color.primary,
                              fontWeight: "bold",
                            }}
                          >
                            {dataa && dataa.user.userType === "Resturant"
                              ? "Restaurant"
                              : dataa.user.userType}{" "}
                            Name{" "}
                          </label>
                        )}
                        <Input
                          disabled
                          value={
                            dataa && dataa.JobName ? dataa.JobName : "No name"
                          }
                          placeholder="Restaurant Name"
                          type="text"
                          autoComplete="off"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pr-md-1 " md="10">
                      <FormGroup>
                        <label
                          style={{
                            marginBottom: "10px",
                            color: color.primary,
                            fontWeight: "bold",
                          }}
                        >
                          Title
                        </label>
                        <Input
                          disabled
                          value={dataa ? dataa.position : "-"}
                          placeholder="Restaurant Name"
                          type="text"
                          autoComplete="off"
                        />
                      </FormGroup>
                    </Col>

                    <Col className="pr-md-1 " md="4">
                      <FormGroup>
                        <label
                          style={{
                            marginBottom: "10px",
                            color: color.primary,
                            fontWeight: "bold",
                          }}
                        >
                          No. of Vacancies
                        </label>
                        <Input
                          disabled
                          value={dataa ? dataa.noOfJobs : "-"}
                          placeholder="Phone Number"
                          type="text"
                          autoComplete="off"
                          name="phoneNumber"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pr-md-1 " md="4">
                      <FormGroup>
                        <label
                          style={{
                            marginBottom: "10px",
                            color: color.primary,
                            fontWeight: "bold",
                          }}
                        >
                          Total Applicants
                        </label>
                        <Input
                          disabled
                          value={dataa ? dataa.applicants.length : "0"}
                          placeholder="Total Applicants"
                          type="number"
                          autoComplete="off"
                          name=""
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-md-1 " md="8">
                      <FormGroup>
                        <label
                          style={{
                            marginBottom: "10px",
                            color: color.primary,
                            fontWeight: "bold",
                          }}
                        >
                          Full Address
                        </label>
                        <Input
                          disabled
                          value={
                            dataa
                              ? dataa.address.fullAddress +
                                ", " +
                                dataa.address.city +
                                ", " +
                                dataa.address.state.name
                              : "-"
                          }
                          name="Address"
                          placeholder="Address"
                          type="text"
                          autoComplete="off"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Row>
        </Col>
        <Col md="4" sm="10" className="">
          <Card
            className="img-card"
            style={{
              boxShadow: color.shadow,
              backgroundColor: color.secondary,
            }}
          >
            <CardBody>
              <CardText />
              <div
                className="author"
                style={{
                  display: "flex",
                }}
              >
                <img
                  alt="..."
                  style={{
                    maxWidth: "100%",
                    margin: "0 auto",
                    height: "265px",
                  }}
                  src={dataa ? dataa.postImage : ""}
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JobsProfile;
