import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useState, useEffect } from 'react'
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import { useNavigate } from 'react-router-dom';



function EnggDashboard() {
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [transmittalsShared, setTransmittalsShared] = useState(0);
  const [pendingActions, setPendingActions] = useState(0);
  const [dueDates, setDueDates] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    setJobs(storedJobs);

    setTotalJobs(storedJobs.length);

    const calculateTransmittalsShared = storedJobs.reduce((count, job) => count + (job.transmittals ? job.transmittals.length : 0), 0);
    setTransmittalsShared(calculateTransmittalsShared)

    const calculatePendingActions = storedJobs.reduce((count, job) => count + (job.pendingActions || 0), 0);
    setPendingActions(calculatePendingActions)

    const calculateDueDates = storedJobs.reduce((count, job) => count + (job.dueDates || 0), 0);
    setDueDates(calculateDueDates)


  }, [])

  function redirect(job){
    localStorage.setItem('currentJobId', job.jobId);
    navigate('/engineering-job-detail');   // PM Job Details Page
  }


  return (
    <MasterLayout>

      {/* Breadcrumb */}
      <Breadcrumb title="Engineering Dashboard" />

      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Engineering Dashboard</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4" style={{width : "full"}}>
            <div className="col" style={{width: "25%"}}>
              <div className="card shadow-none border bg-gradient-start-1">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <p className="fw-medium text-primary-light mb-1">
                        Jobs
                      </p>
                      <h6 className="mb-0">{totalJobs}</h6>
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
            <div className="col" style={{width: "25%"}}>
              <div className="card shadow-none border bg-gradient-start-2">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <p className="fw-medium text-primary-light mb-1">
                        Transmittals Shared
                      </p>
                      <h6 className="mb-0">{transmittalsShared}</h6>
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
            <div className="col" style={{width: "25%"}}>
              <div className="card shadow-none border bg-gradient-start-3">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <p className="fw-medium text-primary-light mb-1">
                        Pending Actions
                      </p>
                      <h6 className="mb-0">{pendingActions}</h6>
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
            <div className="col" style={{width: "25%"}}>
              <div className="card shadow-none border bg-gradient-start-3">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <p className="fw-medium text-primary-light mb-1">
                        Due Dates
                      </p>
                      <h6 className="mb-0">{dueDates}</h6>
                    </div>
                    <div className="w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center">
                      <Icon
                        icon="fa6-solid:calendar-days"
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
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between w-100" style={{ width: 100 + '%' }}>
          <h6 className="text-lg fw-semibold mb-0">Active Jobs</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
            {
              jobs.map((job, index) => (
                <div className="col">
                  <div className="card shadow-none border bg-gradient-end-3" key={index} onClick={() => redirect(job)}>
                    <div className="card-body p-20">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div className="flex-grow-1">
                          <h6 className="mb-2 text-xl">{job.jobId} : {job.jobName}</h6>
                          <p className="mb-0">{job.jobDescription}</p>

                        </div>
                      </div>
                      <div className="mt-3 d-flex flex-wrap justify-content-between align-items-center gap-1">
                        <div className="">
                          <h6 className="mb-8 text-lg">PO Number: {job.poNumber}</h6>
                          <h6 className="mb-8 text-sm fw-medium text-secondary-light">PO Date: {job.poDate}</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </MasterLayout>
  )
}

export default EnggDashboard