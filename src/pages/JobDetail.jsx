import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useState, useEffect, useRef } from 'react'
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom'


function JobDetail() {


  //modals state
  // const [modalShow, setModalShow] = useState(false);
  const [fileDetailModal, setFileDetailModal] = useState(false);
  const [revisionModalShow, setRevisionModalShow] = useState(false);
  const [createNewTransmittal, setCreateNewTransmittal] = useState(false);
  const [transmittalDetailModal, setTransmittalDetailModal] = useState(false)
  const [notifyModal, setNotifyModal] = useState(false)



  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedSrNo, setSelectedSrNo] = useState(null);
  const [jobID, setJobID] = useState('');
  const [jobName, setJobName] = useState('');
  const [description, setDescription] = useState('');
  const [poNumber, setPONumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [jobNotFound, setJobNotFound] = useState(false);
  const [incomingDocs, setIncomingDocs] = useState([]);
  const [summary, setSummary] = useState('');
  const [jobs, setJobs] = useState(JSON.parse(localStorage.getItem('jobs')) || []);


  //transmittal
  const [files, setFiles] = useState([]); // Files data with revisions
  const [transmittals, setTransmittals] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [transmittalDetails, setTransmittalDetails] = useState(null);
  const [currentTransmittalId, setCurrentTransmittalId] = useState(null);

  // notify 
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  // outgoing transmittal
  const [outTransmittal, setOutTransmittal] = useState(false)
  // const [activeTab, setActiveTab] = useState("ENG");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [departments, setDepartments] = useState({
    ENG: [],
    QAQC: [],
  });
  const [outgoingTransmittals, setOutgoingTransmittals] = useState([]);


  // const [fileCounts, setFileCounts] = useState({
  //   ENG: 0,
  //   QAQC: 0,
  //   total: 0,
  // });

  const [job, setJob] = useState(JSON.parse(localStorage.getItem('jobs')).find(j => j.jobId === localStorage.getItem('currentJobId')) || {});
  const [modalData, setModalData] = useState({
    fileName: '',
    revision: [],
    clientCode: '',
    fileDescription: '',
    clientDocNo: '',
    docType: 'GA',
    preview: null,
  })


  const fileInputRef = useRef(null);

  const showErrorAlert = () => {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'No revisions found for this file.',
    });
  };

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  useEffect(() => {
    const jobId = getQueryParam('jobId');
      
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const job = jobs.find((j) => j.jobId === jobId);

    if (jobId) {
      localStorage.setItem('currentJobId', jobId);
      const job = jobs?.find((j) => j.jobId === jobId) || null;

      if (job) {
        setJobID(job.jobId);
        setJobName(job.jobName);
        setDescription(job.description);
        setPONumber(job.poNumber);
        setPoDate(job.poDate);
        setIncomingDocs(job.incomingDocs || []);

        // if (job && job.incomingDocs) {
        //   job.incomingDocs.forEach(doc => renderDocumentRow(doc, job.jobId));
        // }
      } else {
        console.error('Job with specified ID not found in localStorage data.');
        setJobNotFound(true);
      }
    } else {
      console.error('No jobId found in query params.');
      setJobNotFound(true);
    }

    if (job) {
      setTransmittals(job.transmittals || []);
    }

    const savedTransmittals = JSON.parse(localStorage.getItem("outgoingTransmittals")) || [];
    setOutgoingTransmittals(savedTransmittals);

  }, []);


  // Update modal data when revision modal is shown.
  useEffect(() => {
    if (revisionModalShow && job && selectedSrNo) {
      const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
      const jobe = jobs.find((j) => j.jobId === job);
      if (jobe && jobe.incomingDocs) {
        const file = jobe.incomingDocs.find((doc) => doc.srNo === selectedSrNo);
        if (file) {
          setModalData({
            fileName: file.fileName,
            revisions: file.revisions || [],
          });

        } else {
          alert('No file found for the given SR number.');
        }
      } else {
        alert('No job data found.');
      }
    }
  }, [revisionModalShow, job, selectedSrNo]);






  // Handle file upload
  const handleFileUpload = (event) => {
    console.log("File upload event triggered:", event.target.files);

    if (!event || !event.target || !event.target.files) {
      console.error("File input event is not defined correctly.");
      return;
    }

    const files = event.target.files;
    let newDocs = [...incomingDocs];

    Array.from(files).forEach((file) => {
      const srNo = `ZE-DOC-${jobID}-${newDocs.length + 1}`;
      const fileType = file.name.split('.').pop().toLowerCase();
      const fileDetails = {
        srNo,
        fileName: file.name,
        fileType,
        fileSize: formatFileSize(file.size),
        lastModified: new Date(file.lastModified).toLocaleDateString(),
        pageCount: fileType === 'pdf' ? 'Getting page count...' : 'N/A',
        revision: 0, // Start revision count at 0
        revisions: [
          {
            revision: 0, // First revision starts at 0
            hash: generateFileHash(file),
            fileLink: URL.createObjectURL(file),
            transmittalId: 'Pending',
            uploadDate: new Date().toLocaleDateString(),
          },
        ],
        fileLink: URL.createObjectURL(file),
      };

      if (fileType === 'pdf') {
        getPDFPageCount(file, (pageCount) => {
          fileDetails.pageCount = pageCount;
          newDocs.push(fileDetails);
          setIncomingDocs([...newDocs]); // Update state with new docs
        });
      } else {
        newDocs.push(fileDetails);
        setIncomingDocs([...newDocs]); // Update state with new docs
      }
    });






    // Update job data in localStorage
    const updatedJob = { ...job, incomingDocs: newDocs };
    setJob(updatedJob);
    saveJobData(jobID, updatedJob);
  };

  const addClientDocs = () => {
    fileInputRef.current.click();
  };

  const formatFileSize = (size) => {
    return size < 1024
      ? `${size} Bytes`
      : size < 1048576
        ? `${(size / 1024).toFixed(2)} KB`
        : `${(size / 1048576).toFixed(2)} MB`;
  };

  async function generateFileHash(file) {
    const arrayBuffer = await file.arrayBuffer(); // Get the file as an arrayBuffer
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer); // Generate hash using SHA-256
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // Convert bytes to hex string
    return hashHex;
  }

  const saveJobData = (jobId, updatedJob) => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const jobIndex = jobs.findIndex((j) => j.jobId === jobId);
    if (jobIndex !== -1) {
      jobs[jobIndex] = updatedJob;
      localStorage.setItem('jobs', JSON.stringify(jobs));
    }
  };

  // Function to render a document row in the table
  
  

  const getPDFPageCount = (file, callback) => {
    const reader = new FileReader();
    reader.onload = function () {
      // const typedArray = new Uint8Array(reader.result);
    };
    reader.readAsArrayBuffer(file);
  };



  // Open modal when a row in the table is clicked fine name clicked
  function openAdditionalFieldsModal(srNo) {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const jobId = localStorage.getItem('currentJobId');
    const job = jobs.find(j => j.jobId === jobId);

    if (!job || !job.incomingDocs) {
      Swal.fire('Error', 'No incoming documents found for this job.', 'error');
      return;
    }

    const file = job.incomingDocs.find(doc => doc.srNo === srNo);
    if (!file) {
      Swal.fire('Error', 'File not found.', 'error');
      return;
    }

    // Pre-fill form fields in the modal
    setModalData({
      fileName: file.fileName,
      clientCode: file.clientCode || '',
      fileDescription: file.fileDescription || '',
      clientDocNo: file.clientDocNo || '',
      docType: file.docType || 'GA',
      preview: renderFilePreview(file.fileType, file.revisions[file.revisions.length - 1]?.fileLink),
    });

    // Display the modal
    setFileDetailModal(true);
  }




  // Close the modal
  const closeAdditionalFieldsModal = () => {
    setFileDetailModal(false);
  };

  // Save additional fields and update session storage
  const saveAdditionalFields = () => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const jobId = localStorage.getItem('currentJobId');
    const job = jobs.find(j => j.jobId === jobId);

    if (!job || !job.incomingDocs) {
      alert('No incoming documents found for this job.');
      return;
    }

    const srNo = modalData.clientCode; // Assuming srNo is used as clientCode (modify as needed)
    const file = job.incomingDocs.find(doc => doc.srNo === srNo);

    if (file) {
      // Save additional fields
      file.clientCode = modalData.clientCode;
      file.fileDescription = modalData.fileDescription;
      file.clientDocNo = modalData.clientDocNo;
      file.docType = modalData.docType;

      // Update localStorage
      localStorage.setItem('jobs', JSON.stringify(jobs));

      alert('Additional fields saved successfully.');
      closeAdditionalFieldsModal();

      // Optionally refresh the incoming documents table
      // refreshIncomingDocsTable(job);
    }
  };




  const handleFileNameClick = (srNo) => {
    openAdditionalFieldsModal(srNo); // Reuse the existing logic
  };


  // Revision modal start

  const openRevisionHistoryModal = (srNo) => {
    console.log("openRevisionHistoryModal triggered with srNo:", srNo);

    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const jobId = localStorage.getItem('currentJobId');
    console.log("Retrieved jobId:", jobId);
    console.log("Retrieved jobs array:", jobs);

    const job = jobs.find((j) => j.jobId === jobId);
    if (!job || !job.incomingDocs) {
      console.error("Error: Job or incomingDocs not found");
      showErrorAlert("Job or incomingDocs not found.");
      return;
    }

    const file = job.incomingDocs.find((doc) => doc.srNo === srNo);
    if (!file || !file.revisions) {
      console.error("Error: File or revisions not found");
      showErrorAlert("File or revisions not found.");
      return;
    }

    setModalData({
      fileName: file.fileName,
      revisions: file.revisions, // Ensure revisions is an array
    });

    console.log("Modal data prepared:", {
      fileName: file.fileName,
      revisions: file.revisions,
    });

    // setModalShow(true);
  };



  const openRevisionModal = (jobId, srNo) => {
    console.log("openRevisionModal triggered with jobId:", jobId, "and srNo:", srNo);

    setSelectedJobId(jobId); // Set the selected job ID
    setSelectedSrNo(srNo);  // Set the selected serial number
    setRevisionModalShow(true);

    console.log("Selected job ID:", jobId);
    console.log("Selected serial number:", srNo);
    console.log("Revision modal visibility set to true");
  };


  const handleRevisionClick = (jobId, srNo) => {
    openRevisionHistoryModal(srNo);
    openRevisionModal(jobId, srNo)
  };



  const renderFilePreview = (fileType, fileLink) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <img src={fileLink} style={{ maxWidth: '100%', height: 'auto' }} alt=""/>;
        case 'jpg':
          break;
      case 'jpeg':
        break;
      case 'png':
        break;
      case 'gif':
        return <img src={fileLink} style={{ maxWidth: '100%', height: 'auto' }} alt=""/>;
      default:
        return <p>Preview not available for this file type.</p>;
    }
  };

  //work here

  // Upload a new revision.
  const uploadNewRevision = async () => {
    console.log("Selected job ID:", selectedJobId);
    console.log("Selected SR No:", selectedSrNo);

    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*'; // Accept all file types.

      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
          Swal.fire('Error', 'No file selected!', 'error');
          return;
        }

        const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
        const job = jobs.find((j) => j.jobId === selectedJobId);

        if (!job) {
          Swal.fire('Error', 'Job not found!', 'error');
          return;
        }

        const doc = job.incomingDocs.find((d) => d.srNo === selectedSrNo);
        if (!doc) {
          Swal.fire('Error', 'Document not found!', 'error');
          return;
        }

        // Generate new revision
        const newRevision = {
          revision: (doc.revisions?.length || 0) + 1,
          hash: await generateFileHash(file),
          fileLink: URL.createObjectURL(file),
          transmittalId: 'Pending',
          uploadDate: new Date().toLocaleDateString(),
        };

        // Update document revisions and revision count
        doc.revisions = [...(doc.revisions || []), newRevision];
        doc.revision = doc.revisions.length; // Update the revision count

        // Save updated data to localStorage
        localStorage.setItem('jobs', JSON.stringify(jobs));

        // Update modal data
        setModalData((prevData) => ({
          ...prevData,
          revisions: [...prevData.revisions, newRevision],
        }));

        // Update incomingDocs state to reflect changes in the main table
        setIncomingDocs((prevDocs) =>
          prevDocs.map((d) =>
            d.srNo === selectedSrNo ? { ...d, revisions: doc.revisions, revision: doc.revision } : d
          )
        );

        Swal.fire('Success', 'New revision uploaded successfully!', 'success');
      };

      input.click();
    } catch (error) {
      Swal.fire('Error', `An unexpected error occurred: ${error.message}`, 'error');
    }
  };






  function createUniqueTransmittalID(jobId) {
    // Retrieve the jobs from localStorage
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];

    // Find the current job
    const job = jobs.find(j => j.jobId === jobId);

    // Determine the next transmittal number by counting existing transmittals
    const transmittalCount = job?.transmittals?.length || 0;
    const nextTransmittalNumber = transmittalCount + 1;

    // Return formatted Transmittal ID: TRANS-JobID-Number
    return `TRANS-${jobId}-00${nextTransmittalNumber}`;
  }

  //open create modal

  function openCreateTransmittalModal() {
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const jobId = localStorage.getItem("currentJobId");
    const job = jobs.find((j) => j.jobId === jobId);

    if (!job || !job.incomingDocs) {
      alert("No incoming documents found for this job.");
      return;
    }

    // Prepare file data with revisions
    const fileData = job.incomingDocs.map((doc) => ({
      srNo: doc.srNo,
      fileName: doc.fileName,
      revisions: doc.revisions.map((rev) => rev.revision),
    }));
    setFiles(fileData); // Update state with files
    setCreateNewTransmittal(true); // Open modal
  };
  // Handle "Select All" checkbox
  const toggleSelectAllFiles = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setFiles((prevFiles) =>
      prevFiles.map((file) => ({ ...file, selected: isChecked }))
    );
  };

  // Handle individual file selection
  const toggleFileSelection = (srNo) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.srNo === srNo ? { ...file, selected: !file.selected } : file
      )
    );
  };

  //handle create transmittal

  const createTransmittal = () => {
    if (!files.some((file) => file.selected)) {
      alert('Please select at least one file.');
      return;
    }

    const job = jobs.find((j) => j.jobId === jobID);

    if (!job) {
      alert('Job not found.');
      return;
    }

    const transmittalID = createUniqueTransmittalID(jobID);

    const selectedFiles = files
      .filter((file) => file.selected)
      .map((file) => ({
        srNo: file.srNo,
        revision: file.revision,
      }));

    const newTransmittal = {
      id: transmittalID,
      date: new Date().toLocaleString(),
      summary,
      status: 'Pending',
      files: selectedFiles,
      notifiedDepartments: [],
    };

    // Update the job's transmittals
    if (!job.transmittals) {
      job.transmittals = [];
    }
    job.transmittals.push(newTransmittal);

    // Update revisions with transmittal ID
    selectedFiles.forEach((selected) => {
      const doc = job.incomingDocs.find((d) => d.srNo === selected.srNo);
      const revision = doc?.revisions.find((rev) => rev.revision === selected.revision);
      if (revision) {
        revision.transmittalID = transmittalID;
      }
    });

    // Save updated jobs to localStorage
    const updatedJobs = jobs.map((j) => (j.jobId === jobID ? job : j));
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    setJobs(updatedJobs);

    // Update transmittals state for rendering
    setTransmittals([...job.transmittals]);

    // Reset modal state and close
    setSummary('');
    setFiles([]);
    setCreateNewTransmittal(false);
  };


  // const refreshTransmittalsTable = (job) => {
  //   if (job?.transmittals) {
  //     setTransmittals([...job.transmittals]); // Update state to re-render the table
  //   }
  // };



  function viewTransmittalDetails(date) {
    const jobsData = localStorage.getItem("jobs");
    if (!jobsData) {
      console.error("Jobs data not found in localStorage.");
      return alert("No jobs data found.");
    }

    const jobs = JSON.parse(jobsData);
    const jobId = localStorage.getItem("currentJobId");
    if (!jobId) {
      console.error("Current Job ID not found in localStorage.");
      return alert("No current job selected.");
    }

    const job = jobs.find((j) => j.jobId === jobId);
    if (!job) {
      console.error(`Job with ID ${jobId} not found.`);
      return alert("Job not found.");
    }

    const transmittal = job.transmittals?.find((t) => t.date === date);
    if (!transmittal) {
      console.error(`Transmittal for date ${date} not found.`);
      return alert("Transmittal not found.");
    }

    // Update state with transmittal details
    setTransmittalDetails({
      date: transmittal.date,
      summary: transmittal.summary,
      jobDetails: {
        jobId: job.jobId,
        jobName: job.jobName,
        client: job.client,
        epc: job.epc,
        endUser: job.endUser,
      },
      files: transmittal.files.map((file) => {
        const doc = job.incomingDocs?.find((d) => d.srNo === file.srNo);
        return {
          ...doc,
          revision: file.revision,
          fileLink: file.fileLink,
        };
      }),
    });

    setTransmittalDetailModal(true);
  }

  // open notify modal

  function openNotifyModal(id) {
    setNotifyModal(true);
    setCurrentTransmittalId(id);
  }


  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedDepartments([
        "PM",
        "ENG",
        "MOC",
        "QAQC",
        "MP",
        "MFG",
      ]);
    } else {
      setSelectedDepartments([]);
    }
  };

  const handleCheckboxChange = (value) => {
    setSelectedDepartments((prev) =>
      prev.includes(value)
        ? prev.filter((department) => department !== value)
        : [...prev, value]
    );
  };


  const handleSave = () => {
    if (selectedDepartments.length === 0) {
      alert("Please select at least one department.");
      return;
    }

    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const jobId = localStorage.getItem("currentJobId");
    const job = jobs.find((j) => j.jobId === jobId) || null;

    if (!job) {
      console.error("No job found for the given jobId:", jobId);
      return;
    }

    const transmittal = job.transmittals.find((t) => t.id === currentTransmittalId);
    if (transmittal) {
      // Update transmittal's notified departments
      transmittal.notifiedDepartments = selectedDepartments;

      // Update localStorage
      localStorage.setItem("jobs", JSON.stringify(jobs));

      // Update state with the modified transmittals
      setTransmittals([...job.transmittals]);

      Swal.fire('Success', 'Departments notified successfully!', 'success');
    }

    setNotifyModal(false);
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

  const loadDepartmentFiles = () => {
    const job = getCurrentJob(); // Retrieve the current job details from localStorage
    if (job) {
      setDepartments({
        ENG: job.masterlist?.ENG || [],
        QAQC: job.masterlist?.QAQC || [],
      });
    }
  };

  const getCurrentJob = () => {
    const jobId = new URLSearchParams(window.location.search).get("jobId");
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    return jobs.find((j) => j.jobId === jobId) || null;
  };

  const createOutgoingTransmittal = () => {
    const newTransmittalId = `ZM-TRAN-OUTGOING-${generateTransmittalId()}`;
    const outgoingTransmittal = {
      id: newTransmittalId,
      date: new Date().toLocaleString(),
      files: selectedFiles,
    };

    // Save transmittal to localStorage and state
    saveTransmittal(outgoingTransmittal);
    setOutgoingTransmittals((prev) => [...prev, outgoingTransmittal]);
    closeOutgoingTransmittalModal();
  };

  const generateTransmittalId = () => {
    return outgoingTransmittals.length + 1;
  };

  const saveTransmittal = (transmittal) => {
    const transmittals = JSON.parse(localStorage.getItem("outgoingTransmittals")) || [];
    transmittals.push(transmittal);
    localStorage.setItem("outgoingTransmittals", JSON.stringify(transmittals));
  };

  const handleFileSelection = (department, fileIndex) => {
    const selectedFile = { department, index: fileIndex };
    setSelectedFiles((prev) =>
      prev.find((f) => f.department === department && f.index === fileIndex)
        ? prev.filter((f) => !(f.department === department && f.index === fileIndex))
        : [...prev, selectedFile]
    );
  };


  if (jobNotFound) {
    alert('Job not found');
    return null;
  }

  return (
    <MasterLayout>

      {/* Breadcrumb */}
      <Breadcrumb title="Job Detail Page" />

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
                          <tr>
                            <th><h6>Job ID </h6></th>
                            <td></td>
                            <td><h6>: {jobID}</h6></td>
                          </tr>
                          <tr>
                            <th><h6>Job Name </h6></th>
                            <td></td>
                            <td><h6>: {jobName}</h6></td>
                          </tr>
                          <tr>
                            <th><h6>Description </h6></th>
                            <td></td>
                            <td><h6>: {description}</h6></td>
                          </tr>
                          <tr>
                            <th><h6>PO Number </h6></th>
                            <td></td>
                            <td><h6>: {poNumber}</h6></td>
                          </tr>
                          <tr>
                            <th><h6>PO Date </h6></th>
                            <td></td>
                            <td><h6>: {poDate}</h6></td>
                          </tr>
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

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between w-100" style={{ width: 100 + '%' }}>
          <h6 className="text-lg fw-semibold mb-0">Incoming Documents</h6>
        </div>
        <div className="card-body p-24">
          <div className="">

            <Table bordered >
              <thead>
                <tr>
                  <th style={{ width: '15%', textAlign: "center" }}>Sr.NO.</th>
                  <th style={{ width: '15%', textAlign: "center" }}>File Name</th>
                  <th style={{ width: '10%', textAlign: "center" }}>File Type</th>
                  <th style={{ width: '15%', textAlign: "center" }}>File Size</th>
                  <th style={{ width: '15%', textAlign: "center" }}>Last Modified</th>
                  <th style={{ width: '10%', textAlign: "center" }}>Page Count</th>
                  <th style={{ width: '10%', textAlign: "center" }}>Revision</th>
                  <th style={{ width: '10%', textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody id="permissionsTableBody">

                {incomingDocs?.length > 0 ? (

                  incomingDocs.map((doc) => (
                    <tr key={doc.srNo} className="text-center align-middle">
                      <td>{doc.srNo}</td>
                      <td>
                        <Link to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleFileNameClick(doc.srNo)
                          }}>
                          {doc.fileName}
                        </Link>
                      </td>
                      <td>{doc.fileType}</td>
                      <td>{doc.fileSize}</td>
                      <td>{doc.lastModified}</td>
                      <td>{doc.pageCount}</td>
                      <td>
                        <Link
                          to="#"
                          className="revision-link"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default anchor behavior
                            handleRevisionClick(jobID, doc.srNo);
                          }}
                        >
                          {doc.revision}
                        </Link>
                      </td>
                      <td>
                        <Link to={doc.fileLink} download={doc.fileName} target="_blank" rel="noopener noreferrer" title="Download">
                          <i className="fas fa-download"></i>
                        </Link>
                        &nbsp;
                        <Link to="#"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default anchor behavior
                            handleRevisionClick(jobID, doc.srNo);
                          }}
                          title="Add Additional Fields">
                          <i className="fas fa-plus-circle"></i>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No documents available.</td>
                  </tr>
                )}
              </tbody>
            </Table>

            <Button
              className="btn rounded-pill btn-primary-100 text-primary-600 radius-8 px-5 py-3"
              onClick={() => addClientDocs()}>
              Add Client Docs
            </Button>
            <input
              type="file"
              id="file-input"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              multiple
            />

            {/* Render incomingDocs details here */}

          </div>
        </div>

        {/* REVISION MODAL*/}
        <Modal
          show={revisionModalShow}
          jobId={selectedJobId}
          srNo={selectedSrNo}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          id="revisionModal"
          onClose={() => setRevisionModalShow(false)}
        >
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter">
              {typeof modalData.fileName === "string"
                ? `Revision History for ${modalData.fileName}`
                : "Revision History"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table bordered id="revision-history-table">
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Revision</th>
                  <th style={{ width: "25%" }}>Hash</th>
                  <th style={{ width: "25%" }}>Actions</th>
                  <th style={{ width: "25%" }}>Transmittal ID</th>
                </tr>
              </thead>
              <tbody id="revision-history-body">
                {Array.isArray(modalData.revisions) && modalData.revisions.length > 0 ? (
                  modalData.revisions.map((revision, index) => (
                    <tr key={index}>
                      <td>{revision.revision}</td> {/* Display revision count from the object */}
                      <td>{typeof revision.hash === "string" ? revision.hash : "Invalid Hash"}</td>
                      <td>
                        {typeof revision.fileLink === "string" ? (
                          <Link to={revision.fileLink} target="_blank" rel="noopener noreferrer">
                            View
                          </Link>
                        ) : (
                          "No File Link"
                        )}
                      </td>
                      <td>{typeof revision.transmittalId === "string" ? revision.transmittalId : "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No revisions found.</td>
                  </tr>
                )}
              </tbody>


            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
              onClick={uploadNewRevision}
              id="upload-revision-btn"
            >
              Upload New Revision
            </Button>
            <Button
              className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
              onClick={() => setRevisionModalShow(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>




        {/* FILE DETAILS MODAL */}
        <Modal
          show={fileDetailModal}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          id="additionalFieldsModal"
        >
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter">
              File Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body id="additional-fields-form">

            <div className="">
              <div className="mb-3">
                <div className="">
                  <label className="" id="">Client Code</label>
                </div>
                <input type="text" className="form-control" value={modalData.clientCode} onChange={(e) => setModalData({ ...modalData, clientCode: e.target.value })} />
              </div>

              <div className="mb-3">
                <div className="">
                  <label className="" id="">File Description</label>
                </div>
                <input type="text" className="form-control" value={modalData.fileDescription} onChange={(e) => setModalData({ ...modalData, fileDescription: e.target.value })} />
              </div>

              <div className="mb-3">
                <div className="">
                  <label className="" id="">Client Doc No.</label>
                </div>
                <input
                  type="text"
                  value={modalData.clientDocNo}
                  className="form-control"
                  onChange={(e) => setModalData({ ...modalData, clientDocNo: e.target.value })}
                />
              </div>


              <div className="mb-5">
                <div className="">
                  <label className="" id="">Doc Type:</label>
                </div>
                <select type="text"
                  value={modalData.docType}
                  className="form-control"
                  onChange={(e) => setModalData({ ...modalData, docType: e.target.value })}
                >
                  <option>GA</option>
                  <option>NZ</option>
                  <option>INT</option>
                  <option>EXT</option>
                  <option>NP</option>
                  <option>INS</option>
                  <option>TRA</option>
                  <option>MAN</option>
                  <option>TKM</option>
                  <option>DS</option>
                  <option>MDC</option>
                  <option>ITP</option>
                </select>
              </div>

            </div>

            <div className="filePreviewContainer">
              <h5 className="text-secondary">File Preview: </h5>
              <div id="filePreview" style={{ border: "1px solid #ccc", width: "100%", height: "500px", padding: "30px" }}>
                {modalData.preview}
              </div>
            </div>


          </Modal.Body>
          <Modal.Footer>

            <Button
              className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
              onClick={saveAdditionalFields}
            >
              Save
            </Button>
            <Button
              className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
              onClick={closeAdditionalFieldsModal}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </div>


      <div className="card h-100 p-0 radius-12 mt-24" id='transmittals-section'>
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between w-100" style={{ width: 100 + '%' }}>
          <h6 className="text-lg fw-semibold mb-0">Transmittals</h6>
        </div>
        <div className="card-body p-24">
          <div className="">

            <Table bordered id="transmittalsTable" className="transmittal-table">
              <thead>
                <tr>
                  <th style={{ width: '20%', textAlign: "center" }}>Transmittal ID</th>
                  <th style={{ width: '20%', textAlign: "center" }}>Date</th>
                  <th style={{ width: '20%', textAlign: "center" }}>Summary</th>
                  <th style={{ width: '25%', textAlign: "center" }}>Notified Departments</th>
                  <th style={{ width: '15%', textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody id="transmittalsBody">
                {transmittals.map((transmittal) => (
                  <tr key={transmittal.id} className="text-center align-middle">
                    <td onClick={() => viewTransmittalDetails(transmittal.date)}>{transmittal.id}</td>
                    <td onClick={() => viewTransmittalDetails(transmittal.date)}>{transmittal.date}</td>
                    <td onClick={() => viewTransmittalDetails(transmittal.date)}>{transmittal.summary}</td>
                    <td>{transmittal.notifiedDepartments?.join(', ') || 'None'}</td>
                    <td>
                      <button
                        className="notify-btn btn rounded-pill btn btn-outline-primary text-primary-600 radius-8 px-3 py-2"
                        onClick={() => openNotifyModal(transmittal.id)}
                      >
                        Send Transmittal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Button
                className="btn rounded-pill btn-primary-100 text-primary-600 radius-8 px-5 py-3 create-transmittal-button"
                onClick={() => openCreateTransmittalModal()}
            >

              Create New Transmittal
            </Button>

            {/* create transmittal modal */}
            <Modal
              show={createNewTransmittal}
              onHide={() => setCreateNewTransmittal(false)}
              size="lg"
              aria-labelledby="contained-modal-title-vcenter"
              centered
              id="createTransmittalModal"
            >
              <Modal.Header closebutton>
                <Modal.Title id="contained-modal-title-vcenter">
                  Create Transmittal
                </Modal.Title>
              </Modal.Header>
              <Modal.Body id="createTransmittalForm">
                <div className="notify-department-selection px-32">
                  <div className="text-center mb-3 col-12">
                    <FloatingLabel
                      controlId="floatingTextarea"
                      label="Add Summary/Comments here"
                      className="mb-3"
                    >
                      <Form.Control as="textarea" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Add Summary/Comments here" />
                    </FloatingLabel>
                  </div>

                  <div className="form-group">
                    <label>Select Files</label>

                    <Table striped bordered hover id="transmittalFilesTable">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'center' }}>
                            <Form.Check
                              type="checkbox"
                              checked={selectAll}
                              onChange={toggleSelectAllFiles}
                              className="d-flex align-items-center justify-content-center"
                              label=""
                              aria-label="Checkbox for following text input"
                            />
                          </th>
                          <th style={{ textAlign: 'center' }}>File Name</th>
                          <th style={{ textAlign: 'center' }}>Revision</th>
                        </tr>
                      </thead>
                      <tbody id="transmittalFilesBody">
                        {files.map((file) => (
                          <tr key={file.srNo} className="text-center align-middle">
                            <td style={{ textAlign: 'center' }}>
                              <Form.Check
                                type="checkbox"
                                checked={file.selected || false}
                                onChange={() => toggleFileSelection(file.srNo)}
                              />
                            </td>
                            <td>{file.fileName}</td>
                            <td>
                              <Form.Select
                                value={file.revision || ''}
                                onChange={(e) =>
                                  setFiles((prevFiles) =>
                                    prevFiles.map((f) =>
                                      f.srNo === file.srNo
                                        ? { ...f, revision: e.target.value }
                                        : f
                                    )
                                  )
                                }
                              >
                                {file.revisions.map((rev) => (
                                  <option key={rev} value={rev}>
                                    Rev {rev}
                                  </option>
                                ))}
                              </Form.Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>

                <Button
                  className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
                  onClick={() => createTransmittal()}>
                  Create
                </Button>
                <Button
                  className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                  onClick={() => setCreateNewTransmittal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>


            {/* transmittal detail modal */}
            <Modal
              show={transmittalDetailModal}
              size="xl"
              aria-labelledby="contained-modal-title-vcenter"
              centered
              className="m-5"
            >
              <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                  Transmittal Details
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {transmittalDetails && (
                  <>
                    {/* Transmittal Info */}
                    <div className="transmittal-info">
                      <p><strong>Date:</strong> {transmittalDetails.date}</p>
                      <p><strong>Summary/Comments:</strong> {transmittalDetails.summary}</p>
                    </div>

                    {/* Job Details */}
                    <div className="mt-5">
                      <h6>Job Details</h6>
                      <div className="job-details">
                        <p><strong>Job ID:</strong> {transmittalDetails.jobDetails.jobId}</p>
                        <p><strong>Job Name:</strong> {transmittalDetails.jobDetails.jobName}</p>
                        <p><strong>Client:</strong> {transmittalDetails.jobDetails.client}</p>
                        <p><strong>EPC:</strong> {transmittalDetails.jobDetails.epc}</p>
                        <p><strong>End User:</strong> {transmittalDetails.jobDetails.endUser}</p>
                      </div>
                    </div>

                    {/* Files Table */}
                    <div className="mt-5">
                      <h6>Files in this Transmittal</h6>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>File Type</th>
                            <th>Size</th>
                            <th>Last Modified</th>
                            <th>Page Count</th>
                            <th>Revision</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transmittalDetails.files.map((file, index) => (
                            <tr key={index} className="text-center align-middle">
                              <td>{file.fileName}</td>
                              <td>{file.fileType?.toUpperCase()}</td>
                              <td>{file.fileSize}</td>
                              <td>{file.lastModified}</td>
                              <td>{file.pageCount}</td>
                              <td>{file.revision ? `Rev ${file.revision}` : "N/A"}</td>
                              <td>
                                <Link to={file.fileLink} download={file.fileName} target="_blank" rel="noopener noreferrer">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </>
                )}
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


            {/* send transmittal (notify) modal  */}

            <Modal
              show={notifyModal}
              size="lg"
              aria-labelledby="contained-modal-title-vcenter"
              centered
              id="notifyModal"
            >
              <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                  Select Departments to Notify
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="notify-department-selection px-32">
                  <div className="text-center mb-3">
                    <label>
                      <input
                        type="checkbox"
                        className="department-checkbox form-check-input me-2"
                        id="selectAllDepartments"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      />
                      Select All
                    </label>
                  </div>

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
                                checked={selectedDepartments.includes(value)}
                                onChange={() => handleCheckboxChange(value)}
                              />
                              {label}
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Modal.Body>
              <Modal.Footer>

                <Button
                  className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
                  onClick={handleSave}>
                  Save
                </Button>
                <Button
                  className="btn rounded-pill btn-danger-100 text-danger-900 radius-8 px-20 py-11"
                  onClick={() => setNotifyModal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>


          </div>
        </div>
      </div>

      {/* Outgoing Modal  */}

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between w-100" style={{ width: 100 + '%' }}>
          <h6 className="text-lg fw-semibold mb-0">Outgoing Transmittals</h6>
        </div>
        <div className="card-body p-24">
          <div className="gy-4">

            {/* <Table bordered>
              <thead>
                <tr>
                  <th style={{ width: '20%', textAlign :"center" }}>Transmittal ID</th>
                  <th style={{ width: '20%', textAlign :"center" }}>Date</th>
                  <th style={{ width: '20%', textAlign :"center" }}>Summary</th>
                  <th style={{ width: '25%', textAlign :"center" }}>NOtified Departments</th>
                  <th style={{ width: '15%', textAlign :"center" }}>Actions</th>
                </tr>
              </thead>
              <tbody id="permissionsTableBody">
                
              </tbody>
            </Table> */}

            {outgoingTransmittals.map((t) => (
              <div key={t.id} className="transmittal-card d-flex justify-content-around align-items-center border border-secondary my-3 py-3">
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
            ))}
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

                <div class="tab-container d-flex align-items-center gap-2">
                  <button class="tab-button btn rounded-pill btn btn-outline-secondary text-secondary-600 radius-8 px-4 py-4" onclick="openTab(event, 'ENG')">Engineering (ENG)</button>
                  <button class="tab-button btn rounded-pill btn btn-outline-secondary text-secondary-600 radius-8 px-6 py-4" onclick="openTab(event, 'QAQC')">QA/QC</button>
                  {/* <!-- Add more department tabs as needed --> */}
                </div>

                <div id="ENG" class="tab-content">
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

                <div id="QAQC" class="tab-content" style={{display:"none"}}>
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
        </div>
      </div>
    </MasterLayout >
  )
}

export default JobDetail







