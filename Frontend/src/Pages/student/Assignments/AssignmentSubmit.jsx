// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { 
//   FileText, 
//   Upload, 
//   AlertCircle, 
//   Loader, 
//   ArrowLeft,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Target
// } from "lucide-react";
// import { toast } from 'react-toastify';

// export default function AssignmentSubmit() {
//   const { assignmentId } = useParams();
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);

//   const API_BASE = import.meta.env.VITE_API_STUDENT || "http://localhost:5001/api/student";
//   const token = localStorage.getItem("accessToken");

//   const [assignment, setAssignment] = useState(null);
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [validationError, setValidationError] = useState("");

//   /* ======================
//      LOAD ASSIGNMENT
//   ====================== */
//   useEffect(() => {
//     if (!token) {
//       navigate("/login", { replace: true });
//       return;
//     }
//     loadAssignment();
//   }, [assignmentId, token, navigate]);

//   const loadAssignment = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       const res = await axios.get(
//         `${API_BASE}/assignments/${assignmentId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
      
//       // Handle different API response structures
//       const assignmentData = res.data.assignment || res.data;
//       setAssignment(assignmentData);
//     } catch (err) {
//       console.error("Failed to load assignment", err);
//       const errorMsg = err.response?.data?.message || "Unable to load assignment. Please try again.";
//       setError(errorMsg);
//       toast.error(errorMsg, { 
//         autoClose: 4000,
//         position: "top-center",
//         theme: "colored"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ======================
//      VALIDATE FILE
//   ====================== */
//   const validateFile = (selectedFile) => {
//     if (!selectedFile) {
//       setValidationError("Please select a PDF file to upload");
//       return false;
//     }

//     if (selectedFile.type !== "application/pdf") {
//       setValidationError("Only PDF files are allowed. Please upload a .pdf file");
//       return false;
//     }

//     // 25MB file size limit
//     const maxSize = 25 * 1024 * 1024;
//     if (selectedFile.size > maxSize) {
//       setValidationError(`File size must be under 25MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB`);
//       return false;
//     }

//     setValidationError("");
//     return true;
//   };

//   /* ======================
//      HANDLE FILE SELECTION
//   ====================== */
//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       if (validateFile(selectedFile)) {
//         setFile(selectedFile);
//         toast.success(`✅ ${selectedFile.name} selected`, {
//           autoClose: 2000,
//           position: "top-center",
//           theme: "colored"
//         });
//       } else {
//         // Clear the input if validation fails
//         if (fileInputRef.current) {
//           fileInputRef.current.value = null;
//         }
//       }
//     }
//   };

//   /* ======================
//      REMOVE SELECTED FILE
//   ====================== */
//   const removeFile = () => {
//     setFile(null);
//     setValidationError("");
//     if (fileInputRef.current) {
//       fileInputRef.current.value = null;
//     }
//   };

//   /* ======================
//      SUBMIT ASSIGNMENT
//   ====================== */
//   const submitAssignment = async () => {
//     if (!file) {
//       toast.error("Please select a PDF file to upload", {
//         autoClose: 2500,
//         position: "top-center",
//         theme: "colored"
//       });
//       return;
//     }

//     if (!validateFile(file)) return;

//     try {
//       setSubmitting(true);
//       setError("");
      
//       const formData = new FormData();
//       formData.append("file", file);

//       await axios.post(
//         `${API_BASE}/assignments/${assignmentId}/submit`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       toast.success("✅ Assignment submitted successfully!", {
//         autoClose: 3000,
//         position: "top-center",
//         theme: "colored"
//       });
      
//       // Navigate after toast animation completes
//       setTimeout(() => {
//         navigate(-1);
//       }, 3500);
//     } catch (err) {
//       console.error("Submit assignment failed", err);
//       const errorMsg = err.response?.data?.message || "Failed to submit assignment. Please try again.";
//       setError(errorMsg);
//       toast.error(errorMsg, {
//         autoClose: 4000,
//         position: "top-center",
//         theme: "colored"
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   /* ======================
//      SKELETON LOADER
//   ====================== */
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full animate-pulse">
//           <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
//           <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
//           <div className="h-48 bg-gray-200 rounded-xl mb-6"></div>
//           <div className="h-10 bg-gray-200 rounded w-1/4"></div>
//         </div>
//       </div>
//     );
//   }

//   if (error && !assignment) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
//           <div className="flex justify-center mb-4">
//             <AlertCircle className="w-16 h-16 text-rose-500" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Assignment Unavailable</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!assignment) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
//         <div className="text-center">
//           <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 mb-4">
//             <FileText className="h-8 w-8 text-indigo-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Not Found</h2>
//           <p className="text-gray-600 max-w-md mx-auto mb-6">
//             This assignment could not be located. It may have been removed or you may not have permission to access it.
//           </p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
//           >
//             Return to Assignments
//           </button>
//         </div>
//       </div>
//     );
//   }

