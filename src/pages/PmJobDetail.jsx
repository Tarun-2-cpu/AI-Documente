import React, { useEffect, useState } from 'react'
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import { Icon } from '@iconify/react/dist/iconify.js'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Swal from 'sweetalert2';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import "./Modal.css"

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
  const [revisionIndex, setRevisionIndex] = useState('')
  const [outgoingTransmittals, setOutgoingTransmittals] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [masterListRows, setMasterListRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fileDescription, setFileDescription] = useState("");
  const [revisions, setRevisions] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState("");
  const [file, setFile] = useState('')
  const [commentCode, setCommentCode] = useState('');
  const [actionDate, setActionDate] = useState('');
  const [additionalComment, setAdditionalComment] = useState('');
  const [modalData, setModalData] = useState('');
  const [detailModal, setDetailModal] = useState(false);


  const [departments, setDepartments] = useState({
    ENG: [],
    QAQC: [],
  });


  const [transmittalDetailModal, setTransmittalDetailModal] = useState(false);
  const [outgoingTransmittal, setOutgoingTransmittal] = useState(null);

  // const [outgoingTransmittalList, setOutgoingTransmittalList] = useState([]);

  const [outgoingTransmittalList, setOutgoingTransmittalList] = useState(() => {
    // Load transmittal list from local storage when component mounts
    const savedTransmittals = localStorage.getItem("outgoingTransmittalList");
    return savedTransmittals ? JSON.parse(savedTransmittals) : [];
  });

  // outgoing
  const [activeTab, setActiveTab] = useState("ENG");



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
      setDepartments({
        ENG: job.masterlist?.ENG || [],
        QAQC: job.masterlist?.QAQC || [],
      });
    } else {
      alert("Job not found.");
    }

    loadMasterListTable();


    if (currentJob && fileDescription) {
      const file = Object.values(currentJob.masterlist).flatMap(files =>
        files.find(f => f.fileDescription === fileDescription)
      );

      if (file && file.revisions) {
        setRevisions(file.revisions);
        setRevisionIndex(file.revisions.length - 1); // Default to latest revision
      }
    }

  }, [fileDescription, outgoingTransmittalList]);

  const handleCheckboxChange = (value) => {
    setSelectedDepartments((prev) =>
      prev.includes(value)
        ? prev.filter((department) => department !== value)
        : [...prev, value]
    );
  };


  const loadMasterListTable = () => {
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const currentJobId = localStorage.getItem("currentJobId");
    const currentJob = jobs.find((job) => job.jobId === currentJobId);
    const outgoingTransmittals =
      JSON.parse(localStorage.getItem("outgoingTransmittals")) || [];

    if (currentJob && currentJob.masterlist) {
      let serialNo = 1;
      let rows = [];

      // Iterate through each department in the masterlist
      for (const [department, files] of Object.entries(currentJob.masterlist)) {
        files.forEach((file) => {
          const lastRevisionIndex = file.revisions?.length
            ? file.revisions.length - 1
            : null; // Check if revisions exist

          const latestRevision = lastRevisionIndex !== null
            ? file.revisions[lastRevisionIndex]
            : null;

          let date;

          if (latestRevision) {
            date = latestRevision.date
          }

          // Check if latest revision is already shared in any outgoing transmittal
          const isShared = outgoingTransmittals.some((transmittal) =>
            transmittal.files.some(
              (transFile) =>
                transFile.description === file.fileDescription &&
                transFile.revision === lastRevisionIndex
            )
          );

          // Determine status based on client feedback in incomingRevisions
          let status = isShared ? "Shared" : "New";

          // Check for client feedback in incomingRevisions
          if (file.incomingRevisions && file.incomingRevisions[lastRevisionIndex]) {
            const lastIncoming = file.incomingRevisions[lastRevisionIndex];
            const commentCode =
              lastIncoming[lastIncoming.length - 1]?.commentCode;

            // Set status based on the comment code
            if (["F", "I", "R"].includes(commentCode)) {
              status = "Approved";
            } else if (["A", "B", "C", "V"].includes(commentCode)) {
              status = "Returned";
            }
          }

          // Add a row for each file with the latest revision details
          rows.push({
            serialNo: serialNo++,
            department,
            fileDescription: file.fileDescription,
            revision: `Rev ${lastRevisionIndex}`,
            lastUpdated: date,
            status,
          });
        });
      }

      // Sort rows by department and then by status
      rows.sort((a, b) => {
        if (a.department === b.department) {
          return a.status.localeCompare(b.status);
        }
        return a.department.localeCompare(b.department);
      });

      setMasterListRows(rows);
    }
  };


  const openFileDetailsModal = (department, fileDescription, revision) => {
    if (!currentJob || !currentJob.masterlist) return;

    const files = currentJob.masterlist[department];
    const file = files.find((f) => f.fileDescription === fileDescription);
    console.log("file:", file);
    console.log("file-des:", file.fileDescription);
    console.log("file-rev:", file.revisions);
    console.log("file-incom-rev:", file.incomingRevisions);
    console.log("file:", file);


    if (file) {
      setModalData({
        department,
        fileDescription: file.fileDescription,
        ownerEmail: file.ownerEmail,
        revisions: file.revisions || [],
        incomingRevisions: file.incomingRevisions || [],
      });
      setDetailModal(true);
    }
  };



  const getStatusClass = (status) => {
    switch (status) {
      case "New":
        return "status-new";
      case "Shared":
        return "status-shared";
      case "Approved":
        return "status-approved";
      case "Returned":
        return "status-returned";
      default:
        return "status-default";
    }
  };

  const openIncomingModal = (fileDesc) => {
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const currentJobId = localStorage.getItem("currentJobId");
    const currentJob = jobs.find((job) => job.jobId === currentJobId);

    if (!currentJob || !currentJob.masterlist) return;

    let file = null;
    let latestRevisionIndex = 0;

    for (const files of Object.values(currentJob.masterlist)) {
      file = files.find((f) => f.fileDescription === fileDesc);
      if (file) {
        latestRevisionIndex = file.revisions?.length
          ? file.revisions.length - 1
          : 0;
        break;
      }
    }

    if (file) {
      setFileDescription(fileDesc);
      setRevisions(file.revisions || []);
      setSelectedRevision(latestRevisionIndex.toString());
      setShowModal(true); // Show the modal
    }
  };

  const handleRevisionChange = (e) => {
    setSelectedRevision(e.target.value);
  };

  const closeModal = () => {
    setShowModal(false);
    setFileDescription("");
    setRevisions([]);
    setSelectedRevision("");
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
    Swal.fire('Sent', 'Masterlist request saved successfully.', 'success');
    setMasterList(false);
    setSelectedDepartments([]);
    setDate("");
  }


  // Handle "Select All" checkbox
  const toggleSelectAllFiles = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);

    setSelectedFiles((prev) => {
      const updated = {};
      Object.keys(departments).forEach((department) => {
        updated[department] = {};
        departments[department].forEach((_, index) => {
          updated[department][index] = isChecked; // Select/deselect all files
        });
      });
      return updated;
    });
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


  function submitIncomingFile() {
    if (!file) {
      alert('Please upload a file.');
      return;
    }

    let fileLink = ""

    if (file instanceof Blob || file instanceof File) {
      fileLink = URL.createObjectURL(file);
    } else {
      console.error("Invalid file object:", file);
      alert("Invalid file format. Please re-upload the file.");
      return;
    }

    const fileDetails = {
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      date: new Date().toLocaleDateString(),
      hash: `${file.name}_${Date.now()}`,
      fileLink: fileLink,
      commentCode,
      actionDate,
      additionalComment,
    };

    const updatedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const currentJobId = localStorage.getItem('currentJobId');
    const job = updatedJobs.find(job => job.jobId === currentJobId);

    if (job) {
      for (const files of Object.values(job.masterlist)) {
        const targetFile = files.find(f => f.fileDescription === fileDescription);
        if (targetFile) {
          if (!targetFile.incomingRevisions) targetFile.incomingRevisions = [];
          targetFile.incomingRevisions[revisionIndex] = targetFile.incomingRevisions[revisionIndex] || [];
          targetFile.incomingRevisions[revisionIndex].push(fileDetails);
          break;
        }
      }
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    }

    closeModal();
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


  // Open the transmittal detail modal and populate with data
  // outgoing transmittal card click
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
                            <th>Company Doc No.</th>
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


  // outgoing modal

  const handleFileSelection = (department, index) => {
    setSelectedFiles((prev) => {
      const updated = { ...prev };
      if (!updated[department]) updated[department] = {};
      updated[department][index] = !updated[department][index];

      // Update "Select All" state
      const allSelected = Object.keys(departments).every((dept) =>
        departments[dept].every((_, idx) => updated[dept]?.[idx])
      );
      setSelectAll(allSelected);

      return updated;
    });
  };

  const openOutgoingTransmittalModal = () => setOutTransmittal(true);
  const closeOutgoingTransmittalModal = () => setOutTransmittal(false);


  // const createOutgoingTransmittal = () => {
  //   const newTransmittalId = `COM-TRAN-OUTGOING-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  //   const files = Object.entries(selectedFiles).flatMap(([department, files]) =>
  //     Object.entries(files)
  //       .filter(([_, isSelected]) => isSelected)
  //       .map(([index]) => ({
  //         ...departments[department][index],
  //         department,
  //       }))
  //   );

  //   const newTransmittal = {
  //     id: newTransmittalId,
  //     date: new Date().toLocaleString(),
  //     files,
  //   };

  //   // Save new transmittal (assuming a saveTransmittal function exists)
  //   saveTransmittal(newTransmittal);
  //   setOutgoingTransmittal(newTransmittal);
  //   closeOutgoingTransmittalModal();
  //   setOutgoingTransmittalList([...outgoingTransmittalList, newTransmittal])
  // };



  const createOutgoingTransmittal = () => {
    const newTransmittalId = `COM-TRAN-OUTGOING-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
    const files = Object.entries(selectedFiles).flatMap(([department, files]) =>
      Object.entries(files)
        .filter(([_, isSelected]) => isSelected)
        .map(([index]) => ({
          ...departments[department][index],
          department,
        }))
    );
  
    const newTransmittal = {
      id: newTransmittalId,
      date: new Date().toLocaleString(),
      files,
    };
  
    // Update the transmittal list
    const updatedTransmittalList = [...outgoingTransmittalList, newTransmittal];
  
    // Save in local storage
    localStorage.setItem("outgoingTransmittalList", JSON.stringify(updatedTransmittalList));
  
    // Update state
    setOutgoingTransmittalList(updatedTransmittalList);
    setOutgoingTransmittal(newTransmittal);
    closeOutgoingTransmittalModal();
  };

  useEffect(() => {
    const savedTransmittals = localStorage.getItem("outgoingTransmittalList");
    if (savedTransmittals) {
      setOutgoingTransmittalList(JSON.parse(savedTransmittals));
    }
  }, []);

  console.log(outgoingTransmittal);


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
                              <th><h6>Client</h6></th>
                              <td></td>
                              <td><h6>: {currentJob?.client || "N/A"}</h6></td>
                            </tr>
                            <tr>
                              <th><h6>End User</h6></th>
                              <td></td>
                              <td><h6>: {currentJob?.endUser || "N/A"}</h6></td>
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
                      <tbody className="d-flex align-items-center justify-content-between flex-wrap">
                        {[
                          ["PM", "Project Management"],
                          ["ENG", "Engineering"],
                          ["MOC", "Material Ordering & Control"],
                          ["QAQC", "QA/QC"],
                          ["MP", "Material Planning"],
                          ["MFG", "Manufacturing"],
                        ].map(([value, label], index) => (
                          <tr key={index} style={{ width: "45%", margin: "10px" }}>
                            <td colSpan={2}>
                              <label className="d-flex align-items-center  justify-content-between mx-3 gap-2">
                                <input
                                  type="checkbox"
                                  className="department-checkbox form-check-input me-2 "
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

                    <div className="mb-3 mt-5">
                      <div className="">
                        <label className="" id="">Due Date</label>
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
          <h6 className="text-lg fw-semibold mb-0">Client Documents</h6>
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
            scrollable
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
                              <td className="pl-5">{transmittal.notifiedDepartments.join(' / ')}</td>
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
                                          <Link to={doc.fileLink} target="_blank" rel="noopener noreferrer">
                                            View
                                          </Link>
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
                  <th style={{ width: '10%', textAlign: "center" }}>Serial.NO.</th>
                  <th style={{ width: '15%', textAlign: "center" }}>Department</th>
                  <th style={{ width: '14%', textAlign: "center" }}>Description</th>
                  <th style={{ width: '12%', textAlign: "center" }}>Current Revision</th>
                  <th style={{ width: '15%', textAlign: "center" }}>Last Updated</th>
                  <th style={{ width: '10%', textAlign: "center" }}>Status</th>
                  <th style={{ width: '14%', textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody id="fileMasterListBody">

                {masterListRows.length > 0 ? (
                  masterListRows.map((row, index) => (
                    <tr key={index} className={getStatusClass(row.status)}>
                      <td className="text-center align-middle" >{row.serialNo}</td>
                      <td className="text-center align-middle" >{row.department}</td>
                      <td className="text-center align-middle" >{row.fileDescription}</td>
                      <td className="text-center align-middle" >{row.revision}</td>
                      <td className="text-center align-middle" >{row.lastUpdated}</td>
                      <td className="text-center align-middle" >{row.status}</td>
                      <td className="text-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                        <Button
                          className="action-btn"
                          variant="outline-secondary"
                          style={{ flex: '1 1 auto', width: '80%', maxWidth: '120px' }}
                          onClick={() => openFileDetailsModal(row.department, row.fileDescription, row.revision)}
                        >
                          View
                        </Button>
                        <Button
                          className="action-btn px-2"
                          variant="outline-secondary"
                          onClick={() => openIncomingModal(row.fileDescription)}
                          style={{ flex: '1 1 auto', width: '80%', maxWidth: '120px' }}
                        >
                          Respond
                        </Button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No data available.
                    </td>
                  </tr>
                )}

              </tbody>
            </Table>
          </div>

          {/*Files Details*/}
          {modalData && (

            <Modal
              show={detailModal}
              onHide={() => setDetailModal(false)}
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
                    <tbody>
                      <tr>
                        <th>Deparment : </th>
                        <td>{modalData.department}</td>
                      </tr>
                      <tr>
                        <th>File Description:</th>
                        <td>{modalData.fileDescription}</td>
                      </tr>
                      <tr>
                        <th>Owner:</th>
                        <td>{modalData.ownerEmail}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <div className="card h-100 p-0 radius-12 mt-24">
                  <div className="card-body p-24">

                    <Table bordered id="revision-history-table">
                      <thead>
                        <tr>
                          <th className="text-center" style={{ width: "10.5%" }}>Rev No</th>
                          <th className="text-center" style={{ width: "12.5%" }}>Recieved File</th>
                          <th className="text-center" style={{ width: "12.5%" }}>Recieved Date</th>
                          <th className="text-center" style={{ width: "14.5%" }}>Added Comment Code</th>
                          <th className="text-center" style={{ width: "12.5%" }}>Added Comment</th>
                          <th className="text-center" style={{ width: "12.5%" }}>Return File</th>
                          <th className="text-center" style={{ width: "12.5%" }}>Return Date</th>
                          <th className="text-center" style={{ width: "12.5%" }}>File Status</th>
                        </tr>
                      </thead>
                      <tbody id="">
                        {modalData.revisions.map((revision, index) => {
                          const incomingFeedback = modalData.incomingRevisions[index];
                          const lastFeedback = incomingFeedback?.[incomingFeedback.length - 1] || {};
                          const status = ["F", "I", "R"].includes(lastFeedback.commentCode)
                            ? "Approved"
                            : ["A", "B", "C", "V"].includes(lastFeedback.commentCode)
                              ? "Returned"
                              : "New";

                          return (
                            <tr key={index} className={getStatusClass(status)}>
                              <td className="text-center align-middle">Rev {index}</td>
                              <td className="text-center align-middle">
                                <Link to={revision.fileLink} target="_blank" rel="noopener noreferrer" title="Download">
                                  {revision.name}
                                </Link>
                              </td>
                              <td className="text-center align-middle">{revision.date}</td>
                              <td className="text-center align-middle">{lastFeedback.commentCode || "N/A"}</td>
                              <td className="text-center align-middle">{lastFeedback.additionalComment || "N/A"}</td>
                              <td className="text-center align-middle">
                                {lastFeedback.hash ? (
                                  <Link to={lastFeedback.fileLink} target="_blank" rel="noopener noreferrer" title="Download">
                                    {lastFeedback.name}
                                  </Link>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="text-center align-middle">{lastFeedback.date || "N/A"}</td>
                              <td className="text-center align-middle">{status}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                  onClick={() => setDetailModal(false)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

          )}

          <Modal
            show={showModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter">
                Incoming File Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>

              <div className="mb-3">
                <div className="">
                  <label className="" id="">Revision:</label>
                </div>
                <select type="text"
                  className="form-control"
                  value={revisionIndex}
                  onChange={(e) => setRevisionIndex(e.target.value)}
                >
                  {revisions.map((_, index) => (
                    <option key={index} value={index}>
                      Rev {index}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <div className="">
                  <label className="" id="">Comment Code:</label>
                </div>
                <select type="text"
                  className="form-control"
                  value={commentCode}
                  onChange={(e) => setCommentCode(e.target.value)}
                >
                  <option>A-Rejected</option>
                  <option>B-Comment as Noted</option>
                  <option>C-Reviewed as Comments</option>
                  <option>F-Reviewed without Comments</option>
                  <option>I-For Information</option>
                  <option>R-Reviewed as built</option>
                  <option>V-Void</option>
                </select>
              </div>

              <div className="mb-3">
                <div className="">
                  <label className="" id="">Action Date:</label>
                </div>
                <input type="date"
                  className="form-control mb-3"
                  value={actionDate}
                  onChange={(e) => setActionDate(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <div className="">
                  <label className="" id="">Additional Comment:</label>
                </div>
                <textarea className="form-control"
                  id="description"
                  value={additionalComment}
                  onChange={(e) => setAdditionalComment(e.target.value)}
                  aria-label="With textarea" placeholder="Job Description"></textarea>
              </div>

              <div className="mb-3">
                <div className="">
                  <label className="">Upload Recieved File</label>
                </div>
                <div className="">
                  <input type="file" className=
                    "form-control"
                    onChange={(e) => {
                      setFile(e.target.files[0])
                      console.log(e.target.files[0])
                    }}
                    id="inputGroupFile01" />
                </div>
              </div>

            </Modal.Body>
            <Modal.Footer>
              <Button
                className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
                onClick={() => submitIncomingFile()}
              >
                Submit
              </Button>
              <Button
                className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                onClick={closeModal}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
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
              outgoingTransmittalList?.length > 0 ? (

                outgoingTransmittalList.map((t) => (
                  <div key={t.id} className="transmittal-card d-flex justify-content-around align-items-center border border-secondary my-3 py-3"
                    onClick={() => {
                      setOutgoingTransmittal(t);
                      setTransmittalDetailModal(true);
                    }}
                  >
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
                {Object.keys(departments).map((dept) => (
                  <button
                    key={dept}
                    className={`tab-button btn rounded-pill ${activeTab === dept ? "btn-primary" : "btn-outline-secondary"
                      }`}
                    onClick={() => setActiveTab(dept)}
                  >
                    {dept}
                  </button>
                ))}
              </div>
              {Object.entries(departments).map(([dept, files]) => (
                <div
                  id={dept}
                  className="tab-content"
                  style={{ display: activeTab === dept ? "block" : "none" }}
                  key={dept}
                >
                  <p className="mt-5">
                    Total Selected Files:{" "}
                    {Object.values(selectedFiles[dept] || {}).filter(Boolean).length}
                  </p>
                  <Table bordered>
                    <thead>
                      <tr>
                        <th className="d-flex align-items-center justify-content-center text-center align-self-center m-auto">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="selectAllFiles"
                            checked={selectAll}
                            onChange={toggleSelectAllFiles}
                          />
                        </th>
                        <th className="text-center">File Description</th>
                        <th className="text-center">Revision</th>
                        <th className="text-center">Document No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file, index) => (
                        <tr key={index}>
                          <td className="d-flex align-items-center justify-content-center text-center align-self-center m-auto">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedFiles[dept]?.[index] || false}
                              onChange={() => handleFileSelection(dept, index)}
                            />
                          </td>
                          <td className="text-center">{file.fileDescription}</td>
                          <td className="text-center">{file.revisions?.length || 0}</td>
                          <td className="text-center">{file.zsDocumentNo || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
              <p className="mt-5">
                Total Files Selected Across Departments:{" "}
                {Object.values(selectedFiles).reduce(
                  (sum, files) =>
                    sum + Object.values(files || {}).filter(Boolean).length,
                  0
                )}
              </p>
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


          <Modal
            show={transmittalDetailModal}
            size="xl"
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
                      <div style={{width: "100%" }}>
                        <Table style={{width:"100%", tableLayout:"fixed"}}>
                          <tbody>
                            <tr>
                              <th>Transmittal ID :</th>
                              <td>{outgoingTransmittal.id}</td>
                            </tr>
                            <tr>
                              <th>Date :</th>
                              <td>{outgoingTransmittal.date}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
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
                      <Table>
                        <tbody>
                          <tr>
                            <th>Job ID :</th>
                            <td>{currentJob ? currentJob.jobId : "N/A"}</td>
                          </tr>
                          <tr>
                            <th>Job Name :</th>
                            <td>{currentJob ? currentJob.jobName : "N/A"}</td>
                          </tr>
                        </tbody>
                      </Table>
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
                    <div className="card-body p-20 table-responsive">
                      <div style={{width: "100%" }}>
                        <Table bordered style={{width:"100%", tableLayout:"fixed"}}>
                          <thead>
                            <tr>
                              <th class="text-center align-middle" style={{ width: "10%" }}>Desc.</th>
                              <th class="text-center align-middle" style={{ width: "10%" }}>Equip Tag</th>
                              <th class="text-center align-middle" style={{ width: "10%" }}>NMR</th>
                              <th class="text-center align-middle"  style={{ width: "10%" }}>Client Code</th>
                              <th class="text-center align-middle table-cell" style={{ width: "10%" }}>Client Doc. No.</th>
                              <th class="text-center align-middle table-cell"  style={{ width: "10%" }}>Com. Doc No.</th>
                              <th class="text-center align-middle"  style={{ width: "10%" }}>Revision</th>
                              <th class="text-center align-middle"  style={{ width: "10%" }}>Planned</th>
                              <th class="text-center align-middle"  style={{ width: "10%" }}>Owner</th>
                              <th class="text-center align-middle"  style={{ width: "10%" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {outgoingTransmittal.files.map((file) => {
                                const lastRevision = file.revisions?.[file.revisions.length - 1];
                              return (
                                <tr>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>{file.fileDescription || "-"}</td>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>{file.equipmentTag || ""}</td>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>{file.nmrCode || ""}</td>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>{file.clientCode || "-"}</td>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>{file.clientDocumentNo || "-"}</td>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>{file.zsDocumentNo || ""}</td>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>{file.revisions.length || ""}</td>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>{file.plannedDate || ""}</td>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>{file.ownerEmail || ""}</td>
                                  <td class="text-center align-middle table-cell" style={{ width: "10%" }}>
                                    <Link
                                      to={lastRevision?.fileLink || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Download"
                                    >
                                      View
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      {/* <Table>
                        <thead>
                          <tr>
                            <th style={{ width: "10%" }}>Description</th>
                            <th style={{ width: "10%" }} >Equipment Tag	</th>
                            <th style={{ width: "10%" }} >NMR Code	</th>
                            <th style={{ width: "10%" }} >Client Code	</th>
                            <th style={{ width: "10%" }} >Client Document No.	</th>
                            <th style={{ width: "10%" }} >Company Doc No.</th>
                            <th style={{ width: "10%" }} >Revision	</th>
                            <th style={{ width: "10%" }} >Planned Date	</th>
                            <th style={{ width: "10%" }} >Owner</th>
                            <th style={{ width: "10%" }} >File Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            outgoingTransmittal.files.map((file) => {
                              return (
                                <tr>
                                  <td style={{ width: "10%" }}>{file.fileDescription || "-"}</td>
                                  <td style={{ width: "10%" }}>{file.equipmentTag || ""}</td>
                                  <td style={{ width: "10%" }}>{file.nmrCode || ""}</td>
                                  <td style={{ width: "10%" }}>{file.clientCode || "-"}</td>
                                  <td style={{ width: "10%" }}>{
                                    file.clientDocumentNo || "-"
                                  }</td>
                                  <td style={{ width: "10%" }}>{file.zsDocumentNo || ""}</td>
                                  <td style={{ width: "10%" }}>{file.revision || ""}</td>
                                  <td style={{ width: "10%" }}>{file.plannedDate || ""}</td>
                                  <td style={{ width: "10%" }}>{file.ownerEmail || ""}</td>
                                  <td style={{ width: "10%" }}>
                                    <Link
                                        to={file.revisions?.[file.revision]?.fileLink || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Download"
                                      >
                                        View
                                      </Link>
                                  </td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </Table> */}
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
    </MasterLayout >
  )
}

export default PmJobDetail