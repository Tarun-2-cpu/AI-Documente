import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useState, useEffect } from 'react'
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
// import useReactApexChart from "../hook/useReactApexChart"
import { useNavigate } from 'react-router-dom';

function BDDashboard() {
  // let { createChartThree } = useReactApexChart()
  const [showModal, setShowModal] = useState(false);
  const [jobId, setJobId] = useState('');
  const [jobName, setJobName] = useState('');
  const [description, setDescription] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [jobs, setJobs] = useState([]);
  const [file, setFile] = useState('');
  const [client, setClient] = useState('');
  const [epc, setEPC] = useState('');
  const [endUser, setEndUser] = useState('');
  

  const navigate = useNavigate();


  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    
    const jobsArray = Array.isArray(storedJobs) ? storedJobs : [];

    setJobs(jobsArray);
  }, [])


  function createJob() {

    if (!jobId || !jobName || !poNumber || !poDate || !file || !client || !epc || !endUser) {
      alert('Please fill out all required fields!');
      return;
    }
    
    // if(incomingDocs.length === 0){
    //   alert('please add the PO file');
    //   return;
    // }


      // Check for duplicate jobId
    if (jobs.some((job) => job.jobId === jobId)) {
      alert(`A job with ID "${jobId}" already exists!`);
      return;
    }

    // Create a new job object  
    const newJob = {
      jobId,
      jobName,
      description,
      poNumber,
      poDate,
      incomingDocs: [],
      transmittals: [],
      client,
      epc,
      endUser
    };

    const updateJobs = [...jobs, newJob];
    setJobs(updateJobs);
    localStorage.setItem('jobs', JSON.stringify(updateJobs)); // Save updated jobs
    resetFormFields();
    setShowModal(false);
  }

  const resetFormFields = () => {
    setJobId('');
    setJobName('');
    setDescription('');
    setPoNumber('');
    setPoDate('');
    setFile('');
    setClient('');
    setEPC('');
    setEndUser('');
  };


  const handleJobClick = (jobId) => {
    navigate(`/job-detail?jobId=${jobId}`);
  };  

  const handleDateChange = (e) => {
    let rawDate = e.target.value; // YYYY-MM-DD format
    let formattedDate = rawDate.split('-').reverse().join('/'); // Converts to DD/MM/YYYY
    setPoDate(formattedDate);
  };

  return (
    <MasterLayout title="BD Daashboard">

      {/* Breadcrumb */}
      <Breadcrumb title="Business Development" />

      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Business Development</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4" style={{width : "full"}}>
            
            <div className="col" style={{width: "33%"}}>
              <div className="card shadow-none border bg-gradient-start-1">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <p className="fw-medium text-primary-light mb-1">
                        Jobs
                      </p>
                      <h6 className="mb-0">{jobs.length}</h6>
                    </div>
                    <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">
                      <Icon
                        icon="gridicons:multiple-users"
                        className="text-base text-2xl mb-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* card end */}
            </div>
            <div className="col" style={{width: "33%"}}>
              <div className="card shadow-none border bg-gradient-start-2">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="">
                      <p className="fw-medium text-primary-light mb-1">
                        Completed Transmittals
                      </p>
                      <h6 className="mb-0">{0}</h6>
                    </div>
                    <div className="w-50-px h-50-px bg-purple rounded-circle d-flex justify-content-center align-items-center">
                      <Icon
                        icon="fa-solid:award"
                        className="text-base text-2xl mb-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* card end */}
            </div>
            <div className="col" style={{width: "33%"}}>
              <div className="card shadow-none border bg-gradient-start-3">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <p className="fw-medium text-primary-light mb-1">
                        Pending Documents
                      </p>
                      <h6 className="mb-0">{0}</h6>
                    </div>
                    <div className="w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center">
                      <Icon
                        icon="fa6-solid:file-invoice-dollar"
                        className="text-base text-2xl mb-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* card end */}
            </div>
          </div>
        </div>
      </div>

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24">

          <button
            type="button"
            className="btn rounded-pill btn-primary-100 text-primary-600 radius-8 px-20 py-11"
            onClick={() => setShowModal(true)}
          >
            Create Job
          </button>
          {
            showModal && (
              <div className="modal fade show scrollable" style={{ display: 'block' }} aria-labelledby="exampleModalLongTitle" aria-hidden="true">
                <div className="modal-dialog modal-lg scrollable" role="document">
                  <div className="modal-content scrollable">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLongTitle">Create Job</h5>
                      <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close" data-dismiss="modal">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body scrollable">
                      <div className="mb-3">
                        <div className="">
                          <label className="" >Job ID</label>
                        </div>
                        <input type="text" className="form-control" id="JobId" value={jobId} onChange={(e) => setJobId(e.target.value)} placeholder='Job01' />
                      </div>
                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">Job Name</label>
                          <input type="text" className="form-control" id="JobName" value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="Job-Name" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">Job Description</label>
                        </div>
                        <textarea className="form-control" id="description" value={description} onChange={(e) => setDescription(e.target.value)} aria-label="With textarea" placeholder="Job Description"></textarea>
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">PO Number</label>
                        </div>
                        <input type="text" className="form-control" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} id="poNumber" placeholder='PO Number' />
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">PO Date</label>
                        </div>
                        <input type="date" className="form-control mb-3" value={poDate.split('/').reverse().join('-')} onChange={handleDateChange} />
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="">PO File</label>
                        </div>
                        <div className="">
                          <input type="file" className=" form-control" value={file} onChange={(e) => setFile(e.target.value)} id="inputGroupFile01" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">Sub Job</label>
                        </div>
                        <input type="text" className="form-control" id="subJob" placeholder="Sub-Job#1" />
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">Client</label>
                        </div>
                        <input type="text" className="form-control" value={client} onChange={(e)=> setClient(e.target.value)} id="client" placeholder="Client" />
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">EPC</label>
                        </div>
                        <input type="text" className="form-control" value={epc} onChange={(e)=>setEPC(e.target.value)} id="epc" placeholder="EPC" />
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">End User</label>
                        </div>
                        <input type="text" className="form-control" value={endUser} onChange={(e)=>setEndUser(e.target.value)} id="endUser" placeholder='End User' />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => setShowModal(false)}>Close</button>
                      <button type="button" className="btn btn-primary" onClick={createJob}>Create</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">

            {
              Array.isArray(jobs) && jobs.length > 0 ? (
                
                jobs.map((job, index) => (
                  <div className="col" key={index} onClick={() => handleJobClick(job.jobId)}>
                    <div className="card shadow-none border bg-gradient-end-3">
                      <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                          <div className="flex-grow-1">
                            <h6 className="mb-2 text-xl">Job name : {job.jobName}</h6>
                            <p className="mb-0">{job.jobId}</p>
                          </div>
                        </div>
                        <div className="mt-3 d-flex flex-wrap justify-content-between align-items-center gap-1">
                          <div className="">
                            <h6 className="mb-8 text-lg">PO Number: {job.poNumber}</h6>
                            <h6 className="mb-8 mt-[100px] text-lg">Client: {job && job.client ? job.client:'N/A'}</h6>
                            <h6 className="mb-8 text-sm fw-medium text-secondary-light">PO Date: {job.poDate}</h6>

                            <span className="text-success-main text-md">Status: Job Created</span>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>no jobs found</p>
              )

            }
          </div>
        </div>
      </div>



            
    </MasterLayout>
  )
}

export default BDDashboard