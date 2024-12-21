import React, { useEffect, useState } from 'react'
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import { Icon } from '@iconify/react/dist/iconify.js'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

function PmJobDetail() {

  const [outTransmittal, setOutTransmittal] = useState(false)
  const [totalJobs, setTotalJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [masterList, setMasterList] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [date, setDate] = useState('');
  const [transmittal, setTransmittal] = useState(null);
  const [transmittalModal, setTransmittalModal] = useState(false);
  const [outgoingTransmittals, setOutgoingTransmittals] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [departments, setDepartments] = useState({
    ENG: [],
    QAQC: [],
  });

  const [transmittalDetailModal, setTransmittalDetailModal] = useState(false);
  const [outgoingTransmittal, setOutgoingTransmittal] = useState(null);


  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const jobId = localStorage.getItem("currentJobId");
    const job = jobs.find((j) => j.jobId === jobId);

    console.log("Fetched jobs:", jobs);
    console.log("Fetched jobId:", jobId);
    console.log("Found job:", job);

    setTotalJobs(jobs);

    if (job) {
      setCurrentJob(job);
    } else {
      alert("Job not found.");
    }
  }, []);

  const handleCheckboxChange = (value) => {
    setSelectedDepartments((prev) =>
      prev.includes(value)
        ? prev.filter((department) => department !== value)
        : [...prev, value]
    );
  };

  const request = () => {


    if (!Array.isArray(selectedDepartments) || selectedDepartments.length === 0 || !date) {
      alert("Please select at least one department and provide a due date.");
      return;
    }



    const masterlistRequest = {
      departments: selectedDepartments,
      dueDate: date,
      requestedOn: new Date().toLocaleString(),
    };

    if (!currentJob.masterlistRequests) {
      currentJob.masterlistRequests = [];
    }

    currentJob.masterlistRequests.push(masterlistRequest);
    localStorage.setItem("jobs", JSON.stringify(totalJobs));
    alert("Masterlist request saved successfully.");
    setMasterList(false);
    setSelectedDepartments([]);
    setDate("");
  }


  // Handle "Select All" checkbox
  const toggleSelectAllFiles = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
  };

  // outgoing modal
  const openOutgoingTransmittalModal = () => {
    setOutTransmittal(true);
    loadDepartmentFiles();
  };

  const closeOutgoingTransmittalModal = () => {
    setOutTransmittal(false);
    setSelectedFiles([]);
  };

  // Load files from each department's masterlist
  function loadDepartmentFiles() {
    if (currentJob) {
      setDepartments({
        ENG: currentJob.masterlist?.ENG || [],
        QAQC: currentJob.masterlist?.QAQC || [],
      });
    }
  }

  // Function to update file counts across departments

  // function updateFileCount(departmentCountId, listId) {
  //   const departmentCount = document.querySelectorAll(
  //     `#${listId} .file-checkbox:checked`
  //   ).length;
  //   document.getElementById(departmentCountId).innerText = departmentCount;

  //   const totalCount = document.querySelectorAll(".file-checkbox:checked").length;
  //   document.getElementById("totalFileCount").innerText = totalCount;
  // }

  function createOutgoingTransmittal() {
    const newTransmittalId = `ZM-TRAN-OUTGOING-${generateTransmittalId()}`;
    const selectedFiles = getSelectedFiles();

    const outgoingTransmittal = {
      id: newTransmittalId,
      date: new Date().toLocaleString(),
      files: selectedFiles,
    };

    saveTransmittal(outgoingTransmittal);
    setOutgoingTransmittals((prev) => [...prev, outgoingTransmittal]);
    // refreshOutgoingTransmittalList();
  }

  // Open the transmittal detail modal and populate with data
  function openTransmittalDetailModal(transmittalId) {
    const transmittals =
      JSON.parse(localStorage.getItem("outgoingTransmittals")) || [];
    const transmittal = transmittals.find((t) => t.id === transmittalId);

    setOutgoingTransmittal(transmittal);

    if (transmittal) {
      console.log("transmittal", transmittal);

      const transmittalDetails = `
            <div>
                <h3>Transmittal Information</h3>
                <p><strong>Transmittal ID:</strong> ${transmittal.id}</p>
                <p><strong>Date:</strong> ${transmittal.date}</p>
                <h4>Job Details</h4>
                <p><strong>Job ID:</strong> ${currentJob.jobId || "N/A"}</p>
                <p><strong>Job Name:</strong> ${currentJob.jobName || "N/A"}</p>
                <h4>File List</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Equipment Tag</th>
                            <th>NMR Code</th>
                            <th>Client Code</th>
                            <th>Client Document No.</th>
                            <th>ZS Document No.</th>
                            <th>Revision</th>
                            <th>Planned Date</th>
                            <th>Owner</th>
                            <th>File Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transmittal.files
          .map(
            (file) => `
                            <tr>
                                <td>${file.description || "-"}</td>
                                <td>${file.supportData.equipmentTag || "-"}</td>
                                <td>${file.supportData.nmrCode || "-"}</td>
                                <td>${file.supportData.clientCode || "-"}</td>
                                <td>${file.supportData.clientDocumentNo || "-"
              }</td>
                                <td>${file.supportData.zsDocumentNo || "-"}</td>
                                <td>${file.revision || "-"}</td>
                                <td>${file.supportData.plannedDate || "-"}</td>
                                <td>${file.supportData.ownerEmail || "-"}</td>
                                <td><a href="${file.url
              }" target="_blank">View</a></td>
                            </tr>
                        `
          )
          .join("")}
                    </tbody>
                </table>
            </div>
        `;


      setTransmittalDetailModal(true);
    }

  }



  // Helper to gather selected files
  function getSelectedFiles() {
    const files = [];
    document.querySelectorAll(".file-checkbox:checked").forEach((checkbox) => {
      const row = checkbox.closest("tr");
      const fileDesc = row.cells[1].innerText;
      const revision = row.cells[2].querySelector("select").value;
      const supportData = JSON.parse(
        row
          .querySelector(`option[value="${revision}"]`)
          .getAttribute("data-support")
      );
      console.log("supportData", supportData);

      files.push({ description: fileDesc, revision, supportData });
    });
    return files;
  }

  // Generate unique ID based on existing outgoing transmittals
  function generateTransmittalId() {
    return outgoingTransmittals.length + 1;
  }

  // Save transmittal to localStorage
  function saveTransmittal(transmittal) {
    const transmittals =
      JSON.parse(localStorage.getItem("outgoingTransmittals")) || [];
    transmittals.push(transmittal);
    localStorage.setItem("outgoingTransmittals", JSON.stringify(transmittals));
  }

  const handleFileSelection = (department, fileIndex) => {
    const selectedFile = { department, index: fileIndex };
    setSelectedFiles((prev) =>
      prev.find((f) => f.department === department && f.index === fileIndex)
        ? prev.filter((f) => !(f.department === department && f.index === fileIndex))
        : [...prev, selectedFile]
    );
  };



  function viewTransmittalDetails(date) {


    if (!currentJob || !currentJob.transmittals) {
      alert("Current job or transmittals not found.");
      return;
    }

    const transmittal = currentJob.transmittals.find((t) => t.date === date);
    console.log(transmittal);

    if (!transmittal) {
      alert("Transmittal not found.");
      return;
    }

    setTransmittal(transmittal);

    setTransmittalModal(true);
  }


  return (
    <MasterLayout>

      {/* Breadcrumb */}
      <Breadcrumb title="Project Management Job Details" />

      <div className="card h-100 p-0 radius-12">
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
                              <td></td>
                              <td><h6>: {currentJob?.jobId || "N/A"}</h6></td>
                            </tr>
                            <tr>
                              <th><h6>Job Name</h6></th>
                              <td></td>
                              <td><h6>: {currentJob?.jobName || "N/A"}</h6></td>
                            </tr>
                            <tr>
                              <th><h6>Description</h6></th>
                              <td></td>
                              <td><h6>: {currentJob?.description || "N/A"}</h6></td>
                            </tr>
                            <tr>
                              <th><h6>PO Number</h6></th>
                              <td></td>
                              <td><h6>: {currentJob?.poNumber || "N/A"}</h6></td>
                            </tr>
                            <tr>
                              <th><h6>PO Date</h6></th>
                              <td></td>
                              <td><h6>: {currentJob?.poDate || "N/A"}</h6></td>
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
              {
                currentJob && (
                  <Button
                    className="btn rounded-pill btn-primary-100 text-primary-600 radius-8 px-5 py-3 mt-3"
                    id="requestMasterlistBtn"
                    onClick={() => { setMasterList(true) }}
                  >
                    Request Masterlist
                  </Button>
                )
              }

              <Modal
                show={masterList}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                id="notifyModal"
              >
                <Modal.Header>
                  <Modal.Title id="contained-modal-title-vcenter">
                    Request Masterlist
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="notify-department-selection px-32">
                    <table className="department-table w-100" style={{ maxWidth: '100%', tableLayout: 'fixed' }}>
                      <tbody>
                        {[
                          ["PM", "Project Management"],
                          ["ENG", "Engineering"],
                          ["MOC", "Material Ordering & Control"],
                          ["QAQC", "QA/QC"],
                          ["MP", "Material Planning"],
                          ["MFG", "Manufacturing"],
                        ].map(([value, label], index) => (
                          <tr key={index}>
                            <td colSpan={2}>
                              <label className="d-flex align-items-center">
                                <input
                                  type="checkbox"
                                  className="department-checkbox form-check-input me-2"
                                  value={value}
                                  id="confirmMasterlistBtn"
                                  onChange={(e) => handleCheckboxChange(value)}
                                />
                                {label}
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mb-3">
                      <div className="">
                        <label className="" id="">PO Date</label>
                      </div>
                      <input type="date" className="form-control mb-3" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>

                  <Button
                    className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
                    onClick={() => request()}
                  >
                    Request
                  </Button>
                  <Button
                    className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                    onClick={() => setMasterList(false)}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </div>
        </div>
      </div>

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Client Incoming Documents</h6>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4 " id="transmittalsContainer">

            {/* Check if currentJob and its transmittals exist */}

            {/* // jobs.map((job, index) => ( */}

            {currentJob?.transmittals?.length > 0 ? (
              currentJob.transmittals.map((transmittal, index) => (
                <div className="col" key={index} onClick={() => viewTransmittalDetails(transmittal.date)}>
                  <div className="card shadow-none border bg-gradient-end-3">
                    <div className="card-body p-20">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div className="flex-grow-1">
                          <h6 className="mb-2 text-xl">Job name : {currentJob.jobName}</h6>
                          <p className="mb-0">Job ID : {currentJob.jobId}</p>
                        </div>
                      </div>
                      <div className="mt-3 d-flex flex-wrap justify-content-between align-items-center gap-1">
                        <div className="">
                          <h6 className="mb-8 text-lg">Transmittal ID : {transmittal.id}</h6>
                          <h6 className="mb-8 text-sm fw-medium text-secondary-light">Date: {transmittal.date}</h6>
                          <span className="text-success-main text-md"> Summary: {transmittal.summary}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No transmittals available for this job.</p>
            )
            }
          </div>
          <Modal
            show={transmittalModal}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            id="notifyModal"
          >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter">
                Transmittal Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="notify-department-selection px-32">
                {
                  transmittal && (
                    <div className="card h-100 p-0 radius-12 mt-24">
                      <div className="card-body p-24">
                        <table>
                          <tbody>
                            <tr>
                              <th>Transmittal ID:</th>
                              <td className="pl-5">{transmittal.id}</td>
                            </tr>
                            <tr>
                              <th>Sent to:</th>
                              <td className="pl-5">{transmittal.notifiedDepartments}</td>
                            </tr>
                            <tr>
                              <th>Date:</th>
                              <td className="pl-5">{transmittal.date}</td>
                            </tr>
                            <tr>
                              <th>Summary/Comments :</th>
                              <td className="pl-5">{transmittal.summary}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                }

                {
                  currentJob && (
                    <div className="card h-100 p-0 radius-12 mt-24">
                      <div className="card-header border-bottom bg-base py-16 px-24">
                        <h6 className="text-lg fw-semibold mb-0">Job Details</h6>
                      </div>
                      <div className="card-body p-24">
                        <table>
                          <tbody>
                            <tr>
                              <th>Job ID:</th>
                              <td style={{ paddingLeft: "130px" }}>{currentJob.jobId}</td>
                            </tr>
                            <tr>
                              <th>Job Name:</th>
                              <td style={{ paddingLeft: "130px" }}>{currentJob.jobName}</td>
                            </tr>
                            <tr>
                              <th>Client:</th>
                              <td style={{ paddingLeft: "130px" }}>{currentJob.client}</td>
                            </tr>
                            <tr>
                              <th>EPC:</th>
                              <td style={{ paddingLeft: "130px" }}>{currentJob.epc}</td>
                            </tr>
                            <tr>
                              <th>End User :</th>
                              <td style={{ paddingLeft: "130px" }}>{currentJob.endUser}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                }

                {
                  transmittal && (
                    <div className="card h-100 p-0 radius-12 mt-24">
                      <div className="card-header border-bottom bg-base py-16 px-24">
                        <h6 className="text-lg fw-semibold mb-0">Files in this Transmittal</h6>
                      </div>
                      <div className="card-body p-24">
                        <Table bordered id="revision-history-table">

                          <thead>
                            <tr>
                              <th><strong>File Name</strong></th>
                              <th><strong>File Type</strong></th>
                              <th><strong>Size</strong></th>
                              <th><strong>Last Modified</strong></th>
                              <th><strong>Page Count</strong></th>
                              <th><strong>Revision</strong></th>
                              <th><strong>Actions</strong></th>
                            </tr>
                          </thead>

                          <tbody className="pt-5">
                            {
                              transmittal.files?.length > 0 ? (
                                transmittal.files.map((file) => {

                                  const doc = currentJob.incomingDocs.find((d) => d.srNo === file.srNo);

                                  return (
                                    doc && (
                                      <tr key={doc.srNo}>
                                        <td>{doc.fileName}</td>
                                        <td>{doc.fileType.toUpperCase()}</td>
                                        <td>{doc.fileSize}</td>
                                        <td>{doc.lastModified}</td>
                                        <td>{doc.pageCount}</td>
                                        <td>Rev {file.revision}</td>
                                        <td>
                                          <a href={file.fileLink} target="_blank" rel="noopener noreferrer">
                                            View
                                          </a>
                                        </td>
                                      </tr>
                                    )
                                  )
                                })
                              ) : (
                                <td>No Transmittal Files Found</td>
                              )
                            }
                          </tbody>

                        </Table>

                      </div>
                    </div>
                  )
                }
              </div>
            </Modal.Body>
            <Modal.Footer>

              <Button
                className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                onClick={() => setTransmittalModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>




      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between w-100" style={{ width: 100 + '%' }}>
          <h6 className="text-lg fw-semibold mb-0">Master List of Files from Departments</h6>
        </div>
        <div className="card-body p-24">
          <div className="">

            <Table bordered >
              <thead>
                <tr>
                  <th style={{ width: '15%', textAlign: "center" }}>Serial.NO.</th>
                  <th style={{ width: '15%', textAlign: "center" }}>Department</th>
                  <th style={{ width: '10%', textAlign: "center" }}>Description</th>
                  <th style={{ width: '15%', textAlign: "center" }}>Current Revision</th>
                  <th style={{ width: '15%', textAlign: "center" }}>Last Updated</th>
                  <th style={{ width: '10%', textAlign: "center" }}>Status</th>
                  <th style={{ width: '10%', textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody id="fileMasterListBody">


              </tbody>
            </Table>
          </div>
        </div>
      </div>

      {/* Outgoing Modal  */}

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between w-100" style={{ width: 100 + '%' }}>
          <h6 className="text-lg fw-semibold mb-0">Outgoing Transmittals</h6>
        </div>
        <div className="card-body p-24">
          <div className="gy-4 " id="outgoingTransmittalsContainer">
            {
              outgoingTransmittals?.length > 0 ? (

                outgoingTransmittals.map((t) => (
                  <div key={t.id} className="transmittal-card d-flex justify-content-around align-items-center border border-secondary my-3 py-3" onClick={() => openTransmittalDetailModal(t.id)}>
                    <p className="m-auto">
                      <strong>ID:</strong> {t.id}
                    </p>
                    <p className="m-auto">
                      <strong>Date:</strong> {t.date}
                    </p>
                    <p className="m-auto">
                      <strong>Files:</strong> {t.files.length}
                    </p>
                  </div>
                ))
              ) : (
                <p> No outgoing transmittal found</p>
              )

            }
          </div>
          <Button
            className="btn rounded-pill btn-primary-100 text-primary-600 radius-8 px-5 py-3"
            onClick={openOutgoingTransmittalModal}>
            New Outgoing Transmittal
          </Button>


          {outTransmittal && (

            <Modal
              show={outTransmittal}
              size="lg"
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                  Create Outgoing Transmittal
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>

                <div className="tab-container d-flex align-items-center gap-2">
                  <button className="tab-button btn rounded-pill btn btn-outline-secondary text-secondary-600 radius-8 px-5 py-4" onClick="openTab(event, 'ENG')">Engineering (ENG)</button>
                  <button className="tab-button btn rounded-pill btn btn-outline-secondary text-secondary-600 radius-8 px-5 py-4" onClick="openTab(event, 'QAQC')">QA/QC</button>
                  {/* <!-- Add more department tabs as needed --> */}
                </div>

                <div id="ENG" className="tab-content">
                  <p className="mt-5">Total Selected Files: <span id="ENGFileCount">0</span></p>
                  <Table bordered id="" className="">
                    <thead>
                      <tr>
                        <th style={{ width: '20%', textAlign: "center" }}>Select</th>
                        <th style={{ width: '20%', textAlign: "center" }}>File Description</th>
                        <th style={{ width: '20%', textAlign: "center" }}>Revision</th>
                        <th style={{ width: '25%', textAlign: "center" }}>Document No.</th>
                      </tr>
                    </thead>
                    <tbody id="ENGFileList">
                      {/* <!-- Files for ENG will populate here dynamically --> */}

                      {departments.ENG.map((file, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="checkbox"
                              onChange={() => handleFileSelection("ENG", index)}
                            />
                          </td>
                          <td>{file.fileDescription}</td>
                        </tr>
                      ))}



                    </tbody>
                  </Table>
                </div>

                <div id="QAQC" className="tab-content" style={{ display: "none" }}>
                  <p className="mt-5">Total Selected Files: <span id="QAQCFileCount">0</span></p>
                  <Table bordered id="" className="">
                    <thead>
                      <tr>
                        <th style={{ width: '20%', textAlign: "center" }}>Select</th>
                        <th style={{ width: '20%', textAlign: "center" }}>File Description</th>
                        <th style={{ width: '20%', textAlign: "center" }}>Revision</th>
                        <th style={{ width: '25%', textAlign: "center" }}>Document Attributes</th>
                      </tr>
                    </thead>
                    <tbody id="QAQCFileList">
                      {/* <!-- Files for QAQC will populate here dynamically --> */}

                      {departments.QAQC.map((file, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="checkbox"
                              onChange={() => handleFileSelection("QAQC", index)}
                            />
                          </td>
                          <td>{file.fileDescription}</td>
                        </tr>
                      ))}



                    </tbody>
                  </Table>
                </div>

                <p className="mt-5">Total Files Selected Across Departments: <span id="totalFileCount">0</span></p>

              </Modal.Body>
              <Modal.Footer>
                <Button
                  className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
                  onClick={createOutgoingTransmittal}
                >
                  Create Transmittal
                </Button>
                <Button
                  className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                  onClick={closeOutgoingTransmittalModal}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

          )}


          <Modal
            show={transmittalDetailModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter">
                Outgoing Transmittal Detail
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>

              {
                outgoingTransmittal && (
                  <div className="card h-100 p-0 radius-12">
                    <div className="card-header border-bottom bg-base py-16 px-24">
                      <h6 className="text-lg fw-semibold mb-0">Transmittal Information
                      </h6>
                    </div>
                    <div className="card-body p-20">
                      <table>
                        <tr>
                          <th>Transmittal ID :</th>
                          <td>{outgoingTransmittal.id}</td>
                        </tr>
                        <tr>
                          <th>Date :</th>
                          <td>{outgoingTransmittal.date}</td>
                        </tr>
                      </table>
                    </div>
                  </div>
                )
              }

              {
                currentJob && (

                  <div className="card h-100 p-0 radius-12">
                    <div className="card-header border-bottom bg-base py-16 px-24">
                      <h6 className="text-lg fw-semibold mb-0">Job Details
                      </h6>
                    </div>
                    <div className="card-body p-20">
                      <table>
                        <tr>
                          <th>Job ID :</th>
                          <td>{currentJob ? currentJob.jobId : "N/A"}</td>
                        </tr>
                        <tr>
                          <th>Job Name :</th>
                          <td>{currentJob ? currentJob.jobName : "N/A"}</td>
                        </tr>
                      </table>
                    </div>
                  </div>
                )
              }

              {
                outgoingTransmittal?.files.length > 0 ? (

                  <div className="card h-100 p-0 radius-12">
                    <div className="card-header border-bottom bg-base py-16 px-24">
                      <h6 className="text-lg fw-semibold mb-0">File List</h6>
                    </div>
                    <div className="card-body p-20">
                      <table>
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Equipment Tag	</th>
                            <th>NMR Code	</th>
                            <th>Client Code	</th>
                            <th>Client Document No.	</th>
                            <th>ZS Document No.	</th>
                            <th>Revision	</th>
                            <th>Planned Date	</th>
                            <th>Owner</th>
                            <th>File Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            outgoingTransmittal.files.map((file) => {
                              return (
                                <tr>
                                  <td>${file.description || "-"}</td>
                                  <td>${file.supportData.equipmentTag || "-"}</td>
                                  <td>${file.supportData.nmrCode || "-"}</td>
                                  <td>${file.supportData.clientCode || "-"}</td>
                                  <td>${
                                    file.supportData.clientDocumentNo || "-"
                                  }</td>
                                  <td>${file.supportData.zsDocumentNo || "-"}</td>
                                  <td>${file.revision || "-"}</td>
                                  <td>${file.supportData.plannedDate || "-"}</td>
                                  <td>${file.supportData.ownerEmail || "-"}</td>
                                  <td><a href="${
                                  file.url
                                }" target="_blank">View</a></td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) :
                  (
                    <p>No Files Transmittal available</p>
                  )
              }

            </Modal.Body>
            <Modal.Footer>
              <Button
                className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
              // onClick={createOutgoingTransmittal}
              >
                Print as PDF
              </Button>
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
    </MasterLayout>
  )
}

export default PmJobDetail