//   /* ======================
//      MAIN UI
//   ====================== */
//   const dueDate = assignment.dueDate 
//     ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       })
//     : "No due date";

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors"
//             aria-label="Back to assignments"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Assignments
//           </button>
          
//           <div className="text-center">
//             <div className="flex items-center justify-center mb-4">
//               <div className="bg-indigo-100 p-3 rounded-2xl">
//                 <FileText className="w-8 h-8 text-indigo-600" />
//               </div>
//             </div>
//             <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
//               {assignment.title}
//             </h1>
//             <p className="text-gray-600 max-w-3xl mx-auto mt-3 px-4">
//               {assignment.description}
//             </p>
            
//             {/* Assignment Metadata */}
//             <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
//               <div className="flex items-center gap-2">
//                 <Target className="w-4 h-4 text-indigo-600" />
//                 <span>Max Marks: {assignment.maxMarks || 'N/A'}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Clock className="w-4 h-4 text-amber-600" />
//                 <span>Due: {dueDate}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Instructions Section */}
//         {assignment.instructions && (
//           <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 md:p-6">
//             <div className="flex items-start gap-3">
//               <div className="mt-1 p-1.5 bg-amber-100 rounded-lg">
//                 <AlertCircle className="w-5 h-5 text-amber-700" />
//               </div>
//               <div>
//                 <h2 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
//                   <span>Submission Instructions</span>
//                 </h2>
//                 <p className="text-amber-700 leading-relaxed whitespace-pre-wrap">
//                   {assignment.instructions}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Submission Card */}
//         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
//           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-100">
//             <div className="flex items-center gap-3">
//               <Upload className="w-6 h-6 text-indigo-600" />
//               <h2 className="text-xl font-bold text-gray-900">Submit Your Assignment</h2>
//             </div>
//             <p className="text-sm text-gray-600 mt-1">
//               Upload your completed assignment as a PDF file. Only PDF format is accepted.
//             </p>
//           </div>
          
//           <div className="p-6">
//             {/* File Upload Area */}
//             <div className="mb-6">
//               {!file ? (
//                 <label 
//                   htmlFor="file-upload" 
//                   className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all"
//                 >
//                   <div className="text-center p-6">
//                     <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-100 mb-4">
//                       <Upload className="h-7 w-7 text-indigo-600" />
//                     </div>
//                     <p className="text-lg font-medium text-gray-800 mb-2">
//                       <span className="text-indigo-600 hover:text-indigo-700">Click to upload</span> or drag and drop
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       PDF only (max. 25MB)
//                     </p>
//                   </div>
//                   <input
//                     id="file-upload"
//                     ref={fileInputRef}
//                     type="file"
//                     accept="application/pdf"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     aria-label="PDF file upload"
//                   />
//                 </label>
//               ) : (
//                 <div className="border-2 border-dashed rounded-2xl border-green-200 bg-green-50 p-6">
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-start gap-4">
//                       <div className="mt-1 p-2 bg-green-100 rounded-lg">
//                         <FileText className="w-6 h-6 text-green-700" />
//                       </div>
//                       <div>
//                         <div className="flex items-center gap-2 mb-1">
//                           <CheckCircle className="w-4 h-4 text-green-600" />
//                           <span className="font-medium text-green-800">{file.name}</span>
//                         </div>
//                         <p className="text-sm text-green-700">
//                           {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={removeFile}
//                       className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
//                       aria-label="Remove file"
//                     >
//                       <XCircle className="w-5 h-5" />
//                     </button>
//                   </div>
                  
//                   <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg">
//                     <p className="text-xs text-gray-600 flex items-start gap-1.5">
//                       <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
//                       <span>
//                         <strong>Important:</strong> You can remove and replace this file before submitting. 
//                         Once submitted, you cannot modify your submission.
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Validation Error */}
//             {validationError && (
//               <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-start gap-3">
//                 <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
//                 <span>{validationError}</span>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
//               <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl">
//                 <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                 <span>Make sure your PDF is complete before submitting</span>
//               </div>
              
//               <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//                 <button
//                   onClick={submitAssignment}
//                   disabled={submitting || !file || !!validationError}
//                   className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-medium text-base transition-all flex items-center justify-center gap-2 shadow ${
//                     submitting || !file || validationError
//                       ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                       : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg"
//                   }`}
//                   aria-label="Submit assignment"
//                 >
//                   {submitting ? (
//                     <>
//                       <Loader className="w-5 h-5 animate-spin" />
//                       Submitting...
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="w-5 h-5" />
//                       Submit Assignment
//                     </>
//                   )}
//                 </button>
                
//                 <button
//                   onClick={() => navigate(-1)}
//                   disabled={submitting}
//                   className="flex-1 sm:flex-initial px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Footer Note */}
//         <div className="mt-8 text-center text-sm text-gray-500 max-w-3xl mx-auto">
//           <p className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
//             <span className="font-medium text-indigo-600">Note:</span> After submission, your assignment will be reviewed by your instructor. 
//             You'll receive a notification when your grade and feedback are available.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  Loader, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Target
} from "lucide-react";
import { toast } from 'react-toastify';

