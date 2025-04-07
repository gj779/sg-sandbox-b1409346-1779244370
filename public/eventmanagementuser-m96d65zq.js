import React from 'react'
import { AiFillStar } from "react-icons/ai";
import { FaDownload } from "react-icons/fa";
function RestaurantJob() {
    return (
        <>
            <div className='row'>
                <div className='col-12 pb-3'>
                    <h3>Edit Event Management User  Details</h3>
                </div>
                <div className='col-md-12'>
                    <div className='applicant-info '>
                        <form className=" ">

                            <div className='row  align-items-center mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Title :</label>
                                </div>
                                <div className="col-md-10">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Title"
                                        aria-label="Title"
                                    />
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Logo :</label>
                                </div>
                                <div className="col-md-10">
                                    <div className='profile-img-box wh-80'></div>
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Event Description :</label>
                                </div>
                                <div className="col-md-10">
                                    <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder='Event Description'></textarea>

                                </div>
                            </div>
                            <div className='row g-md-4 g-3  align-items-center mb-3 justify-content-center'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Event Start Date and Time :</label>
                                </div>
                                <div className="col-md-5">
                                    <input
                                        type="date"
                                        className="form-control"

                                    />
                                </div>
                                <div className="col-md-5">
                                    <input
                                        type="time"
                                        className="form-control"

                                    />
                                </div>
                            </div>
                            <div className='row g-md-4 g-3  align-items-center mb-3 justify-content-center'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Event End Date and Time :</label>
                                </div>
                                <div className="col-md-5">
                                    <input
                                        type="date"
                                        className="form-control"

                                    />
                                </div>
                                <div className="col-md-5">
                                    <input
                                        type="time"
                                        className="form-control"

                                    />
                                </div>
                            </div>
                        
                            <div className='row mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Event Full Address :</label>
                                </div>
                                <div className="col-md-10">
                                    <textarea class="form-control" id="exampleFormControlTextarea1" rows="4" placeholder='Event Full Address'></textarea>

                                </div>
                            </div>
                          
                            <div className='row -4 g-3 align-items-center mt-md-5 mt-2 justify-content-center'>
                                <div className="col-md-6 col-6 text-end">
                                    <button className='btn custom-btn'>Update</button>
                                </div>
                                <div className="col-md-6 col-6">
                                    <button className='btn btn2 btn-danger'>Cancel</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RestaurantJob