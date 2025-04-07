import React from 'react'

function RestaurantJob() {
    return (
        <>
            <div className='row'>
                <div className='col-12 pb-3'>
                    <h3>Edit Restaurant User Details</h3>
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
                                    <label for="inputEmail4">Job Description :</label>
                                </div>
                                <div className="col-md-10">
                                    <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder='Job Description'></textarea>

                                </div>
                            </div>
                            <div className='row  align-items-center mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Job Category :</label>
                                </div>
                                <div className="col-md-10">
                                    <select class="form-select" aria-label="Default select example">
                                        <option selected></option>
                                        <option value="1">Management</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select>
                                </div>
                            </div>
                            <div className='row  align-items-center mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Job Type :</label>
                                </div>
                                <div className="col-md-10">
                                    <select class="form-select" aria-label="Default select example">
                                        <option selected></option>
                                        <option value="1">Part Time</option>
                                        <option value="2">Full Time</option>
                                        <option value="3">Three</option>
                                    </select>
                                </div>
                            </div>
                            <div className='row  align-items-center mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Posted Date :</label>
                                </div>
                                <div className="col-md-10">
                                <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Title"
                                        aria-label="Title"
                                    />
                                </div>
                            </div>
                            <div className='row  align-items-center mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Posted Time :</label>
                                </div>
                                <div className="col-md-10">
                                <input
                                        type="time"
                                        className="form-control"
                                        placeholder="Title"
                                        aria-label="Title"
                                    />
                                </div>
                            </div>
                            <div className='row ms-md-3 g-md-4 g-3 align-items-center mb-3 justify-content-between'>
                            <div className='col-md-3'>
                            <div className='row align-items-center  '>
                            
                            <div className="col-md-7 text-md-end">
                                    <label for="inputEmail4">Total Number of Positions :</label>
                                </div>
                                <div className="col-md-5">
                                <input
                                        type="number"
                                        className="form-control"
                                        
                                    />
                                </div>
                            </div>
                            </div>
                            <div className='col-md-3'>
                            <div className='row align-items-center '>
                            
                            <div className="col-md-7 text-md-end">
                                    <label for="inputEmail4">Total Number of Applied users :</label>
                                </div>
                                <div className="col-md-5">
                                <input
                                        type="number"
                                        className="form-control"
                                        
                                    />
                                </div>
                            </div>
                            </div>
                            <div className='col-md-3'>
                            <div className='row align-items-center '>
                            
                            <div className="col-md-7 text-md-end">
                                    <label for="inputEmail4">Number of users approved:</label>
                                </div>
                                <div className="col-md-5">
                                <input
                                        type="number"
                                        className="form-control"
                                        
                                    />
                                </div>
                            </div>
                            </div>
                            
                      
                            </div>

                            <div className='row g-md-4 g-3  align-items-center mb-3 justify-content-center'>
                                <div className='col-sm-6'>
                                <div className='row  align-items-center '>
                                     <div className="col-md-4 text-md-end">
                                    <label for="inputEmail4">Salary Receivable :</label>
                                </div>
                                <div className="col-md-8">
                                    <select class="form-select" aria-label="Default select example">
                                        <option selected></option>
                                        <option value="1">Hours Based</option>
                                        <option value="2">Job Based</option>
                                    </select>
                                </div>
                                </div>
                                </div>
                                <div className='col-sm-6'>
                                <div className='row  align-items-center '>
                                     <div className="col-md-4 text-md-end">
                                    <label for="inputEmail4">Salary Receivable :</label>
                                </div>
                                <div className="col-md-8">
                                <input
                                        type="text"
                                        className="form-control"
                                        placeholder="200$"
                                        aria-label="200$"
                                    />
                                </div>
                                </div>
                                </div>
                               
                            </div>

                            <div className='row  align-items-center mb-3'>
                                <div className="col-md-2 text-md-end">
                                    <label for="inputEmail4">Job Status :</label>
                                </div>
                                <div className="col-md-10">
                                <input
                                        type="text"
                                        className="form-control text-uppercase"
                                        placeholder="OPEN"
                                        aria-label="OPEN"
                                    />
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