export default function AssignmentSubmit() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";
  const token = localStorage.getItem("accessToken");

  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  /* ======================
     LOAD ASSIGNMENT
  ====================== */
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    loadAssignment();
  }, [assignmentId, token, navigate]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await axios.get(
        `${API_BASE}/assignments/${assignmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Handle different API response structures
      const assignmentData = res.data.assignment || res.data;
      setAssignment(assignmentData);
    } catch (err) {
      console.error("Failed to load assignment", err);
      const errorMsg = err.response?.data?.message || "Unable to load assignment. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg, { 
        autoClose: 4000,
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     VALIDATE FILE
  ====================== */
  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      setValidationError("Please select a PDF file to upload");
      return false;
    }

    if (selectedFile.type !== "application/pdf") {
      setValidationError("Only PDF files are allowed. Please upload a .pdf file");
      return false;
    }

    // 25MB file size limit
    const maxSize = 25 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setValidationError(`File size must be under 25MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB`);
      return false;
    }

    setValidationError("");
    return true;
  };

  /* ======================
     HANDLE FILE SELECTION
  ====================== */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        toast.success(`✅ ${selectedFile.name} selected`, {
          autoClose: 2000,
          position: "top-center",
          theme: "colored"
        });
      } else {
        // Clear the input if validation fails
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      }
    }
  };

  /* ======================
     REMOVE SELECTED FILE
  ====================== */
  const removeFile = () => {
    setFile(null);
    setValidationError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  /* ======================
     SUBMIT ASSIGNMENT
  ====================== */
  const submitAssignment = async () => {
    if (!file) {
      toast.error("Please select a PDF file to upload", {
        autoClose: 2500,
        position: "top-center",
        theme: "colored"
      });
      return;
    }

    if (!validateFile(file)) return;

    try {
      setSubmitting(true);
      setError("");
      
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      await axios.post(
        `${API_BASE}/assignments/${assignmentId}/submit`,
        {
          fileName: file.name,
          fileData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("✅ Assignment submitted successfully!", {
        autoClose: 3000,
        position: "top-center",
        theme: "colored"
      });
      
      // Navigate after toast animation completes
      setTimeout(() => {
        navigate(-1);
      }, 3500);
    } catch (err) {
      console.error("Submit assignment failed", err);
      const errorMsg = err.response?.data?.message || "Failed to submit assignment. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg, {
        autoClose: 4000,
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ======================
     SKELETON LOADER
  ====================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-48 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assignment Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 mb-4">
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            This assignment could not be located. It may have been removed or you may not have permission to access it.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            Return to Assignments
          </button>
        </div>
      </div>
    );
  }

  /* ======================
     MAIN UI
  ====================== */
  const dueDate = assignment.dueDate 
    ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "No due date";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors"
            aria-label="Back to assignments"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {assignment.title}
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto mt-3 px-4">
              {assignment.description}
            </p>
            
            {/* Assignment Metadata */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Max Marks: {assignment.maxMarks || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Due: {dueDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        {assignment.instructions && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-1.5 bg-amber-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <span>Submission Instructions</span>
                </h2>
                <p className="text-amber-700 leading-relaxed whitespace-pre-wrap">
                  {assignment.instructions}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submission Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Submit Your Assignment</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Upload your completed assignment as a PDF file. Only PDF format is accepted.
            </p>
          </div>
          
          <div className="p-6">
            {/* File Upload Area */}
            <div className="mb-6">
              {!file ? (
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all"
                >
                  <div className="text-center p-6">
                    <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-100 mb-4">
                      <Upload className="h-7 w-7 text-indigo-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-800 mb-2">
                      <span className="text-indigo-600 hover:text-indigo-700">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF only (max. 25MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="PDF file upload"
                  />
                </label>
              ) : (
                <div className="border-2 border-dashed rounded-2xl border-green-200 bg-green-50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-green-100 rounded-lg">
                        <FileText className="w-6 h-6 text-green-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">{file.name}</span>
                        </div>
                        <p className="text-sm text-green-700">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      aria-label="Remove file"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg">
                    <p className="text-xs text-gray-600 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                      <span>
                        <strong>Important:</strong> You can remove and replace this file before submitting. 
                        Once submitted, you cannot modify your submission.
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Make sure your PDF is complete before submitting</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={submitAssignment}
                  disabled={submitting || !file || !!validationError}
                  className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-medium text-base transition-all flex items-center justify-center gap-2 shadow ${
                    submitting || !file || validationError
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg"
                  }`}
                  aria-label="Submit assignment"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Submit Assignment
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 max-w-3xl mx-auto">
          <p className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <span className="font-medium text-indigo-600">Note:</span> After submission, your assignment will be reviewed by your instructor. 
            You'll receive a notification when your grade and feedback are available.
          </p>
        </div>
      </div>
    </div>
  );
}
