import React from 'react'

function RestaurantUser() {
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
                           <div className="col-md-1 text-md-end">
                                <label for="inputEmail4">Restaurant Name :</label>
                            </div>
                            <div className="col-md-10">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Restaurant Name"
                                    aria-label="Restaurant Name"
                                />
                            </div>
                           </div>
                        <div className='row mb-3'>
                           <div className="col-md-1 text-md-end">
                                <label for="inputEmail4">Logo :</label>
                            </div>
                            <div className="col-md-11">
                              <div className='profile-img-box wh-100'></div>
                            </div>
                           </div>
                       
                           
                         <div className='row'>
                            <div className='col-md-md-6'>  <div className='row  align-items-center mb-3'>
                           <div className="col-md-2 text-md-end">
                                <label for="inputEmail4">Email ID :</label>
                            </div>
                            <div className="col-md-10">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email ID"
                                    aria-label="Email ID"
                                />
                            </div>
                           </div>
                           <div className='row  align-items-center mb-3'>
                           <div className="col-md-2 text-md-end">
                                <label for="inputEmail4">Phone Number :</label>
                            </div>
                            <div className="col-md-10">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Phone Number"
                                    aria-label="Phone Number"
                                />
                            </div>
                           </div>
                           <div className='row mb-3'>
                           <div className="col-md-2 text-md-end">
                                <label for="inputEmail4">Address :</label>
                            </div>
                            <div className="col-md-10">
                            <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder='Address'></textarea>

                            </div>
                           </div>
                           <div className='row mb-3'>
                           <div className="col-md-2 text-md-end">
                                <label for="inputEmail4">Description :</label>
                            </div>
                            <div className="col-md-10">
                            <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder='Description'></textarea>

                            </div>
                           </div></div>
                            <div className='col-md-6'>

                            <h3>Image</h3>
                            <div className='images-box mt-3'>
                                <div className='images-list'>     
                                <img src='logo.png' className='' alt="" />
                                </div>
                                <div className='images-list'>     
                                <img src='logo.png' className='' alt="" />
                                </div>
                                <div className='images-list'>     
                                <img src='logo.png' className='' alt="" />
                                </div>
                                <div className='images-list'>     
                                <img src='logo.png' className='' alt="" />
                                </div>
                                <div className='images-list'>     
                                <img src='logo.png' className='' alt="" />
                                </div>
                                <div className='images-list'>     
                                <img src='logo.png' className='' alt="" />
                                </div>
                                <div className='images-list'>     
                                <img src='logo.png' className='' alt="" />
                                </div>
                            </div>
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

export default RestaurantUser