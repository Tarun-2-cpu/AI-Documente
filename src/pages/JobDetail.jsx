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
import * as pdfjsLib from "pdfjs-dist/webpack";
import { getDocument } from "pdfjs-dist";


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
  const [client, setClient] = useState('');
  const [epc, setEPC] = useState('');
  const [endUser, setEndUser] = useState('');
  const [poDate, setPoDate] = useState('');
  const [jobNotFound, setJobNotFound] = useState(false);
  const [incomingDocs, setIncomingDocs] = useState([]);
  const [summary, setSummary] = useState('');
  const [jobs, setJobs] = useState(JSON.parse(localStorage.getItem('jobs')) || []);

  const [currentJob, setCurrentJob] = useState('');

  //transmittal
  const [files, setFiles] = useState([]); // Files data with revisions
  const [transmittals, setTransmittals] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [transmittalDetails, setTransmittalDetails] = useState(null);
  const [currentTransmittalId, setCurrentTransmittalId] = useState(null);

  // notify 
  const [selectedDepartments, setSelectedDepartments] = useState([]);


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

  const [selectedRevisions, setSelectedRevisions] = useState(
    files.reduce((acc, file) => {
      acc[file.srNo] = file.revisions[0]?.revision || 0; // Default to the latest revision
      return acc;
    }, {})
  );



  const fileInputRef = useRef(null);


  useEffect(() => {
    const jobId = getQueryParam('jobId');
    localStorage.setItem('currentJobId', jobId);
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const job = jobs.find((j) => j.jobId === jobId);

    if (job) {
      console.log(job)
      setCurrentJob(job);
      setJobID(job.jobId);
      setJobName(job.jobName);
      setIncomingDocs(job.incomingDocs || []);
      setDescription(job.description);
      setPONumber(job.poNumber);
      setClient(job.client);
      setEPC(job.epc);
      setEndUser(job.endUser);
      setPoDate(job.poDate);
      setTransmittals(job.transmittals || []);

      // if (job && job.incomingDocs) {
      //   job.incomingDocs.forEach(doc => renderDocumentRow(doc, job.jobId));
      // }
    } else {
      console.error('Job with specified ID not found');
      setJobNotFound(true);
    }
  }, []);


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


  // Update modal data when revision modal is shown.
  useEffect(() => {
    if (revisionModalShow && job && selectedSrNo) {

      console.log(job);
      console.log(selectedSrNo);

      if (currentJob) {
        const file = currentJob.incomingDocs.find((doc) => doc.srNo === selectedSrNo);
        if (file) {
          setModalData({
            fileName: file.fileName,
            revisions: file.revisions || [],
          });
        } else {
          console.log('No file found for the given SR number.');
        }
      } else {
        console.log('No job data found.');
      }
    }
  }, [revisionModalShow, job, selectedSrNo]);




  // Handle file upload (the file I upload here gets deleted when I create transmittal check the potential issues)

  const handleFileUpload = (event) => {
    console.log("File upload event triggered:", event.target.files);

    if (!event?.target?.files) {
      console.error("File input event is not defined correctly.");
      return;
    }

    const files = event.target.files;
    const jobId = localStorage.getItem('currentJobId');
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find(j => j.jobId === jobId);

    if (!job) {
      console.error('Job not found!');
      return;
    }

    console.log(jobId);
    console.log(jobs);
    console.log(job);


    let newDocs = [...job.incomingDocs || []];

    console.log("new docs", newDocs);
    console.log('State updated with incomingDocs:', newDocs);

    Array.from(files).forEach((file) => {
      const srNo = `COM-DOC-${jobID}-${newDocs.length + 1}`;
      const fileType = file.name.split('.').pop().toLowerCase();

      const fileDetails = {
        srNo,
        fileName: file.name,
        fileType,
        fileSize: formatFileSize(file.size),
        lastModified: new Date().toLocaleDateString('en-GB'),
        pageCount: fileType === 'pdf' ? 'Getting page count...' : '1 Page',
        revision: 0,
        revisions: [
          {
            revision: 0, // First revision starts at 0
            hash: generateFileHash(file),
            fileLink: URL.createObjectURL(file),
            transmittalId: 'Pending',
            uploadDate: new Date().toLocaleDateString('en-GB'),
          },
        ],
        fileLink: URL.createObjectURL(file),
      };


      if (fileType === 'pdf') {
        getPDFPageCount(file, (pageCount) => {
          fileDetails.pageCount = pageCount;
          newDocs.push(fileDetails);
          setIncomingDocs([...newDocs]);
          updateJobData(jobId, newDocs, jobs);
        });
      } else {
        newDocs.push(fileDetails);
        setIncomingDocs([...newDocs]); // Update state with new docs
        updateJobData(jobId, newDocs, jobs);
      }
    });
    setIncomingDocs(newDocs); // React state
    updateJobData(jobId, newDocs, jobs);
  };

  function updateJobData(jobId, newDocs, jobs) {
    const jobIndex = jobs.findIndex(j => j.jobId === jobId);
    if (jobIndex !== -1) {
      // Update the job's incomingDocs while preserving other job details
      jobs[jobIndex] = { ...jobs[jobIndex], incomingDocs: newDocs };
      localStorage.setItem('jobs', JSON.stringify(jobs));
      console.log("247, Jobs Size:", JSON.stringify(jobs).length);
      console.log('Updated job data saved to localStorage:', jobs[jobIndex]);
    }
  }

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
      console.log("279,Jobs Size:", JSON.stringify(jobs).length);
    }
  };

  // Function to render a document row in the table

  const getPDFPageCount = (file, callback) => {
    const reader = new FileReader();
    reader.onload = function () {
      const typedArray = new Uint8Array(reader.result);
      pdfjsLib.getDocument(typedArray).promise
        .then((pdf) => {
          callback(`${pdf.numPages}`);
        })
        .catch((error) => {
          console.error("Error getting PDF page count:", error);
          callback("Unknown Pages");
        });
    };
    reader.readAsArrayBuffer(file);
  };

  // Open modal when a row in the table is clicked fine name clicked

  // function openAdditionalFieldsModal(srNo) {
  //   const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  //   console.log("alll jobs:", jobs);
  //   const jobId = getQueryParam('jobId');
  //   const job = jobs.find(j => j.jobId === jobId);

  //   console.log("open additional field modal",  jobs);

  //   console.log(jobs);

  //   console.log(jobId);

  //   console.log(job);

  //   if (!job) {
  //     console.error(`No job found for jobId: ${jobId}`);
  //     alert(`No job found for jobId: ${jobId}`);
  //     return;
  //   }

  //   const file = job.incomingDocs.find(doc => doc.srNo === srNo);
  //   if (!file) {
  //     Swal.fire('Error', 'File not found.', 'error');
  //     return;
  //   }

  //   console.log(file);

  //   // Use the file link from the latest revision
  //   const latestRevision = file.revisions[file.revisions.length - 1];

  //   if (!latestRevision) {
  //     Swal.fire('Error', 'No file revisions found.', 'error');
  //     return;
  //   } 

  //   const fileLink = latestRevision.fileLink;
  //   console.log("Latest Revision File Link before fix:", fileLink);



  //   if (!fileLink.startsWith("blob:") && !fileLink.startsWith("http")) {
  //     fileLink = URL.createObjectURL(latestRevision.file);
  //   }

  //   console.log("Final File Link:", fileLink);


  //   setModalData({
  //     fileName: file.fileName,
  //     clientCode: file.clientCode || '',
  //     fileDescription: file.fileDescription || '',
  //     clientDocNo: file.clientDocNo || '',
  //     docType: file.docType || 'GA',
  //     fileLink:fileLink,//mmmm
  //     preview: renderFilePreview(file.fileType,fileLink)
  //   });

  //   console.log("Latest Revision File Link: LINE:327", fileLink); // Debugging


  //   // Display the modal
  //   setFileDetailModal(true);
  // }


  function openAdditionalFieldsModal(srNo) {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const jobId = getQueryParam('jobId');
    const job = jobs.find(j => j.jobId === jobId);

    if (!job) {
      console.error(`No job found for jobId: ${jobId}`);
      alert(`No job found for jobId: ${jobId}`);
      return;
    }

    const file = job.incomingDocs.find(doc => doc.srNo === srNo);
    if (!file) {
      Swal.fire('Error', 'File not found.', 'error');
      return;
    }

    // Get latest file revision
    const latestRevision = file.revisions[file.revisions.length - 1];

    if (!latestRevision) {
      Swal.fire('Error', 'No file revisions found.', 'error');
      return;
    }

    // Ensure fileLink is set correctly
    let fileLink = latestRevision.fileLink;
    console.log("396, Latest Revision File Link before fix:", fileLink);
    console.log("397, Latest Revision File", latestRevision.file);

    // if (!fileLink.startsWith("blob:") && !fileLink.startsWith("http")) {
    //   fileLink = URL.createObjectURL(latestRevision.file);
    // }

    if (!latestRevision.file) {
      console.error("⚠️ latestRevision.file is undefined! Possible issue in data saving.");
    } else if (!(latestRevision.file instanceof Blob)) {
      console.error("⚠️ latestRevision.file is not a Blob. Received:", latestRevision.file);
    } else {
      fileLink = URL.createObjectURL(latestRevision.file);
    }


    console.log("Final File Link:", fileLink);

    // Update modal state
    setModalData({
      fileName: file.fileName,
      clientCode: file.clientCode || '',
      fileDescription: file.fileDescription || '',
      clientDocNo: file.clientDocNo || '',
      docType: file.docType || 'GA',
      fileLink: fileLink,
      preview: renderFilePreview(file.fileType, fileLink, file.fileName),
    });

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
      console.log("451, Jobs Size:", JSON.stringify(jobs).length);

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
    const jobId = getQueryParam('jobId');
    console.log("Retrieved jobId:", jobId);
    console.log("Retrieved jobs array:", jobs);

    const job = jobs.find((j) => j.jobId === jobId);

    if (!job) {
      console.error("Error: Job or incomingDocs not found");
      showErrorAlert("Job not found.");
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

  //work here
  // const openRevisionHistoryModal = (srNo) => {
  //   console.log("openRevisionHistoryModal triggered with srNo:", srNo);

  //   // Fetch updated jobs from localStorage
  //   const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  //   const jobId = getQueryParam('jobId');
  //   console.log("Retrieved jobId:", jobId);
  //   console.log("Retrieved jobs array:", jobs);

  //   const job = jobs.find((j) => j.jobId === jobId);

  //   if (!job) {
  //     console.error("Error: Job or incomingDocs not found");
  //     showErrorAlert("Job not found.");
  //     return;
  //   }

  //   const file = job.incomingDocs.find((doc) => doc.srNo === srNo);

  //   if (!file || !file.revisions) {
  //     console.error("Error: File or revisions not found");
  //     showErrorAlert("File or revisions not found.");
  //     return;
  //   }

  //   // Force update modal data with fresh data from localStorage
  //   setModalData({
  //     fileName: file.fileName,
  //     revisions: [...file.revisions],  // Ensure fresh reference
  //   });

  //   console.log("Updated modal data:", {
  //     fileName: file.fileName,
  //     revisions: file.revisions,
  //   });

  //   setRevisionModalShow(true); // Open the modal
  // };


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
    openRevisionHistoryModal(srNo)
    openRevisionModal(jobId, srNo)
  };

  // const renderFilePreview = (fileType, fileLink) => {

  //   if (!fileLink) return <p>No preview available.</p>;

  //   const lowerFileType = fileType.toLowerCase();
  //   console.log("Latest Revision File Link: LINE:431", fileLink);

  //   if (['jpg', 'jpeg', 'png', 'gif'].includes(lowerFileType)) {

  //     return <img src={fileLink} alt="preview" style={{ maxWidth: '100%', height: 'auto' }} />;

  //   } else if (lowerFileType === 'pdf') {
  //     return (
  //       <iframe
  //         src={fileLink}
  //         title="PDF Preview"
  //         style={{ width: '100%', height: '500px', border: 'none' }}
  //       />
  //     );
  //   } else if (lowerFileType === 'txt') {
  //     return (
  //       TextFilePreview(fileLink)
  //       // <iframe
  //       //   src={fileLink}
  //       //   title="Text File Preview"
  //       //   style={{ width: '100%', height: '500px', border: 'none' }}
  //       // ></iframe>
  //     );
  //   } else {
  //     return (
  //       <p>
  //         Preview not available for this file type.{' '}
  //         <button onClick={() => downloadFile(fileLink)} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}>
  //           Click here to download.
  //         </button>
  //       </p>
  //     );
  //   }
  // };

  const handleDeleteIncomingDoc = (jobId, srNo) => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find((j) => j.jobId === jobId);

    if (!job) {
      Swal.fire("Error", "Job not found!", "error");
      return;
    }

    job.incomingDocs = job.incomingDocs.filter((doc) => doc.srNo !== srNo);

    localStorage.setItem('jobs', JSON.stringify(jobs));

    setIncomingDocs(job.incomingDocs);

    Swal.fire('Success', 'Document deleted successfully!', 'success');
  }

  // const handleDeleteRevision = (jobId, srNo, revisionIndex) => {
  //   console.log("handleDeleteRevision triggered with jobId:", jobId, "srNo:", srNo, "revisionIndex:", revisionIndex);

  //   // Retrieve jobs from localStorage
  //   let jobs = JSON.parse(localStorage.getItem('jobs')) || [];

  //   // Find the job
  //   let job = jobs.find((j) => j.jobId === jobId);
  //   if (!job) {
  //     Swal.fire("Error", "Job not found!", "error");
  //     return;
  //   }

  //   // Find the document
  //   let doc = job.incomingDocs.find((d) => d.srNo === srNo);
  //   if (!doc || !doc.revisions) {
  //     Swal.fire("Error", "Document or revisions not found!", "error");
  //     return;
  //   }

  //   // Ensure revision exists before deleting
  //   if (revisionIndex < 0 || revisionIndex >= doc.revisions.length) {
  //     Swal.fire("Error", "Invalid revision index!", "error");
  //     return;
  //   }

  //   // Remove the specified revision
  //   doc.revisions.splice(revisionIndex, 1);

  //   // Update the revision count
  //   doc.revision = doc.revisions.length > 0 ? doc.revisions.length - 1 : 0;

  //   // Save updated jobs to localStorage
  //   localStorage.setItem('jobs', JSON.stringify(jobs));

  //   // Fetch updated data to ensure UI sync
  //   const updatedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
  //   const updatedJob = updatedJobs.find((j) => j.jobId === jobId);
  //   const updatedDoc = updatedJob?.incomingDocs.find((d) => d.srNo === srNo);

  //   // Update modal data
  //   setModalData((prevData) => ({
  //     ...prevData,
  //     revisions: updatedDoc?.revisions || [],
  //   }));

  //   // Update incomingDocs state to reflect changes in the main table
  //   setIncomingDocs((prevDocs) =>
  //     prevDocs.map((d) =>
  //       d.srNo === srNo ? { ...d, revisions: updatedDoc?.revisions || [], revision: updatedDoc?.revision || 0 } : d
  //     )
  //   );

  //   console.log("Updated modalData:", {
  //     fileName: updatedDoc?.fileName || "",
  //     revisions: updatedDoc?.revisions || [],
  //   });

  //   Swal.fire('Success', 'Revision deleted successfully!', 'success');
  // };



  const handleDeleteRevision = (jobId, srNo, revisionIndex) => {
    console.log("handleDeleteRevision triggered with jobId:", jobId, "srNo:", srNo, "revisionIndex:", revisionIndex);

    // Retrieve jobs from localStorage
    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];

    // Find the job
    let job = jobs.find((j) => j.jobId === jobId);
    if (!job) {
      Swal.fire("Error", "Job not found!", "error");
      return;
    }

    // Find the document
    let doc = job.incomingDocs.find((d) => d.srNo === srNo);
    if (!doc || !doc.revisions) {
      Swal.fire("Error", "Document or revisions not found!", "error");
      return;
    }

    // Ensure revision exists before deleting
    if (revisionIndex < 0 || revisionIndex >= doc.revisions.length) {
      Swal.fire("Error", "Invalid revision index!", "error");
      return;
    }

    // Remove the specified revision
    doc.revisions.splice(revisionIndex, 1);

    // Update the revision count
    doc.revision = doc.revisions.length > 0 ? doc.revisions.length - 1 : 0;

    // Save updated jobs to localStorage
    localStorage.setItem('jobs', JSON.stringify(jobs));

    // Fetch updated data to ensure UI sync
    const updatedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const updatedJob = updatedJobs.find((j) => j.jobId === jobId);
    const updatedDoc = updatedJob?.incomingDocs.find((d) => d.srNo === srNo);

    // Update modal data
    setModalData((prevData) => ({
      ...prevData,
      revisions: updatedDoc?.revisions || [],
    }));

    // Update incomingDocs state to reflect changes in the main table
    setIncomingDocs((prevDocs) =>
      prevDocs.map((d) =>
        d.srNo === srNo ? { ...d, revisions: updatedDoc?.revisions || [], revision: updatedDoc?.revision || 0 } : d
      )
    );

    console.log("Updated modalData:", {
      fileName: updatedDoc?.fileName || "",
      revisions: updatedDoc?.revisions || [],
    });

    Swal.fire('Success', 'Revision deleted successfully!', 'success');
  };


  const renderFilePreview = (fileType, fileLink, fileName) => {
    if (!fileLink) return <p>No preview available.</p>;

    const lowerFileType = fileType.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(lowerFileType)) {
      return <img src={fileLink} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />;
    }
    else if (lowerFileType === 'pdf') {
      return (
        <iframe
          src={fileLink}
          title="PDF Preview"
          style={{ width: '100%', height: '500px', border: 'none' }}
        />
      );
    }
    else if (lowerFileType === 'txt') {
      // Fetch text file content
      return TextFilePreview(fileLink);
    }
    else {
      return (
        <p>
          Preview not available for this file type.{' '}
          <button onClick={() => downloadFile(fileLink, fileName)} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}>
            Click here to download.
          </button>
        </p>
      );
    }
  };


  const downloadFile = (fileLink, fileName) => {
    const link = document.createElement("a");
    link.href = fileLink;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const TextFilePreview = ({ fileUrl }) => {
    const [content, setContent] = useState("");

    useEffect(() => {
      fetch(fileUrl)
        .then(response => response.text())
        .then(data => setContent(data))
        .catch(error => console.error("Error fetching text file:", error));
    }, [fileUrl]);

    return <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{content}</pre>;
  };

  // Upload a new revision.
  const uploadNewRevision = async () => {
    console.log("Selected job ID:", selectedJobId);
    console.log("Selected SR No:", selectedSrNo);

    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*';

      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
          Swal.fire('Error', 'No file selected!', 'error');
          return;
        }
        console.log(file)
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

        const revisionNumber = (doc.revisions?.length || 0) + 1;
        const prefix = 'DOC';
        const transmittalId = `${prefix}-${revisionNumber.toString().padStart(2, '0')}`;

        const newRevision = {
          revision: (doc.revisions?.length || 0),
          fileName: doc.revisions?.length === 0 ? modalData.fileName : file.name,
          hash: await generateFileHash(file),
          fileLink: URL.createObjectURL(file),
          transmittalId: transmittalId,
          uploadDate: new Date().toLocaleDateString(),
        };

        // Update document revisions and revision count
        doc.revisions = [...(doc.revisions || []), newRevision];
        doc.revision = doc.revisions.length - 1; // Update the revision count

        // Save updated data to localStorage
        localStorage.setItem('jobs', JSON.stringify(jobs));
        console.log("673 Jobs Size:", JSON.stringify(jobs).length);

        // Update modal data
        setModalData((prevData) => ({
          ...prevData,
          revisions: [...prevData.revisions, newRevision],
        }));

        console.log("modalData:", modalData)

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
    const fileData = job.incomingDocs.map((doc) => {
      const revisionFileNames = doc.revisions.map((rev) => rev.fileName);
      if (!revisionFileNames[0]) {
        revisionFileNames[0] = doc.fileName;
      }

      return {
        srNo: doc.srNo,
        fileName: doc.fileName,
        revisions: doc.revisions.map((rev) => rev.revision),
        revisionFileName: revisionFileNames,
        uploadDate: doc.revisions.map((rev) => rev.uploadDate),
      };
    });
    setFiles(fileData);
    setCreateNewTransmittal(true);
  };

  console.log("914", files)

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

  // work here

  //handle create transmittal
  const createTransmittal = () => {
    if (!files.some((file) => file.selected)) {
      alert('Please select at least one file.');
      return;
    }

    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const job = jobs.find((j) => j.jobId === jobID);

    if (!job) {
      alert('Job not found.');
      return;
    }

    const transmittalID = createUniqueTransmittalID(jobID);

    const selectedFiles = files
      .filter((file) => file.selected)
      .map((file) => {
        const fileObject = file.fileObject || null;
        return{

          srNo: file.srNo,
          revision: selectedRevisions[file.srNo],
          file: file.fileName,
          fileLink: fileObject ? URL.createObjectURL(fileObject) : null,
        }
      });

    const newTransmittal = {
      id: transmittalID,
      date: new Date().toLocaleString(),
      summary,
      status: 'Pending',
      files: selectedFiles,
      notifiedDepartments: [],
    };

    // const updatedIncomingDocs = [...(job.incomingDocs || [])];
    // selectedFiles.forEach((selected) => {
    //   const doc = updatedIncomingDocs.find((d) => d.srNo === selected.srNo);
    //   const revision = doc?.revisions.find((rev) => rev.revision === selected.revision);
    //   if (revision) {
    //     revision.transmittalID = transmittalID;
    //   }
    // });

    const updatedIncomingDocs = [...(job.incomingDocs || [])].map((doc) => {
      if (selectedFiles.some((selected) => selected.srNo === doc.srNo)) {
        return {
          ...doc,
          revisions: doc.revisions.map((rev) =>
            rev === selectedRevisions[doc.srNo]
              ? { ...rev, transmittalID }
              : rev
          ),
        };
      }
      return doc;
    });

    

    const updatedJobs = jobs.map((j) =>
      j.jobId === jobID
        ? { ...j, transmittals: [...(j.transmittals || []), newTransmittal], incomingDocs: updatedIncomingDocs }
        : j
    );

    localStorage.setItem("jobs", JSON.stringify(updatedJobs));
    console.log("804 Jobs Size:", JSON.stringify(updatedJobs).length);
    setJobs(updatedJobs);
    setTransmittals([...job.transmittals, newTransmittal]);

    setSummary("");
    setFiles([]);
    setCreateNewTransmittal(false);
  };

  const deleteTransmittal = (transmittalID) => {
    // Get jobs from local storage
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];

    // Find the job that contains this transmittal
    const updatedJobs = jobs.map((job) => {
      if (!job.transmittals) return job; // Skip if no transmittals

      // Filter out the transmittal that matches the given ID
      const updatedTransmittals = job.transmittals.filter(transmittal => transmittal.id !== transmittalID);

      return { ...job, transmittals: updatedTransmittals };
    });

    // Save updated jobs back to local storage
    localStorage.setItem("jobs", JSON.stringify(updatedJobs));

    // Update state
    setJobs(updatedJobs);
    alert(`Transmittal ID ${transmittalID} deleted successfully.`);
  };


  const refreshTransmittalsTable = (job) => {
    if (job?.transmittals) {
      setTransmittals([...job.transmittals]); // Update state to re-render the table
    }
  };

  function viewTransmittalDetails(date, id) {
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

    console.log("transmittal: 1009:", transmittal);

    if (!transmittal) {
      console.error(`Transmittal for date ${date} not found.`);
      return alert("Transmittal not found.");
    }

    // Update state with transmittal details
    setTransmittalDetails({
      date: transmittal.date,
      summary: transmittal.summary,
      id: transmittal.id,
      jobDetails: {
        jobId: job.jobId,
        jobName: job.jobName,
        client: job.client,
        epc: job.epc,
        endUser: job.endUser,
      },
      files: transmittal.files.map((file) => {
        const doc = job.incomingDocs?.find((d) => d.srNo === file.srNo);
        console.log(doc);
        return {
          ...doc,
          name: file.fileName,
          type: file.fileType,
          size: file.fileSize,
          modified: file.lastModified,
          count: file.pageCount,
          revision: file.revision,
          fileLink: file.fileLink,
        };
      }),
    });

    setTransmittalDetailModal(true);
  }

  if (transmittalDetails) {
    console.log(transmittalDetails);
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

  // notify department

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
      console.log("940 Jobs Size:", JSON.stringify(jobs).length);

      // Update state with the modified transmittals
      setTransmittals([...job.transmittals]);

      Swal.fire('Success', 'Departments notified successfully!', 'success');
    }

    setNotifyModal(false);
  };


  const getCurrentJob = () => {
    const jobId = new URLSearchParams(window.location.search).get("jobId");
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    return jobs.find((j) => j.jobId === jobId) || null;
  };



  return (
    <MasterLayout title="BD Dashboard">

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
                          <tbody>
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
                              <th><h6>Client </h6></th>
                              <td></td>
                              <td><h6>: {client}</h6></td>
                            </tr>
                            <tr>
                              <th><h6>End User </h6></th>
                              <td></td>
                              <td><h6>: {endUser}</h6></td>
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

      <div className="card h-100 p-0 radius-12 mt-24">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between w-100" style={{ width: 100 + '%' }}>
          <h6 className="text-lg fw-semibold mb-0">Incoming Documents</h6>
        </div>
        <div className="card-body p-24">
          <div className="">

            <Table bordered >
              <thead>
                <tr>
                  <th className="align-middle" style={{ width: '15%', textAlign: "center" }}>Sr.NO.</th>
                  <th className="align-middle" style={{ width: '15%', textAlign: "center" }}>File Name</th>
                  <th className="align-middle" style={{ width: '10%', textAlign: "center" }}>File Type</th>
                  <th className="align-middle" style={{ width: '15%', textAlign: "center" }}>File Size</th>
                  <th className="align-middle" style={{ width: '15%', textAlign: "center" }}>Last Modified</th>
                  <th className="align-middle" style={{ width: '10%', textAlign: "center" }}>Page Count</th>
                  <th className="align-middle" style={{ width: '10%', textAlign: "center" }}>Revision</th>
                  <th className="align-middle" style={{ width: '10%', textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody id="permissionsTableBody">

                {incomingDocs?.length > 0 ? (

                  incomingDocs.map((doc) => (
                    <tr key={doc.srNo} className="text-center align-middle">
                      <td className="align-middle">{doc.srNo}</td>
                      <td className="align-middle">
                        {doc.fileName}
                      </td>
                      <td className="align-middle">{doc.fileType}</td>
                      <td className="align-middle">{doc.fileSize}</td>
                      <td className="align-middle">{doc.lastModified}</td>
                      <td className="align-middle">{doc.pageCount}</td>
                      <td className="align-middle">
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
                      <td className="align-middle">
                        <Link to={doc.fileLink} download={doc.fileName} target="_blank" rel="noopener noreferrer" title="Download">
                          <i className="fas fa-download"></i>
                        </Link>
                        <span style={{ borderLeft: "1px solid black", height: "20px", margin: "0 5px" }}></span>
                        &nbsp;
                        <Link to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleFileNameClick(doc.srNo)
                          }}
                          title="Add Additional Fields">
                          <i className="fas fa-eye"></i>
                        </Link>
                        <span style={{ borderLeft: "1px solid black", height: "20px", margin: "0 5px" }}></span>
                        &nbsp;
                        <Link to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteIncomingDoc(jobID, doc.srNo);
                          }}
                          title="Delete Revision">
                          <i className="fas fa-times-circle text-danger"></i>
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
                  <th style={{ width: "25%", textAlign: "center" }}>Revision</th>
                  <th style={{ width: "25%", textAlign: "center" }}>Name</th>
                  <th style={{ width: "25%", textAlign: "center" }}>Uploaded</th>
                  <th style={{ width: "25%", textAlign: "center" }}>Actions</th>
                  <th style={{ width: "25%", textAlign: "center" }}>Transmittal ID</th>
                </tr>
              </thead>
              <tbody id="revision-history-body">{/*mmmm */}
                {Array.isArray(modalData.revisions) && modalData.revisions.length > 0 ? (
                  modalData.revisions.map((revision, index) => (
                    <tr key={index}>
                      <td className="text-center align-middle">{revision.revision}</td> {/* Display revision count from the object */}
                      <td className="text-center align-middle">
                        {index === 0 ? modalData.fileName : revision.fileName ? revision.fileName : "N/A"}
                      </td>
                      <td className="text-center align-middle">
                        {index === 0 ? revision.uploadDate : revision.uploadDate}
                      </td>
                      <td className="text-center align-middle">
                        {typeof revision.fileLink === "string" ? (
                          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: "15px" }}>
                            <Link to={revision.fileLink} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center" }}>
                              View
                            </Link>
                            <span style={{ borderLeft: "1px solid black", height: "20px", margin: "0 10px" }}></span>
                            <Link to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteRevision(jobID, selectedSrNo, index);
                              }}
                              title="Delete Revision"
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <i className="fas fa-times-circle text-danger"></i>
                            </Link>
                          </div>
                        ) : (
                          "No File Link"
                        )}
                      </td>

                      <td className="text-center align-middle">{index === 0 ? "DOC-1" : typeof revision.transmittalId === "string" ? revision.transmittalId : "N/A"}</td>

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
          scrollable
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
              <div id="filePreview" style={{ border: "1px solid #ccc", width: "100%", height: "500px" }}>
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
                    <td className="align-middle" >{transmittal.id}</td>
                    <td className="align-middle" >{transmittal.date}</td>
                    <td className="align-middle" >{transmittal.summary}</td>
                    <td className="align-middle" >{transmittal.notifiedDepartments?.join(', ') || 'None'}</td>
                    <td className="text-center align-middle" >
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                        <Button
                          className="action-btn"
                          variant="outline-secondary"
                          style={{ flex: '1 1 auto', width: '80%', maxWidth: '120px' }}
                          onClick={() => openNotifyModal(transmittal.id)}
                          disabled={transmittal.notifiedDepartments.length > 0}
                        >
                          {transmittal.notifiedDepartments.length > 0 ? "Notified" : "Notify"}
                        </Button>
                        {transmittal.notifiedDepartments.length > 0 ? (
                          <Button
                            className="action-btn px-2"
                            variant="outline-secondary"
                            onClick={() => viewTransmittalDetails(transmittal.date, transmittal.id)}
                            style={{ flex: '1 1 auto', width: '80%', maxWidth: '120px' }}
                          >
                            View
                          </Button>

                        ) : (
                          <Button
                            className="action-btn px-2"
                            variant="outline-secondary"
                            onClick={() => deleteTransmittal(transmittal.id)}
                            style={{ flex: '1 1 auto', width: '80%', maxWidth: '120px' }}
                          >
                            Delete
                          </Button>
                        )
                        }
                      </div>
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

            {/* create transmittal modal jjjj */}
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
                        {files.map((file) => {
                          const selectedRevisionIndex = file.revisions.findIndex(
                            (rev) => rev === parseInt(selectedRevisions[file.srNo], 10)
                          );

                          // Get the corresponding file name for the selected revision
                          const selectedFileName = file.revisionFileName[selectedRevisionIndex] || file.fileName;

                          return (

                            <tr key={file.srNo} className="text-center align-middle">
                              <td style={{ textAlign: 'center', width: "20%" }} className="text-center align-middle">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                                  <Form.Check
                                    type="checkbox"
                                    checked={file.selected || false}
                                    onChange={() => toggleFileSelection(file.srNo)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  />
                                </div>
                              </td>

                              <td className="text-center align-middle" style={{ width: "60%" }}>
                                {selectedFileName}
                              </td>

                              <td className="text-center align-middle" style={{ width: "20%" }}>
                                <Form.Select
                                  value={selectedRevisions[file.srNo] || file.revisions[0]}
                                  onChange={(e) => {
                                    const newRevision = parseInt(e.target.value, 10);
                                    setSelectedRevisions((prev) => ({
                                      ...prev,
                                      [file.srNo]: newRevision,
                                    }));
                                  }}
                                >
                                  {file.revisions.map((rev, index) => (
                                    <option key={rev} value={rev}>
                                      {/* {`Rev ${rev} - ${file.revisionFileName[index] || file.fileName}`} */}
                                      {`Rev - ${rev}`}
                                    </option>
                                  ))}
                                </Form.Select>
                              </td>
                            </tr>
                          )

                        })}
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
                      <Table>
                        <tbody>
                          <tr>
                            <th>Date:</th>
                            <td>{transmittalDetails.date}</td>
                          </tr>
                          <tr>
                            <th>Summary/Comments:</th>
                            <td>{transmittalDetails.summary}</td>
                          </tr>
                          <tr>
                            <th>Transmittal ID:</th>
                            <td>{transmittalDetails.id}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>

                    {/* Job Details */}
                    <div className="mt-5">
                      <h6>Job Details</h6>
                      <div className="job-details">

                        <Table>
                          <tbody>
                            <tr>
                              <th>Job ID:</th>
                              <td>{transmittalDetails.jobDetails.jobId}</td>
                            </tr>
                            <tr>
                              <th>Job Name:</th>
                              <td>{transmittalDetails.jobDetails.jobName}</td>
                            </tr>
                            <tr>
                              <th>Client:</th>
                              <td>{transmittalDetails.jobDetails.client}</td>
                            </tr>
                            <tr>
                              <th>EPC:</th>
                              <td>{transmittalDetails.jobDetails.epc ? transmittalDetails.jobDetails.epc : "N/A"}</td>
                            </tr>
                            <tr>
                              <th>End User:</th>
                              <td>{transmittalDetails.jobDetails.endUser ? transmittalDetails.jobDetails.endUser : "N/A"}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>

                    {/* Files Table */}
                    <div className="mt-5">
                      <h6>Files in this Transmittal</h6>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th className="text-center">File Name</th>
                            <th className="text-center">File Type</th>
                            <th className="text-center">Size</th>
                            <th className="text-center">Last Modified</th>
                            <th className="text-center">Page Count</th>
                            <th className="text-center">Revision</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transmittalDetails.files.map((file, index) => (
                            <tr key={index} className="text-center align-middle">
                              <td>{file.revisions?.[file.revision]?.fileName || file.fileName}</td>
                              <td>{file.fileType?.toUpperCase()}</td>
                              <td>{file.fileSize}</td>
                              <td>{file.lastModified}</td>
                              <td>{file.pageCount}</td>
                              <td>{file.revision ? `Rev ${file.revision}` : "N/A"}</td>
                              <td>
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

                  <Table className="department-table w-100" style={{ maxWidth: '100%', tableLayout: 'fixed' }}>
                    <tbody>
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
                            <label className="d-flex align-items-center justify-content-between mx-3 gap-2">
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
                  </Table>
                </div>
              </Modal.Body>
              <Modal.Footer>

                <Button
                  className="btn rounded-pill btn-secondary text-secondary-600 radius-8 px-20 py-11"
                  onClick={handleSave}>
                  Notify
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

    </MasterLayout >
  )
}

export default JobDetail




































