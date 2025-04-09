import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/check-auth`, {
          withCredentials: true
        });
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {}, {
        withCredentials: true
      });
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [generatedResume, setGeneratedResume] = useState("");
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    yearsOfExperience: "",
    education: "",
    certifications: ""
  });
  const [loading, setLoading] = useState({
    upload: false,
    search: false,
    generate: false
  });

  // Error handling helper
  const handleError = (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.detail || "An error occurred";
      if (error.response.status === 429) {
        setError("Rate limit exceeded. Please wait a minute before trying again.");
      } else {
        setError(message);
      }
    } else if (error.request) {
      // Request made but no response
      setError("Unable to connect to server. Please check your connection.");
    } else {
      // Other errors
      setError("An unexpected error occurred. Please try again.");
    }
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError("Please select a PDF file");
      return;
    }
    setFile(selectedFile);
  };

  // Send file to the backend
  const uploadResume = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(prev => ({ ...prev, upload: true }));
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload_resume/`, formData);
      setResumeData(res.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  // Search for jobs
  const searchJobs = async () => {
    setLoading(prev => ({ ...prev, search: true }));
    setError(null);

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/search_jobs/`, {
        params: {
          query: "Help Desk Technician",
          location: "Remote"
        }
      });
      setJobs(res.data.jobs);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  // Generate a new resume
  const generateResume = async () => {
    if (!resumeData) {
      setError("Please upload a resume first");
      return;
    }
    if (!selectedJob) {
      setError("Please select a job first");
      return;
    }

    setLoading(prev => ({ ...prev, generate: true }));
    setError(null);

    if (!userInfo.fullName || !userInfo.email || !userInfo.phone) {
      setError("Please fill in required personal information");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/generate_resume/`, {
        userInfo,
        skills: resumeData.parsed_data.skills.join(", "),
        job_desc: selectedJob,
        resumeText: resumeData.parsed_data.full_text
      });
      setGeneratedResume(res.data.resume);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(prev => ({ ...prev, generate: false }));
    }
  };

  return (
    <div style={{
      margin: "0 auto", 
      maxWidth: "800px", 
      padding: "20px",
      backgroundColor: "black",
      color: "white",
      minHeight: "100vh"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h1 style={{ color: "white" }}>AI Job Assistant</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#666" }}>{user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: "10px",
          marginBottom: "20px",
          backgroundColor: "#440000",
          color: "white",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}

      {/* Upload Resume Section */}
      <div style={{ marginBottom: "20px" }}>
        <input 
          type="file" 
          onChange={handleFileUpload}
          accept=".pdf"
          style={{ marginRight: "10px" }}
        />
        <button 
          onClick={uploadResume}
          disabled={loading.upload || !file}
          style={{ 
            padding: "8px 16px",
          backgroundColor: loading.upload ? "#333" : "#1a73e8",
          color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading.upload ? "not-allowed" : "pointer"
          }}
        >
          {loading.upload ? "Uploading..." : "Upload Resume"}
        </button>
      </div>

      {/* Resume Data Display */}
      {resumeData && (
        <div style={{ 
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#1a1a1a",
          color: "white",
          borderRadius: "4px"
        }}>
          <h2>Resume Data</h2>
          <p><strong>File Name:</strong> {resumeData.filename}</p>
          <p><strong>Extracted Skills:</strong></p>
          <ul style={{ paddingLeft: "20px" }}>
            {resumeData.parsed_data.skills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Job Search Section */}
      <div style={{ marginTop: "20px" }}>
        <button 
          onClick={searchJobs}
          disabled={loading.search}
          style={{ 
            padding: "8px 16px",
          backgroundColor: loading.search ? "#333" : "#34a853",
          color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading.search ? "not-allowed" : "pointer"
          }}
        >
          {loading.search ? "Searching..." : "Search Help Desk Jobs (Remote)"}
        </button>
        {jobs.length > 0 && (
          <div style={{ 
            marginTop: "15px",
            padding: "15px",
            backgroundColor: "#1a1a1a",
            color: "white",
            borderRadius: "4px"
          }}>
            <h2>Job Results</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {jobs.map((job, idx) => (
                <li
                  key={idx}
                  style={{ 
                    cursor: "pointer", 
                    marginBottom: "10px",
                    padding: "10px",
                    backgroundColor: selectedJob === job.title ? "#2c2c2c" : "#1a1a1a",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    color: "white"
                  }}
                  onClick={() => setSelectedJob(job.title)}
                >
                  <strong>{job.title}</strong>
                  {job.company && <span style={{ color: "#666" }}> - {job.company}</span>}
                  <a 
                    href={job.link} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      marginLeft: "10px",
                      color: "#1a73e8",
                      textDecoration: "none"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Job
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* User Information Section */}
      {resumeData && (
        <div style={{ 
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#1a1a1a",
          color: "white",
          borderRadius: "4px"
        }}>
          <h2>Personal Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input
              type="text"
              placeholder="Full Name *"
              value={userInfo.fullName}
              onChange={(e) => setUserInfo(prev => ({ ...prev, fullName: e.target.value }))}
              style={{
                padding: "8px",
                backgroundColor: "#2c2c2c",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "white"
              }}
            />
            <input
              type="email"
              placeholder="Email *"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              style={{
                padding: "8px",
                backgroundColor: "#2c2c2c",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "white"
              }}
            />
            <input
              type="tel"
              placeholder="Phone *"
              value={userInfo.phone}
              onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
              style={{
                padding: "8px",
                backgroundColor: "#2c2c2c",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "white"
              }}
            />
            <input
              type="text"
              placeholder="Location"
              value={userInfo.location}
              onChange={(e) => setUserInfo(prev => ({ ...prev, location: e.target.value }))}
              style={{
                padding: "8px",
                backgroundColor: "#2c2c2c",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "white"
              }}
            />
            <input
              type="text"
              placeholder="LinkedIn Profile"
              value={userInfo.linkedIn}
              onChange={(e) => setUserInfo(prev => ({ ...prev, linkedIn: e.target.value }))}
              style={{
                padding: "8px",
                backgroundColor: "#2c2c2c",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "white"
              }}
            />
            <input
              type="text"
              placeholder="Years of Experience"
              value={userInfo.yearsOfExperience}
              onChange={(e) => setUserInfo(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
              style={{
                padding: "8px",
                backgroundColor: "#2c2c2c",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "white"
              }}
            />
            <input
              type="text"
              placeholder="Education"
              value={userInfo.education}
              onChange={(e) => setUserInfo(prev => ({ ...prev, education: e.target.value }))}
              style={{
                padding: "8px",
                backgroundColor: "#2c2c2c",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "white"
              }}
            />
            <input
              type="text"
              placeholder="Certifications"
              value={userInfo.certifications}
              onChange={(e) => setUserInfo(prev => ({ ...prev, certifications: e.target.value }))}
              style={{
                padding: "8px",
                backgroundColor: "#2c2c2c",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "white"
              }}
            />
          </div>
          <p style={{ marginTop: "10px", fontSize: "0.9em", color: "#666" }}>* Required fields</p>
        </div>
      )}

      {/* Generate Resume Section */}
      {selectedJob && resumeData && (
        <div style={{ 
          marginTop: "20px",
          padding: "15px",
            backgroundColor: "#1a1a1a",
            color: "white",
          borderRadius: "4px"
        }}>
          <h2>Generate Resume for: {selectedJob}</h2>
          <button 
            onClick={generateResume}
            disabled={loading.generate}
            style={{ 
              padding: "8px 16px",
              backgroundColor: loading.generate ? "#333" : "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading.generate ? "not-allowed" : "pointer"
            }}
          >
            {loading.generate ? "Generating..." : "Generate Resume"}
          </button>
        </div>
      )}

      {/* Display Generated Resume */}
      {generatedResume && (
        <div style={{ 
          marginTop: "20px",
          padding: "15px",
            backgroundColor: "#1a1a1a",
            color: "white",
          borderRadius: "4px"
        }}>
          <h2>Generated Resume</h2>
          <pre style={{ 
            whiteSpace: "pre-wrap",
            backgroundColor: "#1a1a1a",
            color: "white",
            padding: "15px",
            borderRadius: "4px",
            border: "1px solid #ddd"
          }}>
            {generatedResume}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
