import React, { useState, useEffect } from 'react'
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import { Icon } from '@iconify/react/dist/iconify.js'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import ModalDialog from 'react-bootstrap/ModalDialog'
import { Link } from 'react-router-dom';
import * as pdfjsLib from "pdfjs-dist/webpack";
import { FaTimes } from "react-icons/fa";

function EnggJobDetail() {

  const [currentJob, setCurrentJob] = useState(null);
  const [currentJobID, setCurrentJobID] = useState(null);
  const [transmittal, setTransmittal] = useState(null)
  const [totalJobs, setTotalJobs] = useState([]);
  const [rows, setRows] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [transmittals, setTransmittals] = useState([]);

  const [statistics, setStatistics] = useState({
    approved: 0,
    shared: 0,
    returned: 0,
    new: 0,
    transmittalCount: 0,
  });


  const [engRequests, setEngRequests] = useState([]);
  const [engMasterlistModal, setEngMasterlistModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);


  const [masterListRows, setMasterListRows] = useState([]);
  const [outgoingTransmittals, setOutgoingTransmittals] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

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
    const outgoingTrans = JSON.parse(localStorage.getItem("outgoingTransmittals")) || [];
    setOutgoingTransmittals(outgoingTrans);

    loadJobDetails();
    setTotalJobs(jobs);

    if (job) {
      setCurrentJob(job);
      setCurrentJobID(job.id)
      setTransmittals(job.transmittals || []);
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

    if (job && job.masterlist && job.masterlist.ENG) {
      setIsUpdate(true);
      // Populate the rows with existing data
      setRows(job.masterlist.ENG);
    } else {
      setIsUpdate(false);
      setRows([])
    }

    loadMasterListRows(job, outgoingTrans);

  }, [engMasterlistModal, detailModal, revisionModalShow])


  console.log("eng master list", engRequests);
  console.log("rows", rows);

  console.log("masterlist", currentJob?.masterlist);
  console.log("master list state", masterlist);

  console.log("transmittal", transmittal);

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

  // const addRow = () => {
  //   setRows([
  //     ...rows,
  //     {
  //       fileDescription: "",
  //       equipmentTag: "",
  //       nmrCode: "",
  //       clientCode: "",
  //       clientDocumentNo: "",
  //       zsDocumentNo: "",
  //       plannedDate: "",
  //       ownerEmail: "",
  //     },
  //   ]);
  // };


  const addRow = () => {
    const newRow = {
      fileDescription: "",
      equipmentTag: "",
      nmrCode: "",
      clientCode: "",
      clientDocumentNo: "",
      zsDocumentNo: "",
      plannedDate: "",
      ownerEmail: "",
    };

    const updatedRows = [...rows, newRow];
    setRows(updatedRows);

    // Update the masterlist in localStorage
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const jobId = localStorage.getItem("currentJobId");
    const jobIndex = jobs.findIndex((j) => j.jobId === jobId);

    if (jobIndex !== -1) {
      const currentJob = jobs[jobIndex];
      currentJob.masterlist = currentJob.masterlist || {};
      currentJob.masterlist.ENG = updatedRows; // Update the ENG masterlist
      jobs[jobIndex] = currentJob;

      // Save back to localStorage
      localStorage.setItem("jobs", JSON.stringify(jobs));
    }
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

  // const deleteRow = (index) => {
  //   const updatedRows = rows.filter((_, i) => i !== index);
  //   setRows(updatedRows);

  //   // Update the masterlist in localStorage
  //   const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  //   const jobId = localStorage.getItem("currentJobId");
  //   const jobIndex = jobs.findIndex((j) => j.jobId === jobId);

  //   if (jobIndex !== -1) {
  //     const currentJob = jobs[jobIndex];
  //     currentJob.masterlist = currentJob.masterlist || {};
  //     currentJob.masterlist.ENG = updatedRows; // Update the ENG masterlist
  //     jobs[jobIndex] = currentJob;

  //     // Save back to localStorage
  //     localStorage.setItem("jobs", JSON.stringify(jobs));
  //   }
  // };


  const handleSave = () => {
    // Retrieve the existing job data
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const jobId = localStorage.getItem("currentJobId");
    const jobIndex = jobs.findIndex((j) => j.jobId === jobId);

    if (jobIndex === -1) {
      alert("Job not found!");
      return;
    }

    // Update the masterlist for the Engineering department
    const currentJob = jobs[jobIndex];
    currentJob.masterlist = currentJob.masterlist || {};
    currentJob.masterlist.ENG = rows;

    // Update localStorage
    jobs[jobIndex] = currentJob;
    localStorage.setItem("jobs", JSON.stringify(jobs));

    // Close the modal
    setEngMasterlistModal(false);
  };


  // const handleSave = () => {

  //   const masterlistData = {
  //     fileDescription: fileDesc,
  //     equipmentTag: equipTag,
  //     nmrCode: nmr,
  //     clientCode: clientCode,
  //     clientDocumentNo: clientDocNo,
  //     zsDocumentNo: zsDocNo,
  //     plannedDate: pDate,
  //     ownerEmail: owner,
  //   }

  //   // Retrieve the existing job data
  //   const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  //   const jobId = localStorage.getItem('currentJobId');
  //   const jobIndex = jobs.findIndex(j => j.jobId === jobId);

  //   if (jobIndex === -1) {
  //     alert("Job not found!");
  //     return;
  //   }

  //   // Add or update the masterlist for the Engineering department
  //   const currentJob = jobs[jobIndex];
  //   currentJob.masterlist = currentJob.masterlist || {};
  //   currentJob.masterlist.ENG = Array.isArray(currentJob.masterlist.ENG) ? currentJob.masterlist.ENG : [];

  //   // Append the new entry to the masterlist array
  //   currentJob.masterlist.ENG.push(masterlistData);

  //   // Update the localStorage
  //   jobs[jobIndex] = currentJob;
  //   localStorage.setItem('jobs', JSON.stringify(jobs));

  //   // Close the modal
  //   closeMasterlistModal();
  //   setEngMasterlistModal(false);
  // };

  //   // Function to close the modal
  function closeMasterlistModal() {
    setEngMasterlistModal(false);
  }

  function uploadFile(index) {
    const fileEntry = currentJob.masterlist.ENG[index];

    if (!fileEntry.revisions) {
      fileEntry.revisions = [];
    }
    setRevisions(fileEntry.revisions || []);
    setRevisionModalShow(true);
    setCurrentFileIndex(index);
  }

  // const handleFileUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const newRevision = {
  //     hash: `hash_${file.name}_${Date.now()}`, // Placeholder for hash generation
  //     date: new Date().toLocaleDateString(),
  //     pageCount: estimatePageCount(file), // Replace with your logic
  //     size: `${(file.size / 1024).toFixed(2)} KB`,
  //   };

  //   const updatedRevisions = [...revisions, newRevision];
  //   setRevisions(updatedRevisions);

  //   const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  //   const jobIndex = jobs.findIndex((job) => job.jobId === currentJob.jobId);


  //   if (jobIndex !== -1) {
  //     const updatedJobs = [...jobs];
  //     updatedJobs[jobIndex].masterlist.ENG[currentFileIndex].revisions = updatedRevisions;

  //     // Save the updated jobs array back to localStorage
  //     localStorage.setItem('jobs', JSON.stringify(updatedJobs));
  //   } else {
  //     console.error('Job not found in local storage');
  //   }
  // };


  const handleFileUpload = (event) => {
    let file = event.target.files[0];
    if (!file) return;

    getPDFPageCount(file, (pageCount) => {

      const newRevision = {
        id: Date.now(),
        name: file.name,
        hash: `${file.name}_${Date.now()}`,
        fileLink: URL.createObjectURL(file),
        date: new Date().toLocaleDateString(),
        pageCount: pageCount,
        size: `${(file.size / 1024).toFixed(2)} KB`,
      };

      setRevisions((prevRevisions) => {
        const updatedRevisions = [...prevRevisions, newRevision];
        updateLocalStorage(updatedRevisions);
        return updatedRevisions;
      });
    });
  };

  // Function to update local storage
  const updateLocalStorage = (updatedRevisions) => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const jobIndex = jobs.findIndex((job) => job.jobId === currentJob.jobId);

    if (jobIndex !== -1) {
      const updatedJobs = [...jobs];
      updatedJobs[jobIndex].masterlist.ENG[currentFileIndex].revisions = updatedRevisions;
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    }
  };

  // Function to delete a revision
  const handleDeleteRevision = (id) => {
    setRevisions((previousRevision) => {
      const updatedRevisions = previousRevision.filter(revision => revision.id !== id);
      updateLocalStorage(updatedRevisions);
      return updatedRevisions;
    }
    )
  };

  const getPDFPageCount = (file, callback) => {
    const reader = new FileReader();
    reader.onload = function () {
      const typedArray = new Uint8Array(reader.result);
      pdfjsLib.getDocument(typedArray).promise
        .then((pdf) => {
          callback(pdf.numPages);
        })
        .catch((error) => {
          console.error("Error getting PDF page count:", error);
          callback("Unknown Pages");
        });
    };
    reader.readAsArrayBuffer(file);
  };


  const closeModal = () => {
    setRevisionModalShow(false);
    setCurrentFileIndex(null);
    setRevisions([]);
  };



  const loadMasterListRows = (job, outgoingTrans) => {
    let rows = [];
    let serialNo = 1;

    if (job && job.masterlist && typeof job.masterlist === "object") {
      for (const [department, files] of Object.entries(job.masterlist)) {
        files.forEach((file, index) => {
          const lastRevisionIndex = file.revisions?.length - 1 || 0;
          const latestRevision = file.revisions?.[lastRevisionIndex] || {};

          // Check if the file is shared
          const isShared = outgoingTrans.some((transmittal) =>
            transmittal.files.some(
              (transFile) =>
                transFile.description === file.fileDescription &&
                transFile.revision === lastRevisionIndex
            )
          );

          // Determine file status
          let status = isShared ? "Shared" : "New";

          if (file.incomingRevisions?.[lastRevisionIndex]) {
            const lastIncoming = file.incomingRevisions[lastRevisionIndex];
            const commentCode = lastIncoming[lastIncoming.length - 1]?.commentCode || "";

            if (["F", "I", "R"].includes(commentCode)) {
              status = "Approved";
            } else if (["A", "B", "C", "V"].includes(commentCode)) {
              status = "Returned";
            }
          }

          rows.push({
            serialNo: serialNo++,
            department,
            fileDescription: file.fileDescription,
            revision: `Rev ${lastRevisionIndex}`,
            lastUpdated: latestRevision.date || "N/A",
            status,
            owner: file.ownerEmail,
            index,
          });
        });
      }
    }
    setMasterListRows(rows);
    console.log(rows);
  };
  console.log(masterListRows);



  const openFileDetailsModal = (department, fileDescription, revision) => {
    if (!currentJob || !currentJob.masterlist) return;

    const files = currentJob.masterlist[department];
    const file = files.find((f) => f.fileDescription === fileDescription);
    console.log("fil  e:", file);
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
      case 'Approved':
        return 'bg-green-500';
      case 'Returned':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const calculateFileStatistics = () => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const outgoingTransmittals = JSON.parse(localStorage.getItem('outgoingTransmittals')) || [];

    let stats = {
      approved: 0,
      shared: 0,
      returned: 0,
      new: 0,
    };

    jobs.forEach((job) => {
      if (job.masterlist) {
        for (const [department, files] of Object.entries(job.masterlist)) {
          files.forEach((file) => {
            const revisions = file.revisions || []; // Ensure `revisions` is an array
            const lastRevisionIndex = revisions.length > 0 ? revisions.length - 1 : -1; // Get the index safely

            let status = "New"; // Default status

            // Check if the latest revision exists and has been shared
            if (lastRevisionIndex >= 0) {
              const isShared = outgoingTransmittals.some((transmittal) =>
                transmittal.files.some(
                  (transFile) =>
                    transFile.description === file.fileDescription &&
                    transFile.revision === lastRevisionIndex
                )
              );

              if (isShared) {
                status = "Shared";
              }
            }

            // Check for client feedback in incomingRevisions
            const incomingRevisions = file.incomingRevisions || [];
            if (lastRevisionIndex >= 0 && incomingRevisions[lastRevisionIndex]) {
              const lastIncoming = incomingRevisions[lastRevisionIndex];
              const commentCode = lastIncoming[lastIncoming.length - 1]?.commentCode;

              if (["F", "I", "R"].includes(commentCode)) {
                status = "Approved";
              } else if (["A", "B", "C", "V"].includes(commentCode)) {
                status = "Returned";
              }
            }

            // Increment the relevant count
            if (status === "Approved") stats.approved++;
            else if (status === "Returned") stats.returned++;
            else if (status === "Shared") stats.shared++;
            else stats.new++;
          });
        }
      }
    });

    return stats;
  };

  const updateStats = () => {
    const stats = calculateFileStatistics();
    const outgoingTransmittals = JSON.parse(localStorage.getItem('outgoingTransmittals')) || [];
    const transmittalsCount = outgoingTransmittals.length;

    setStatistics({
      ...stats,
      transmittalCount: transmittalsCount,
    });
  }


  useEffect(() => {
    // Update stats when the component is mounted
    updateStats();

    // Optionally, add a listener for changes to localStorage (if applicable)
    const handleStorageChange = () => {
      updateStats();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);


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
                      <h6 className="text-center mt-3"> {statistics.approved}</h6>
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
                      <h6 className="text-center my-2">{statistics.shared}</h6>
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
                      <h6 className="text-center my-2"> {statistics.returned}</h6>
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
                      <h6 className="text-center my-2">{statistics.new}</h6>
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
                      <h6 className="text-center my-2">{statistics.transmittalCount}</h6>
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
                              <td style={{ paddingLeft: "20px" }}> <h6> : {currentJob ? currentJob.jobId : "N/A"} </h6></td>
                            </tr>
                            <tr>
                              <th><h6>Job Name</h6></th>
                              <td style={{ paddingLeft: "20px" }}> <h6> : {currentJob ? currentJob.jobName : "N/A"} </h6></td>
                            </tr>
                            <tr>
                              <th><h6>Description</h6></th>
                              <td style={{ paddingLeft: "20px" }}> <h6> : {currentJob ? currentJob.description : "N/A"} </h6> </td>
                            </tr>
                            <tr>
                              <th><h6>Client</h6></th>
                              <td style={{ paddingLeft: "20px" }}> <h6> : {currentJob ? currentJob.client : "N/A"}  </h6></td>
                            </tr>
                            <tr>
                              <th><h6>End User</h6></th>
                              <td style={{ paddingLeft: "20px" }}> <h6> : {currentJob ? currentJob.endUser : "N/A"}  </h6></td>
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
                    transmittals && transmittals.length > 0 ? (
                      <Table bordered id="" className="">
                        <thead>
                          <tr>
                            <th className="text-center">Transmittal ID</th>
                            <th className="text-center">Document</th>
                            <th className="text-center">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transmittals
                            .filter(
                              (transmittal) =>
                                transmittal.notifiedDepartments &&
                                transmittal.notifiedDepartments.includes("ENG")
                            )
                            .map((transmittal, index) => (
                              <tr key={index}>
                                <td className="text-center" onClick={() => viewTransmittalDetails(transmittal.date)}>
                                  {transmittal.id}
                                </td>
                                <td className="text-center" onClick={() => viewTransmittalDetails(transmittal.date)}>
                                  {transmittal.date}
                                </td>
                                <td className="text-center" onClick={() => viewTransmittalDetails(transmittal.date)}>
                                  {transmittal.summary}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    ) : (
                      <tr>
                        <td colSpan="4">No Transmittals Found</td>
                      </tr>
                    )
                  }

                  {/*Transmittal Detail*/}
                  <Modal
                    show={transmittalDetailModal}
                    centered={true}
                    scrollable={true}
                    size="lg"
                    id="revisionModal"
                  >
                    <Modal.Header closeButton>
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
                                <tr>
                                  <th>Transmittal Id:</th>
                                  <td>{transmittal.id}</td>
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
                              <tbody>
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
                              </tbody>
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
                                <th className="text-center" style={{ width: "14.5%" }}>File Name</th>
                                <th className="text-center" style={{ width: "12.5%" }}>File Type</th>
                                <th className="text-center" style={{ width: "12.5%" }}>Size</th>
                                <th className="text-center" style={{ width: "12.5%" }}>Modified</th>
                                <th className="text-center" style={{ width: "12.5%" }}>Page</th>
                                <th className="text-center" style={{ width: "12.5%" }}>Revision</th>
                                <th className="text-center" style={{ width: "12.5%" }}>Actions</th>
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
                                        <td className="text-center" >{doc.fileName}</td>
                                        <td className="text-center" >{doc.fileType.toUpperCase()}</td>
                                        <td className="text-center" >{doc.fileSize}</td>
                                        <td className="text-center" >{doc.lastModified}</td>
                                        <td className="text-center" >{doc.pageCount}</td>
                                        <td className="text-center" >{doc.revision}</td>
                                        <td className="text-center" >
                                          <Link to={doc.fileLink} target="_blank">View</Link>
                                          <Link to={doc.fileLink} download={doc.fileName} style={{ marginLeft: "12px" }} target="_blank" rel="noopener noreferrer" title="Download">
                                            <i className="fas fa-download"></i>
                                          </Link>
                                        </td>
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
                        <th className="text-center" style={{ width: "12.5%" }}>Serial No.</th>
                        <th className="text-center" style={{ width: "12.5%" }} >Department</th>
                        <th className="text-center" style={{ width: "12.5%" }} >Description</th>
                        <th className="text-center" style={{ width: "12.5%" }} >Revision</th>
                        <th className="text-center" style={{ width: "12.5%" }} >Last Updated</th>
                        <th className="text-center" style={{ width: "12.5%" }} >Status</th>
                        <th className="text-center" style={{ width: "12.5%" }} >Owner</th>
                        <th className="text-center" style={{ width: "12.5%" }} >Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masterListRows.map((row, index) => (
                        <tr
                          key={index}
                          // className={`text-center ${getStatusClass(row.status)}`}
                          style={{backgroundColor:getStatusClass(row.status)}}
                        >
                          <td className="text-center" onClick={() => openFileDetailsModal(row.department, row.fileDescription, row.revision)}>{row.serialNo}</td>
                          <td className="text-center" onClick={() => openFileDetailsModal(row.department, row.fileDescription, row.revision)}>{row.department}</td>
                          <td className="text-center" onClick={() => openFileDetailsModal(row.department, row.fileDescription, row.revision)}>{row.fileDescription}</td>
                          <td className="text-center" onClick={() => openFileDetailsModal(row.department, row.fileDescription, row.revision)}>{row.revision}</td>
                          <td className="text-center" onClick={() => openFileDetailsModal(row.department, row.fileDescription, row.revision)}>{row.lastUpdated}</td>
                          <td className="text-center" onClick={() => openFileDetailsModal(row.department, row.fileDescription, row.revision)}>{row.status}</td>
                          <td className="text-center" onClick={() => openFileDetailsModal(row.department, row.fileDescription, row.revision)}>{row.owner}</td>
                          <td className="text-center d-flex align-items-center justify-content-center">
                            <Button
                              className="upload-btn text-center d-flex align-items-center justify-content-center"
                              onClick={() => uploadFile(index)}
                              variant="outline-secondary"
                            >
                              Upload
                            </Button>
                          </td>
                        </tr>
                      ))}
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
                                <th className="text-center" style={{ width: "12.5%" }}>Sent File</th>
                                <th className="text-center" style={{ width: "12.5%" }}>Sent Date</th>
                                <th className="text-center" style={{ width: "12.5%" }}>Return File</th>
                                <th className="text-center" style={{ width: "14.5%" }}>Comment Code</th>
                                <th className="text-center" style={{ width: "12.5%" }}>PM Comment</th>
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
                                  <tr key={index} className="text-center" style={{backgroundColor:getStatusClass(status)}}>
                                    <td className="text-center">Rev {index}</td>
                                    <td className="text-center">
                                      <Link to={revision.fileLink} target="_blank" rel="noopener noreferrer" title="Download">
                                        {revision.hash}
                                      </Link>
                                    </td>
                                    <td className="text-center">{revision.date}</td>
                                    <td className="text-center">
                                      {lastFeedback.hash ? (
                                        <Link to={lastFeedback.fileLink} target="_blank" rel="noopener noreferrer" title="Download">
                                          {lastFeedback.name}
                                        </Link>
                                      ) : (
                                        "N/A"
                                      )}
                                    </td>
                                    <td className="text-center">{lastFeedback.commentCode || "N/A"}</td>
                                    <td className="text-center">{lastFeedback.additionalComment || "N/A"}</td>
                                    <td className="text-center">{lastFeedback.date || "N/A"}</td>
                                    <td className="text-center">{status}</td>
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

                {/*File Revisions*/}
                <Modal
                  show={revisionModalShow}
                  size="lg"
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
                          <th className="text-center" style={{ width: "15%" }}>Revision</th>
                          <th className="text-center" style={{ width: "28%" }}>File Name</th>
                          <th className="text-center" style={{ width: "15%" }}>File Date</th>
                          <th className="text-center" style={{ width: "14%" }}>Page Count	</th>
                          <th className="text-center" style={{ width: "13%" }}>File Size</th>
                          <th className="text-center" style={{ width: "10%" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody id="revision-history-body">
                        {revisions.map((revision, index) => (
                          <tr key={index}>
                            <td className="text-center" >{index}</td>
                            <td className="text-center" >
                              <Link to={revision.fileLink} target="_blank" rel="noopener noreferrer" title="Download">
                                {revision.hash}
                              </Link>
                            </td>
                            <td className="text-center" >{revision.date}</td>
                            <td className="text-center" >{revision.pageCount}</td>
                            <td className="text-center" >{revision.size}</td>
                            <td className="text-center" >
                              <FaTimes
                                style={{ color: 'red', cursor: 'pointer' }}
                                onClick={() => handleDeleteRevision(revision.id)}
                              />
                            </td>

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
                              className="masterlist-request-card card shadow-none w-100 d-flex flex-row align-items-center justify-content-between px-3"
                              style={{
                                border: `1px solid ${determineDueDateColor(
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
                                className="create-masterlist-btn btn"
                                onClick={() => handleRequestClick(currentJobID, request)}
                                variant="outline-secondary"
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

                <Modal
                  show={false}
                  size="xl"
                  centered={true}
                  scrollable
                  onHide={() => setEngMasterlistModal(false)}
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                      Engineering Masterlist
                    </Modal.Title>
                  </Modal.Header>

                  <Modal.Body>
                    <h6>{isUpdate ? "Update Masterlist" : "Create Masterlist"}</h6>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>File Desc</th>
                          <th>Equip Tag</th>
                          <th>NMR Code</th>
                          <th>Client Code</th>
                          <th>Client Doc No.</th>
                          <th>Company Doc. No.</th>
                          <th>Planned Date</th>
                          <th>Owner</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                value={row.fileDescription}
                                onChange={(e) =>
                                  updateRow(index, "fileDescription", e.target.value)
                                }
                                placeholder="File Description"
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.equipmentTag}
                                onChange={(e) =>
                                  updateRow(index, "equipmentTag", e.target.value)
                                }
                                placeholder="Equipment Tag"
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.nmrCode}
                                onChange={(e) => updateRow(index, "nmrCode", e.target.value)}
                                placeholder="NMR Code"
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.clientCode}
                                onChange={(e) =>
                                  updateRow(index, "clientCode", e.target.value)
                                }
                                placeholder="Client Code"
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.clientDocumentNo}
                                onChange={(e) =>
                                  updateRow(index, "clientDocumentNo", e.target.value)
                                }
                                placeholder="Client Doc No."
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.zsDocumentNo}
                                onChange={(e) =>
                                  updateRow(index, "zsDocumentNo", e.target.value)
                                }
                                placeholder="Company Doc. No."
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                value={row.plannedDate}
                                onChange={(e) =>
                                  updateRow(index, "plannedDate", e.target.value)
                                }
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="email"
                                value={row.ownerEmail}
                                onChange={(e) =>
                                  updateRow(index, "ownerEmail", e.target.value)
                                }
                                placeholder="Owner Email"
                                className="form-control"
                              />
                            </td>
                            <td>
                              <button
                                className="btn btn-danger"
                                onClick={() => deleteRow(index)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <Button
                      className="btn rounded-pill radius-8 px-3 py-2 mb-3"
                      variant="outline-secondary"
                      onClick={addRow}
                    >
                      Add Row
                    </Button>
                  </Modal.Body>

                  <Modal.Footer>
                    <Button
                      className="btn btn-primary"
                      onClick={handleSave}
                    >
                      {isUpdate ? "Update Masterlist" : "Save Masterlist"}
                    </Button>
                    <Button
                      className="btn btn-danger"
                      onClick={() => setEngMasterlistModal(false)}
                    >
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>


                <Modal
                  show={engMasterlistModal}
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                  scrollable
                  onHide={() => setEngMasterlistModal(false)}
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                      Engineering Masterlist
                    </Modal.Title>
                  </Modal.Header>

                  <Modal.Body>
                    <h6>{isUpdate ? "Update Masterlist" : "Create Masterlist"}</h6>
                    <Table style={{ border: "none" }} className="table table-bordered">
                      {/* <tbody> */}
                      {rows.map((row, index) => (
                        <tbody key={index} className="d-flex align-items-center justify-content-evenly flex-wrap">
                          <td style={{ width: "50%" }}>
                            <td style={{ width: "20%" }}>File Desc</td>
                            <td style={{ width: "80%" }}>
                              <input
                                type="text"
                                value={row.fileDescription}
                                onChange={(e) =>
                                  updateRow(index, "fileDescription", e.target.value)
                                }
                                placeholder="File Description"
                                className="form-control"
                              />
                            </td>
                          </td>
                          <td style={{ width: "50%" }}>
                            <td style={{ width: "20%" }}>Equip Tag</td>
                            <td style={{ width: "80%" }}>
                              <input
                                type="text"
                                value={row.equipmentTag}
                                onChange={(e) =>
                                  updateRow(index, "equipmentTag", e.target.value)
                                }
                                placeholder="Equipment Tag"
                                className="form-control"
                              />
                            </td>
                          </td>
                          <td style={{ width: "50%" }}>
                            <td style={{ width: "20%" }}>NMR Code</td>
                            <td style={{ width: "80%" }}>
                              <input
                                type="text"
                                value={row.nmrCode}
                                onChange={(e) => updateRow(index, "nmrCode", e.target.value)}
                                placeholder="NMR Code"
                                className="form-control"
                              />
                            </td>
                          </td>
                          <td style={{ width: "50%" }}>
                            <td style={{ width: "20%" }}>Client Code</td>
                            <td style={{ width: "80%" }}>
                              <input
                                type="text"
                                value={row.clientCode}
                                onChange={(e) =>
                                  updateRow(index, "clientCode", e.target.value)
                                }
                                placeholder="Client Code"
                                className="form-control"
                              />
                            </td>
                          </td>
                          <td style={{ width: "50%" }}>
                            <td style={{ width: "20%" }}>Client Doc No.</td>
                            <td style={{ width: "80%" }}>
                              <input
                                type="text"
                                value={row.clientDocumentNo}
                                onChange={(e) =>
                                  updateRow(index, "clientDocumentNo", e.target.value)
                                }
                                placeholder="Client Doc No."
                                className="form-control"
                              />
                            </td>
                          </td>
                          <td style={{ width: "50%" }}>
                            <td style={{ width: "20%" }}>Company Doc. No.</td>
                            <td style={{ width: "80%" }}>
                              <input
                                type="text"
                                value={row.zsDocumentNo}
                                onChange={(e) =>
                                  updateRow(index, "zsDocumentNo", e.target.value)
                                }
                                placeholder="Company Doc. No."
                                className="form-control"
                              />
                            </td>
                          </td>
                          <td style={{ width: "50%" }}>
                            <td style={{ width: "20%" }}>Planned Date</td>
                            <td style={{ width: "80%" }}>
                              <input
                                type="date"
                                value={row.plannedDate}
                                onChange={(e) =>
                                  updateRow(index, "plannedDate", e.target.value)
                                }
                                className="form-control"
                              />
                            </td>
                          </td>
                          <td style={{ width: "50%" }}>
                            <td style={{ width: "20%" }}>Owner</td>
                            <td style={{ width: "80%" }}>
                              <input
                                type="email"
                                value={row.ownerEmail}
                                onChange={(e) =>
                                  updateRow(index, "ownerEmail", e.target.value)
                                }
                                placeholder="Owner Email"
                                className="form-control"
                              />
                            </td>
                          </td>
                          <td style={{ width: "20%", marginTop: "20px" }}>
                            <td>Actions</td>
                            <td style={{ width: "100%" }}>
                              <button
                                className="btn btn-danger"
                                onClick={() => deleteRow(index)}
                              >
                                Delete
                              </button>
                            </td>
                          </td>
                        </tbody>
                      ))}
                      {/* </tbody> */}
                    </Table>

                    <Button
                      className="btn rounded-pill radius-8 px-3 py-2 mb-3"
                      variant="outline-secondary"
                      onClick={addRow}
                    >
                      Add Row
                    </Button>
                  </Modal.Body>

                  <Modal.Footer>
                    <Button
                      className="btn btn-primary"
                      onClick={handleSave}
                    >
                      {isUpdate ? "Update Masterlist" : "Save Masterlist"}
                    </Button>
                    <Button
                      className="btn btn-danger"
                      onClick={() => setEngMasterlistModal(false)}
                    >
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>




























                {/* {selectedRequest && ( */}
                <Modal
                  show={false}
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                  id="revisionModal"
                  style={{ display: engMasterlistModal ? "flex" : "none" }}
                  onHide={() => setEngMasterlistModal(false)}
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
                          <label className="">Company Doc. No.</label>
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
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between w-100" style={{ width: 100 + '%' }}>
          <h6 className="text-lg fw-semibold mb-0">Document Masterlist</h6>
          <Button
            type="button"
            className="btn rounded-pill btn-primary-100 text-primary-600 radius-8 px-20 py-11"
            variant="primary"
            onClick=""
          >
            Send Transmittal
          </Button>
        </div>
        <div className="card-body p-24">
          <div className="row row-cols-1 gy-4">
            <div className="col w-100">
              <div className="card shadow-none border bg-gradient-start-6 w-100">
                <div className="card-body p-20">
                  <Table bordered id="" className="">
                    <thead>
                      <tr>
                        <th className="text-center">File</th>
                        <th className="text-center">Equip. Tag</th>
                        <th className="text-center">NMR Code</th>
                        <th className="text-center">Client Code</th>
                        <th className="text-center">Client Doc. No.</th>
                        <th className="text-center">Company Doc No.</th>
                        <th className="text-center">Planned Date</th>
                        <th className="text-center">Owner (Email)</th>
                        <th className="text-center">Upload</th>
                      </tr>
                    </thead>
                    {
                      masterlist?.ENG?.length > 0 ? (
                        <tbody>
                          {masterlist.ENG.map((file, index) => (
                            <tr key={index}>
                              <td className="text-center">{file.fileDescription}</td>
                              <td className="text-center">{file.equipmentTag}</td>
                              <td className="text-center">{file.nmrCode}</td>
                              <td className="text-center">{file.clientCode || "N/A"}</td>
                              <td className="text-center">{file.clientDocumentNo || "N/A"}</td>
                              <td className="text-center">{file.zsDocumentNo || "N/A"}</td>
                              <td className="text-center">{file.plannedDate || "N/A"}</td>
                              <td className="text-center">{file.ownerEmail || "N/A"}</td>
                              <td className="text-center">
                                <Button className="upload-btn"
                                  onClick={() => uploadFile(index)}
                                  variant="outline-secondary"
                                >
                                  Upload
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      ) : (
                        <tbody>
                          <td colSpan={9} className="text-center">
                            No masterlist entries available
                          </td>
                        </tbody>
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





