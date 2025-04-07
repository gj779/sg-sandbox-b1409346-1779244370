import React, { useEffect, useState } from "react";
import { Card, Col, Row, Table } from "react-bootstrap";
import { ImStarHalf } from "react-icons/im";
import { CardBody, CardHeader, CardTitle } from "reactstrap";

// common and helpers
import { color } from "../utility/color";
import { GenericButton } from "./allButtons";
import { RenderTableHeader } from "./helperFunction";
import { Search } from "./searchBar";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaBan,
  FaEye,
  FaPen,
  FaTrash,
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";

// firebase
import { firestore } from "../data/firebase";
import { collection, getDocs } from "firebase/firestore";

// redux
import { useDispatch, useSelector } from "react-redux";
import { setJobs, setUsers, setPage } from "../redux/action";
import { useNavigate } from "react-router";
import Modal from "./DeleteModal";

const AllTables = ({
  searchplaceholder,
  headerName,
  data,
  cardTitle,
  to,
  btnTitle,
  tableStyle,
  isAllJobs,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);
  const jobs = useSelector((state) => state.jobs);
  const currentPage = useSelector((state) => state?.currentPage) || 1;
  const itemsPerPage = useSelector((state) => state?.itemsPerPage) || 10;
  const [searchData, setSearchData] = useState();
  const [sortedData, setSortedData] = useState();
  const [isLoading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [deleteData, setDeleteData] = useState();
  const [action, setAction] = useState();
  const token = localStorage.getItem("authToken");

  // console.log(users)
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, users, jobs]);
  useEffect(() => {
    const data = async () => {
      let users = [];
      const querySnapshot = await getDocs(collection(firestore, "Users"));
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      dispatch(setUsers(users));
      setLoading(false);
    };
    data();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  useEffect(() => {
    const data = async () => {
      let allJobs = [];
      const querySnapshot = await getDocs(collection(firestore, "PostedJobs"));
      querySnapshot.forEach((doc) => {
        allJobs.push(doc.data());
      });
      dispatch(setJobs(allJobs));
      setLoading(false);
    };
    data();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  useEffect(() => {
    const sortD =
      data && searchData && searchData
        ? searchData.sort((a, b) => b.createdAt - a.createdAt)
        : data && data.sort((a, b) => b.createdAt - a.createdAt);
    setSortedData(sortD);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, data]);

  const maxPage = sortedData && Math.ceil(sortedData.length / itemsPerPage);
  const currentData =
    sortedData &&
    sortedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= maxPage) {
      dispatch(setPage(pageNumber));
    }
  };

  const handleRemoveUser = async (id) => {
    setShow(true);
    setDeleteData(id);
    setAction("delete");
  };

  const blockUser = async (user) => {
    setShow(true);
    setDeleteData(user);
    setAction("block");
  };

  const searchByType = (text) => {
    const lowerText = text.toLowerCase();
    const searchResult =
      data &&
      data.filter(
        (e) =>
          e.position.toLowerCase().includes(lowerText) ||
          e.JobType.toLowerCase().includes(lowerText)
      );
    setSearchData(searchResult);
  };
  const searchByName = (text) => {
    const lowerText = text.toLowerCase();
    const searchResult =
      data &&
      data.filter(
        (e) =>
          e.firstName.toLowerCase().includes(lowerText) ||
          e.lastName.toLowerCase().includes(lowerText)
      );
    setSearchData(searchResult);
  };

  return (
    <div>
      <Row>
        <Col md="12" xs="12">
          <Card
            style={{
              boxShadow: color.shadow,
              backgroundColor: color.secondary,
              color: color.primary,
            }}
          >
            <CardHeader className="card-header">
              <CardTitle tag="h4" style={{ padding: "10px 0" }}>
                {cardTitle}
              </CardTitle>
              {isAllJobs ? (
                <Search
                  size={"12"}
                  onChange={(e) => searchByType(e.target.value)}
                  placeholder={searchplaceholder}
                />
              ) : (
                <Search
                  size={"12"}
                  onChange={(e) => searchByName(e.target.value)}
                  placeholder={searchplaceholder}
                />
              )}
            </CardHeader>
            {!isLoading ? (
              <CardBody style={tableStyle} className="table-height">
                {data && data.length ? (
                  <Table
                    responsive
                    style={{ overflowY: "auto", overflowX: "auto" }}
                  >
                    {RenderTableHeader(headerName)}
                    <tbody style={{ textAlign: "center" }}>
                      {currentData &&
                        currentData.map((e, index) => {
                          return (
                            <React.Fragment key={index}>
                              {isAllJobs ? (
                                <tr>
                                  <td>{e?.position}</td>
                                  <td>
                                    {e?.user.userType ? e?.user.userType : "-"}
                                  </td>
                                  <td>{e?.JobType ? e?.JobType : "-"}</td>
                                  <td>{e?.applicants.length}</td>
                                  <td>{e?.address.city}</td>
                                  <td>
                                    {e?.user.phoneNo ? e?.user.phoneNo : "-"}
                                  </td>
                                  <td>
                                    <GenericButton
                                      to={to}
                                      title={btnTitle}
                                      state={{ dataa: e }}
                                      id={`${e.post_id} view`}
                                      style={{ display: "none" }}
                                    />
                                    <FaEye
                                      style={{
                                        cursor: "pointer",
                                        color: color.primary,
                                      }}
                                      onClick={() =>
                                        document
                                          .getElementById(`${e.post_id} view`)
                                          .click()
                                      }
                                    />

                                    <GenericButton
                                      title={"Edit"}
                                      to={"/event-management-job"}
                                      state={{ dataa: e }}
                                      id={`${e.post_id} edit`}
                                      style={{ display: "none" }}
                                    />
                                    <FaPen
                                      style={{
                                        cursor: "pointer",
                                        margin: "0 12px",
                                        color: color.primary,
                                      }}
                                      onClick={() =>
                                        document
                                          .getElementById(`${e.post_id} edit`)
                                          .click()
                                      }
                                    />

                                    <FaBan
                                      style={{
                                        color: e.isBlocked
                                          ? "tomato"
                                          : color.primary,
                                        cursor: "pointer",
                                        marginRight: "12px",
                                      }}
                                      onClick={() => blockUser(e)}
                                    />
                                    <FaTrash
                                      style={{
                                        cursor: "pointer",
                                        color: color.primary,
                                      }}
                                      onClick={() => handleRemoveUser(e)}
                                    />
                                  </td>
                                </tr>
                              ) : (
                                <tr
                                  key={index}
                                  style={{ verticalAlign: "middle" }}
                                >
                                  <td>
                                    <img
                                      style={{
                                        height: "40px",
                                        width: "40px",
                                        borderRadius: "50%",
                                      }}
                                      src={e?.profilePhoto}
                                      alt={"loading..."}
                                    />
                                  </td>
                                  <td>{e?.firstName + " " + e.lastName}</td>
                                  <td>{e?.email}</td>

                                  <td>
                                    {e?.ratings ? e.ratings : "0"}
                                    <ImStarHalf />
                                  </td>
                                  <td>
                                    <GenericButton
                                      to={to}
                                      title={btnTitle}
                                      state={{ dataa: e }}
                                      id={`${e.user_id} view`}
                                      style={{ display: "none" }}
                                    />
                                    <FaEye
                                      style={{
                                        cursor: "pointer",
                                        color: color.primary,
                                      }}
                                      onClick={() =>
                                        document
                                          .getElementById(`${e.user_id} view`)
                                          .click()
                                      }
                                    />

                                    <GenericButton
                                      title={"Edit"}
                                      to={"/edit-applicant"}
                                      state={{ dataa: e }}
                                      id={`${e.user_id} edit`}
                                      style={{ display: "none" }}
                                    />
                                    <FaPen
                                      style={{
                                        cursor: "pointer",
                                        margin: "0 12px",
                                        color: color.primary,
                                      }}
                                      onClick={() =>
                                        document
                                          .getElementById(`${e.user_id} edit`)
                                          .click()
                                      }
                                    />
                                    <FaBan
                                      style={{
                                        color: e.isBlocked
                                          ? "tomato"
                                          : color.primary,
                                        cursor: "pointer",
                                        marginRight: "12px",
                                      }}
                                      onClick={() => blockUser(e)}
                                    />
                                    <FaTrash
                                      style={{
                                        cursor: "pointer",
                                        color: color.primary,
                                      }}
                                      onClick={() => handleRemoveUser(e)}
                                    />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </Table>
                ) : (
                  <h2
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "25vh",
                    }}
                  >
                    No data found
                  </h2>
                )}
              </CardBody>
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
                marginTop: "24px",
              }}
            >
              {currentPage !== 1 && (
                <FaAngleDoubleLeft
                  style={{ fontSize: "24px", cursor: "pointer" }}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
              )}
              {data && data.length > 10 && (
                <span style={{ marginLeft: "16px", marginRight: "16px" }}>
                  {currentPage}
                </span>
              )}
              {maxPage !== currentPage && (
                <FaAngleDoubleRight
                  style={{ fontSize: "24px", cursor: "pointer" }}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>
      <Modal show={show} setShow={setShow} data={deleteData} action={action} />
    </div>
  );
};

export default AllTables;
