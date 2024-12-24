import React, { useState, useEffect } from 'react'
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import { Icon } from '@iconify/react/dist/iconify.js'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';




function EnggJobDetail() {

  const [currentJob, setCurrentJob] = useState(null);
  const [currentJobID, setCurrentJobID] = useState(null);
  const [transmittal, setTransmittal] = useState(null)
  const [totalJobs, setTotalJobs] = useState([]);
  const [rows, setRows] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);


  const [engRequests, setEngRequests] = useState([]);
  const [engMasterlistModal, setEngMasterlistModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);


  // modal view
  const [transmittalDetailModal, setTransmittalDetailModal] = useState(false);

  const [masterlist, setMasterlist] = useState(null);
  // inputs
  const [fileDesc, setFileDesc] = useState('');
  const [equipTag, setEquipTag] = useState('');
  const [nmr, setNMR] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [clientDocNo, setClientDocNo] = useState('');
  const [zsDocNo, setZSDocNo] = useState('');
  const [pDate, setPDate] = useState('');
  const [owner, setOwner] = useState('');
  const [revisionModalShow, setRevisionModalShow] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [revisions, setRevisions] = useState([]);

  useEffect(() => {

    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const jobId = localStorage.getItem("currentJobId");
    const job = jobs.find((j) => j.jobId === jobId);

    loadJobDetails();
    setTotalJobs(jobs);

    if (job) {
      setCurrentJob(job);
      setCurrentJobID(job.id)
    } else {
      alert("Job not found.");
    }
    console.log(job.masterlistRequests)
    console.log(job);


    if (job?.masterlistRequests) {
      const filteredRequests = job.masterlistRequests.filter((request) =>
        request.departments.includes("ENG")
      );
      setEngRequests(filteredRequests);
    }

    if (job?.masterlist) {
      setMasterlist(job.masterlist)
    }

    console.log(engRequests);

    if (currentJob && currentJob.masterlist && currentJob.masterlist.ENG) {
      setIsUpdate(true);
      // Populate the rows with existing data
      setRows(currentJob.masterlist.ENG);
    } else {
      setIsUpdate(false);
      setRows([])
    }

  }, [])


  console.log("eng master list", engRequests);
  console.log("rows", rows);

  console.log("masterlist", currentJob?.masterlist);
  console.log("master list state", masterlist);


  function loadJobDetails() {
    const jobId = localStorage.getItem('currentJobId');
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find(j => j.jobId === jobId);

    setTotalJobs(jobs);
    setCurrentJob(job);
  }

  function viewTransmittalDetails(date) {

    const transmittal = currentJob.transmittals.find(t => t.date === date);


    if (!transmittal) {
      alert('Transmittal not found.');
      return;
    }

    setTransmittal(transmittal);
    setTransmittalDetailModal(true);
  }


  const determineDueDateColor = (dueDate) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const timeDifference = dueDateObj - today;
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) return "red"; // Due date has passed
    if (daysRemaining <= 7) return "#FF9900"; // Due date within the next week
    return "blue"; // Due date is more than a week away
  };

  const handleRequestClick = (currentJobID, request) => {
    setSelectedRequest(request);
    setEngMasterlistModal(true);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        fileDescription: "",
        equipmentTag: "",
        nmrCode: "",
        clientCode: "",
        clientDocumentNo: "",
        zsDocumentNo: "",
        plannedDate: "",
        ownerEmail: "",
      },
    ]);
  };

  const updateRow = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  };

  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };


  const handleSave = () => {
    setEngMasterlistModal(false);
    // Call this function to populate the masterlist when the page loads

    const masterlistData = {
      fileDescription: fileDesc,
      equipmentTag: equipTag,
      nmrCode: nmr,
      clientCode: clientCode,
      clientDocumentNo: clientDocNo,
      zsDocumentNo: zsDocNo,
      plannedDate: pDate,
      ownerEmail: owner,
    }

    // Retrieve the existing job data
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const jobId = localStorage.getItem('currentJobId');
    const jobIndex = jobs.findIndex(j => j.jobId === jobId);

    if (jobIndex === -1) {
      alert("Job not found!");
      return;
    }

    // Add or update the masterlist for the Engineering department
    const currentJob = jobs[jobIndex];
    currentJob.masterlist = currentJob.masterlist || {};
    currentJob.masterlist.ENG = Array.isArray(currentJob.masterlist.ENG) ? currentJob.masterlist.ENG : [];

    // Append the new entry to the masterlist array
    currentJob.masterlist.ENG.push(masterlistData);

    // Update the localStorage
    jobs[jobIndex] = currentJob;
    localStorage.setItem('jobs', JSON.stringify(jobs));

    // Close the modal
    closeMasterlistModal();
  };

  //   // Function to close the modal
  function closeMasterlistModal() {
    setEngMasterlistModal(false);
  }

  function uploadFile(index) {
    const fileEntry = currentJob.masterlist.ENG[index];

    if (!fileEntry.revisions) {
      fileEntry.revisions = [];
    }

    setRevisionModalShow(true);
    setCurrentFileIndex(index);
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const newRevision = {
      hash: `hash_${file.name}_${Date.now()}`, // Placeholder for hash generation
      date: new Date().toLocaleDateString(),
      pageCount: estimatePageCount(file), // Replace with your logic
      size: `${(file.size / 1024).toFixed(2)} KB`,
    };

    const updatedRevisions = [...revisions, newRevision];
    setRevisions(updatedRevisions);

    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const jobIndex = jobs.findIndex((job) => job.jobId === currentJob.jobId);


    if (jobIndex !== -1) {
      const updatedJobs = [...jobs];
      updatedJobs[jobIndex].masterlist.ENG[currentFileIndex].revisions = updatedRevisions;
  
      // Save the updated jobs array back to localStorage
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    } else {
      console.error('Job not found in local storage');
    }
  };

  // Mock function to estimate page count (replace with actual logic)
  function estimatePageCount(file) {
    return 20; 
  }


  const closeModal = () => {
    setRevisionModalShow(false);
    setCurrentFileIndex(null);
    setRevisions([]);
  };

  //   // Function to add a new row to the masterlist table

  //   function addMasterlistRow() {
  //     const tableBody = document.getElementById('masterlistTableBody');
  //     const newRow = document.createElement('tr');

  //     newRow.innerHTML = `
  // <td><input type="text" placeholder="File Description"  value="File Description-Test"></td>
  // <td><input type="text" placeholder="Equipment Tag" value="Equipment Tag-Test"></td>
  // <td><input type="text" placeholder="NMR Code" value="NMR-Test"></td>
  // <td><input type="text" placeholder="Client Code" value="Client Code-Test"></td>
  // <td><input type="text" placeholder="Client Document No." value="Client Document No.-Test"></td>
  // <td><input type="text" placeholder="ZS Document No." value="ZS Document No.-Test"></td>
  // <td><input type="date" placeholder="Planned Date"></td>
  // <td><input type="email" placeholder="Owner (Email)"  value="FileOwner@company.com"></td>
  // <td><button onclick="deleteRow(this)">Delete</button></td>
  // `;
  //     tableBody.appendChild(newRow);
  //   }



  //   // Function to delete a row
  //   function deleteRow(button) {
  //     button.parentElement.parentElement.remove();
  //   }

  //   // Function to save the masterlist to localStorage

  //   function saveMasterlist() {
  //     const tableBody = document.getElementById('masterlistTableBody');
  //     const rows = Array.from(tableBody.getElementsByTagName('tr'));

  //     const masterlistData = rows.map(row => {
  //       const cells = row.getElementsByTagName('input');
  //       return {
  //         fileDescription: cells[0].value,
  //         equipmentTag: cells[1].value,
  //         nmrCode: cells[2].value,
  //         clientCode: cells[3].value,
  //         clientDocumentNo: cells[4].value,
  //         zsDocumentNo: cells[5].value,
  //         plannedDate: cells[6].value,
  //         ownerEmail: cells[7].value,
  //       };
  //     });

  //     // Retrieve existing jobs from localStorage
  //     const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  //     const jobId = localStorage.getItem('currentJobId');
  //     const job = jobs.find(j => j.jobId === jobId);

  //     // Add or update the masterlist for the Engineering department
  //     job.masterlist = job.masterlist || {};
  //     job.masterlist.ENG = masterlistData;

  //     localStorage.setItem('jobs', JSON.stringify(jobs));
  //     closeMasterlistModal();

  //     // Call this function to populate the masterlist when the page loads
  //     displayEngineeringMasterlist();

  //   }





  return (
    <MasterLayout>
      {/* Breadcrumb */}
      <Breadcrumb title="Job Detail - Engineering" />

      {/* top cards */}
      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Engineering Dashboard</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4" style={{ width: "full" }}>
            <div className="col" style={{ width: "20%" }}>
              <div className="card shadow-none border bg-gradient-start-1">
                <div className="card-body p-20">
                  <div className="d-flex flex-column-reverse align-items-center justify-content-between">
                    <div className="d-flex flex-column align-items-center justify-content-between gap-1">
                      <h6 className="text-center mt-3">9</h6>
                      <p className="fw-medium text-primary-light mb-0">
                        Approved Files
                      </p>
                      {/* <h6 className="mb-0">{totalJobs}</h6> */}
                    </div>
                    <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">
                      <Icon
                        icon="fluent:document-checkmark-24-filled"
                        className="text-base text-2xl mb-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* card end */}
            </div>
            <div className="col" style={{ width: "20%" }}>
              <div className="card shadow-none border bg-gradient-start-2">
                <div className="card-body p-20">
                  <div className="d-flex flex-column-reverse align-items-center justify-content-between gap-3">
                    <div>
                      <h6 className="text-center my-2">9</h6>
                      <p className="fw-medium text-primary-light mb-1">
                        Shared Files
                      </p>
                      {/* <h6 className="mb-0">{transmittalsShared}</h6> */}
                    </div>
                    <div className="w-50-px h-50-px bg-purple rounded-circle d-flex justify-content-center align-items-center">
                      <Icon
                        icon="tabler:folder-share"
                        className="text-base text-2xl mb-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* card end */}
            </div>
            <div className="col" style={{ width: "20%" }}>
              <div className="card shadow-none border bg-gradient-start-3">
                <div className="card-body p-20">
                  <div className="d-flex flex-column-reverse flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <h6 className="text-center my-2">9</h6>
                      <p className="fw-medium text-primary-light mb-1">
                        Returned Files
                      </p>
                      {/* <h6 className="mb-0">{pendingActions}</h6> */}
                    </div>
                    <div className="w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center">
                      <Icon
                        icon="mdi:file-rotate-left-outline"
                        className="text-base text-2xl mb-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* card end */}
            </div>
            <div className="col" style={{ width: "20%" }}>
              <div className="card shadow-none border bg-gradient-start-3">
                <div className="card-body p-20">
                  <div className="d-flex flex-column-reverse align-items-center justify-content-between gap-3">
                    <div>
                      <h6 className="text-center my-2">9</h6>
                      <p className="fw-medium text-primary-light mb-1">
                        New Files
                      </p>
                      {/* <h6 className="mb-0">{dueDates}</h6> */}
                    </div>
                    <div className="w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center">
                      <Icon
                        icon="mdi:folder-plus-outline"
                        className="text-base text-2xl mb-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* card end */}
            </div>
            <div className="col" style={{ width: "20%" }}>
              <div className="card shadow-none border bg-gradient-start-3">
                <div className="card-body p-20">
                  <div className="d-flex flex-column-reverse align-items-center justify-content-between gap-3">
                    <div>
                      <h6 className="text-center my-2">9</h6>
                      <p className="fw-medium text-primary-light mb-1">
                        Total Transmittals
                      </p>
                      {/* <h6 className="mb-0">{dueDates}</h6> */}
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

      {/* job detail card */}

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Job Details</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-1 gy-4">
            <div className="col w-100">
              <div className="card shadow-none border bg-gradient-start-1 w-100">
                <div className="card-body p-20">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <pre>
                        <table>
                          <tbody>
                            <tr>
                              <th><h6>Job ID</h6></th>
                              <td style={{ paddingLeft: "20px" }}><strong>: {currentJob ? currentJob.jobId : "N/A"} </strong></td>
                            </tr>
                            <tr>
                              <th><h6>Job Name</h6></th>
                              <td style={{ paddingLeft: "20px" }}><strong>: {currentJob ? currentJob.jobName : "N/A"} </strong></td>
                            </tr>
                            <tr>
                              <th><h6>Description</h6></th>
                              <td style={{ paddingLeft: "20px" }}><strong>: {currentJob ? currentJob.description : "N/A"} </strong> </td>
                            </tr>
                            <tr>
                              <th><h6>PO Number</h6></th>
                              <td style={{ paddingLeft: "20px" }}><strong>: {currentJob ? currentJob.poNumber : "N/A"}  </strong></td>
                            </tr>
                            <tr>
                              <th><h6>PO Date</h6></th>
                              <td style={{ paddingLeft: "20px" }}><strong>: {currentJob ? currentJob.poDate : "N/A"}  </strong></td>
                            </tr>
                          </tbody>
                        </table>
                      </pre>
                    </div>
                    <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">
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
          </div>
        </div>
      </div>

      {/* incoming docs transmittal */}

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Incoming Document Transmittals</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-1 gy-4">
            <div className="col w-100">
              <div className=" shadow-none border w-100">
                <div className="card-body p-20">
                  {
                    currentJob ? (
                      currentJob.transmittals && currentJob.transmittals.length > 0 ? (
                        <Table bordered id="" className="">
                          <thead>
                            <tr>
                              <th>Transmittal ID</th>
                              <th>Document</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentJob.transmittals
                              .filter(
                                (transmittal) =>
                                  transmittal.notifiedDepartments &&
                                  transmittal.notifiedDepartments.includes("ENG")
                              )
                              .map((transmittal, index) => (
                                <tr key={index}>
                                  <td onClick={() => viewTransmittalDetails(transmittal.date)}>
                                    {transmittal.id}
                                  </td>
                                  <td onClick={() => viewTransmittalDetails(transmittal.date)}>
                                    {transmittal.date}
                                  </td>
                                  <td onClick={() => viewTransmittalDetails(transmittal.date)}>
                                    {transmittal.summary}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      ) : (
                        <p>No transmittals available for Engineering.</p>
                      )
                    ) : (
                      <p>Loading job details...</p>
                    )
                  }

                  {/*Transmittal Detail*/}
                  <Modal
                    show={transmittalDetailModal}
                    // jobId={selectedJobId}
                    // srNo={selectedSrNo}
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    id="revisionModal"
                  >
                    <Modal.Header>
                      <Modal.Title id="contained-modal-title-vcenter">
                        Transmittal Details
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                      <div>
                        <Table bordered id="">

                          {
                            transmittal && (
                              <tbody>
                                <tr>
                                  <th>Date : </th>
                                  <td>{transmittal.date}</td>
                                </tr>
                                <tr>
                                  <th>Summary/Comments:</th>
                                  <td>{transmittal.summary}</td>
                                </tr>
                              </tbody>
                            )
                          }
                        </Table>
                      </div>

                      <div className="pt-5">
                        <h6>Job Details</h6>
                        {
                          currentJob && (
                            <Table bordered id="revision-history-table">
                              <tr>
                                <th>Job ID : </th>
                                <td>{currentJob.jobId}</td>
                              </tr>
                              <tr>
                                <th>Job Name:</th>
                                <td>{currentJob.jobName}</td>
                              </tr>
                              <tr>
                                <th>Client:</th>
                                <td>{currentJob.client}</td>
                              </tr>
                              <tr>
                                <th>EPC:</th>
                                <td>{currentJob.epc}</td>
                              </tr>
                              <tr>
                                <th>
                                  End User:
                                </th>
                                <td>{currentJob.endUser}</td>
                              </tr>
                            </Table>
                          )
                        }
                      </div>

                      <div className="card h-100 p-0 radius-12 mt-24">
                        <div className="card-header border-bottom bg-base py-16 px-24">
                          <h6 className="text-lg fw-semibold mb-0">Files in this Transmittal</h6>
                        </div>
                        <div className="card-body p-24">

                          <Table bordered id="revision-history-table">

                            <thead>
                              <tr>
                                <th style={{ width: "25%" }}>File Name</th>
                                <th style={{ width: "25%" }}>File Type</th>
                                <th style={{ width: "25%" }}>Size</th>
                                <th style={{ width: "25%" }}>Last Modified</th>
                                <th style={{ width: "25%" }}>Page Count	</th>
                                <th style={{ width: "25%" }}>Revision</th>
                                <th style={{ width: "25%" }}>Revision</th>
                                <th style={{ width: "25%" }}>Actions</th>
                              </tr>
                            </thead>
                            < tbody>

                              {
                                transmittal ? (
                                  transmittal.files.map((file, index) => {
                                    const doc = currentJob.incomingDocs.find(d => d.srNo === file.srNo)
                                    if (!doc) return null;
                                    return (
                                      <tr key={index}>
                                        <td>{doc.fileName}</td>
                                        <td>{doc.fileType.toUpperCase()}</td>
                                        <td>{doc.fileSize}</td>
                                        <td>{doc.lastModified}</td>
                                        <td>{doc.pageCount}</td>
                                        <td>{file.revision}</td>
                                        <td><a href="${file.fileLink}" target="_blank">View</a></td>
                                      </tr>
                                    )
                                  })
                                ) : (
                                  <p> No transmittal Available </p>
                                )
                              }
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                        onClick={() => setTransmittalDetailModal(false)}
                      >
                        Close
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Master List of Files from Department */}

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Master List of Files from Departments</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-1 gy-4">
            <div className="col w-100">
              <div className="card shadow-none border w-100">
                <div className="card-body p-20">
                  <Table bordered id="" className="">
                    <thead>
                      <tr>
                        <th>Serial No.</th>
                        <th>Department</th>
                        <th>Description</th>
                        <th>Current Revision</th>
                        <th>Last Updated</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>

                      </tr>
                    </tbody>
                  </Table>
                </div>

                {/*Files Details*/}
                <Modal
                  show={false}
                  // jobId={selectedJobId}
                  // srNo={selectedSrNo}
                  size="xl"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                  id="revisionModal"
                >
                  <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                      Files Details
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>

                    <div>
                      <Table bordered id="revision-history-table">
                        <tr>
                          <th>Deparment : </th>
                          <td>ENG</td>
                        </tr>
                        <tr>
                          <th>File Description:</th>
                          <td>File Description-Test</td>
                        </tr>
                        <tr>
                          <th>Owner:</th>
                          <td>File Owner@company.com</td>
                        </tr>
                      </Table>
                    </div>

                    <div className="card h-100 p-0 radius-12 mt-24">
                      <div className="card-body p-24">

                        <Table bordered id="revision-history-table">
                          <thead>
                            <tr>
                              <th style={{ width: "12.5%" }}>Rev No</th>
                              <th style={{ width: "12.5%" }}>View File Sent</th>
                              <th style={{ width: "12.5%" }}>Sent Date</th>
                              <th style={{ width: "12.5%" }}>Return File</th>
                              <th style={{ width: "12.5%" }}>Comment Code</th>
                              <th style={{ width: "12.5%" }}>PM Comment</th>
                              <th style={{ width: "12.5%" }}>Return Date</th>
                              <th style={{ width: "12.5%" }}>File Status</th>
                            </tr>
                          </thead>
                          <tbody id="">

                          </tbody>
                        </Table>

                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                    >
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/*File Revisions*/}
                <Modal
                  show={revisionModalShow}
                  size="xl"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                  id="revisionModal"
                >
                  <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                      File Revisions
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>

                    <Table bordered id="revision-history-table">
                      <thead>
                        <tr>
                          <th style={{ width: "15%" }}>Revision</th>
                          <th style={{ width: "35%" }}>File Hash</th>
                          <th style={{ width: "15%" }}>File Date</th>
                          <th style={{ width: "10%" }}>Page Count	</th>
                          <th style={{ width: "10%" }}>File Size</th>
                          <th style={{ width: "10%" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody id="revision-history-body">
                        {revisions.map((revision, index) => (
                          <tr key={index}>
                            <td>{index}</td>
                            <td>{revision.hash}</td>
                            <td>{revision.date}</td>
                            <td>{revision.pageCount}</td>
                            <td>{revision.size}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <br />
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileUpload}
                    />

                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                      onClick={() => setRevisionModalShow(false)}
                    >
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Master List Request */}

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Master List Request</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-1 gy-4">
            <div className="col w-100">
              <div className="card shadow-none border w-100">
                <div className="card-body p-20" id="masterlistRequestsList">
                  <div className="card-body p-24">

                    {engRequests.length === 0 ? (
                      <p>No Masterlist requests for Engineering.</p>
                    ) : (
                      <div className="row row-cols-1 gy-4">
                        {engRequests.map((request, index) => (
                          <div className="col w-100" key={index}>
                            <div
                              className="masterlist-request-card card shadow-none border w-100 d-flex flex-row align-items-center justify-content-between px-3"
                              style={{
                                borderLeft: `5px solid ${determineDueDateColor(
                                  request.dueDate
                                )}`,
                              }}
                            >
                              <div className="request-details p-20">
                                <p>
                                  <strong>Departments:</strong>{" "}
                                  {request.departments.join(", ")}
                                </p>
                                <p>
                                  <strong>Due Date:</strong>{" "}
                                  <span
                                    style={{
                                      color: determineDueDateColor(request.dueDate),
                                    }}
                                  >
                                    {request.dueDate}
                                  </span>
                                </p>
                                <p>
                                  <strong>Requested On:</strong> {request.requestedOn}
                                </p>
                              </div>
                              <Button
                                className="create-masterlist-btn btn btn-primary"
                                onClick={() => handleRequestClick(currentJobID, request)}
                              >
                                Create Masterlist
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                    }
                  </div>
                </div>

                {/*Files Details*/}

                {/* {selectedRequest && ( */}
                <Modal
                  show={engMasterlistModal}
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                  id="revisionModal"
                  style={{ display: engMasterlistModal ? "flex" : "none" }}
                // onClose={() => setRevisionModalShow(false)}
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                      Engineering Masterlist
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <h6>{isUpdate ? "Update Masterlist" : "Create Masterlist"}</h6>
                    {/* {rows.map((row, index) => ( */}

                    <div className="modal-body" >
                      <div className="mb-3">
                        <div className="">
                          <label className="">File Desc</label>
                        </div>
                        <input type="text"
                          value={fileDesc}
                          className="form-control"
                          onChange={(e) =>
                            // updateRow(index, "fileDescription", e.target.value)
                            setFileDesc(e.target.value)
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">Equip Tag</label>
                          <input type="text"
                            className="form-control"
                            value={equipTag}
                            onChange={(e) =>
                              // updateRow(index, "EquipmentTag", e.target.value)
                              setEquipTag(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">NMR Code</label>
                        </div>
                        <input type="text"
                          className="form-control"
                          id="JobName"
                          value={nmr}
                          onChange={(e) =>
                            // updateRow(index, "nmrCode", e.target.value)
                            setNMR(e.target.value)
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">Client Code	</label>
                        </div>
                        <input type="text"
                          className="form-control"
                          value={clientCode}
                          onChange={(e) =>
                            // updateRow(index, "clientCode", e.target.value)
                            setClientCode(e.target.value)
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">Client Doc No.</label>
                        </div>
                        <input type="text"
                          className="form-control"
                          value={clientDocNo}
                          onChange={(e) =>
                            // updateRow(index, "clientDocumentNo", e.target.value)
                            setClientDocNo(e.target.value)
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="">ZS Doc No.</label>
                        </div>
                        <div className="">
                          <input type="text"
                            className="form-control"
                            value={zsDocNo}
                            onChange={(e) =>
                              // updateRow(index, "zsDocumentNo", e.target.value)
                              setZSDocNo(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="" id="">Planned Date</label>
                        </div>
                        <input type="date"
                          className="form-control mb-3"
                          value={pDate}
                          onChange={(e) =>
                            // updateRow(index, "plannedDate", e.target.value)
                            setPDate(e.target.value)
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <div className="">
                          <label className="">Owner</label>
                        </div>
                        <div className="">
                          <input type="email"
                            className="form-control"
                            value={owner}
                            onChange={(e) =>
                              // updateRow(index, "ownerEmail", e.target.value)
                              setOwner(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="mb-3 ">
                        <div className="d-flex align-items-center justify-content-end w-full">
                          <Button className="btn rounded-pill radius-8 px-3 py-2" variant="outline-danger" onClick={() => deleteRow()}>Delete</Button>
                        </div>
                      </div>
                    </div>

                    {/* ))} */}
                    <Button
                      className="btn rounded-pill radius-8 px-20 py-11"
                      variant="outline-secondary"
                      onClick={addRow}
                    >
                      Add Row
                    </Button>

                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      className="btn rounded-pill btn-primary-100 text-primary-900 radius-8 px-20 py-11"
                      onClick={handleSave}
                    >
                      {isUpdate ? "Update Masterlist" : "Save Masterlist"}
                    </Button>
                    <Button
                      className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                      onClick={() => setEngMasterlistModal(false)}
                    >
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>
                {/* )} */}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* document MasterList */}

      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Document Masterlist</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-1 gy-4">
            <div className="col w-100">
              <div className="card shadow-none border bg-gradient-start-6 w-100">
                <div className="card-body p-20">
                  <Table bordered id="" className="">
                    <thead>
                      <tr>
                        <th>File Description</th>
                        <th>Equipment Tag</th>
                        <th>NMR Code</th>
                        <th>Client Code</th>
                        <th>Client Document No.</th>
                        <th>ZS Document No.</th>
                        <th>Planned Date</th>
                        <th>Owner (Email)</th>
                        <th>Upload</th>
                      </tr>
                    </thead>
                    {
                      masterlist?.ENG?.length > 0 ? (
                        <tbody>
                          {masterlist.ENG.map((file, index) => (
                            <tr key={index}>
                              <td>{file.fileDescription}</td>
                              <td>{file.equipmentTag}</td>
                              <td>{file.nmrCode}</td>
                              <td>{file.clientCode || "N/A"}</td>
                              <td>{file.clientDocumentNo || "N/A"}</td>
                              <td>{file.zsDocumentNo || "N/A"}</td>
                              <td>{file.plannedDate || "N/A"}</td>
                              <td>{file.ownerEmail || "N/A"}</td>
                              <td>
                                <button className="upload-btn" onClick={() => uploadFile(index)}>
                                  Upload
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      ) : (
                        <p className="text-center">No masterlist entries available.</p>
                      )
                    }
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout >
  )
}

export default EnggJobDetail