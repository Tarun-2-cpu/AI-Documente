import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useState, useEffect } from 'react'
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import swal from 'sweetalert';



function PmDashboard() {

  const [modalShow, setModalShow] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalTransmittals, setTotalTransmittals] = useState(0);
  const [pendingTransmittals, setPendingTransmittals] = useState(0);
  const [permissions, setPermissions] = useState([]);



  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    setJobs(storedJobs);

    setTotalJobs(storedJobs.length);

    const transmittalsCount = storedJobs.reduce(
      (total, job) => total + (job.transmittals?.length || 0),
      0
    );

    const pendingCount = storedJobs.reduce(
      (total, job) => total + (job.transmittals?.filter(t => t.status === 'pending').length || 0),
      0
    );

    setTotalTransmittals(transmittalsCount);
    setPendingTransmittals(pendingCount);


    const jobId = localStorage.getItem('currentJobId');
    const job = jobs.find(j => j.jobId === jobId);

    if (job && job.permissions) {
      setPermissions(job.permissions);
    }

  }, [])

  function managePermission() {
    setModalShow(true)
  }

  function addPermissionRow() {
    setPermissions([...permissions, { name: '', email: '', read: false, update: false, notify: false }]);
  }

  const handleInputChange = (index, field, value) => {
    const updatedPermissions = permissions.map((perm, i) =>
      i === index ? { ...perm, [field]: value } : perm
    );
    setPermissions(updatedPermissions);
  };



  function savePermissions() {
    const jobId = localStorage.getItem('currentJobId');
    const jobIndex = jobs.findIndex(j => j.jobId === jobId);

    if (jobIndex > -1) {
      jobs[jobIndex].permissions = permissions;
      localStorage.setItem('jobs', JSON.stringify(jobs));
      // swal("Added!", "Permissions successfully added", "success");
      setModalShow(false);
    }
  }
  


  return (
    <MasterLayout>

      {/* Breadcrumb */}
      <Breadcrumb title="Project Management Dashboard" />

      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Project Management Dashboard</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
            <div className="col">
              <div className="card shadow-none border bg-gradient-start-1">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <p className="fw-medium text-primary-light mb-1">
                        Total Jobs
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
            <div className="col">
              <div className="card shadow-none border bg-gradient-start-2">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <p className="fw-medium text-primary-light mb-1">
                        Total Transmittals
                      </p>
                      <h6 className="mb-0">{totalTransmittals}</h6>
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
            <div className="col">
              <div className="card shadow-none border bg-gradient-start-3">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <p className="fw-medium text-primary-light mb-1">
                        Pending Transmittals
                      </p>
                      <h6 className="mb-0">{pendingTransmittals}</h6>
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
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between w-100" style={{ width: 100 + '%' }}>

          <h6 className="text-lg fw-semibold mb-0">Active Jobs</h6>

          <Button
            type="button"
            className="btn rounded-pill btn-primary-100 text-primary-600 radius-8 px-20 py-11"
            variant="primary"
            onClick={managePermission}
          >
            Manage Permissions
          </Button>

          <Modal
            show={modalShow}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter">
                Manage Permissions
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Table bordered>
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Name</th>
                    <th style={{ width: '25%' }}>Email</th>
                    <th style={{ width: '10%' }}>Read</th>
                    <th style={{ width: '10%' }}>Update</th>
                    <th style={{ width: '10%' }}>Notify</th>
                  </tr>
                </thead>
                <tbody id="permissionsTableBody">
                  {permissions.map((perm, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={perm.name}
                          placeholder="Enter Name"
                          onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                          style={{ width: '100%' }} // Limit input width
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          value={perm.email}
                          placeholder="Enter Email"
                          onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                          style={{ width: '100%' }} // Limit input width
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          class="form-check-input"
                          type="checkbox"
                          checked={perm.read}
                          onChange={(e) => handleInputChange(index, 'read', e.target.checked)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          class="form-check-input"
                          type="checkbox"
                          checked={perm.update}
                          onChange={(e) => handleInputChange(index, 'update', e.target.checked)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          class="form-check-input"
                          type="checkbox"
                          checked={perm.notify}
                          onChange={(e) => handleInputChange(index, 'notify', e.target.checked)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Button
                className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
                onClick={() => addPermissionRow()}>
                Add Row
              </Button>

            </Modal.Body>
            <Modal.Footer>

              <Button
                className="btn rounded-pill btn-primary-100 text-primary-600 radius-8 px-20 py-11"
                onClick={() => savePermissions()}>
                Save Permissions
              </Button>
              <Button
                className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                onClick={() => setModalShow(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">

            {
              jobs.map((job, index) => (

                <div className="col">
                  <div className="card shadow-none border bg-gradient-end-3" key={index} onClick={() => { }}>
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

export default PmDashboard