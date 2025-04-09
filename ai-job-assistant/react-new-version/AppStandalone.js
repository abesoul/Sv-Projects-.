// For react.new, copy everything below this line
import React, { useState, useEffect } from 'react';

// Tech job categories and career paths
const TECH_CATEGORIES = {
  "Software Development & Engineering": {
    icon: "💻",
    roles: [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Mobile App Developer",
      "Game Developer",
      "Embedded Systems Developer",
      "DevOps Engineer",
      "Software Architect",
      "API Developer",
      "Firmware Engineer",
      "Test Automation Engineer"
    ],
    careerPath: {
      "Entry Level": {
        skills: ["HTML/CSS", "JavaScript", "Git", "Basic algorithms", "One programming language"],
        experience: "0-2 years",
        salary: "$60,000 - $85,000"
      },
      "Mid Level": {
        skills: ["Advanced JavaScript", "Framework expertise", "System design", "CI/CD", "Cloud platforms"],
        experience: "3-5 years",
        salary: "$85,000 - $130,000"
      },
      "Senior Level": {
        skills: ["Architecture patterns", "Team leadership", "Complex system design", "Performance optimization", "Technical strategy"],
        experience: "5+ years",
        salary: "$130,000 - $200,000+"
      }
    }
  },
  "Data & Analytics": {
    icon: "📊",
    roles: [
      "Data Scientist",
      "Data Engineer",
      "Data Analyst",
      "Machine Learning Engineer",
      "AI Researcher",
      "Business Intelligence Analyst",
      "Database Administrator",
      "Big Data Engineer",
      "NLP Engineer"
    ],
    careerPath: {
      "Entry Level": {
        skills: ["Python", "SQL", "Statistics", "Data visualization", "Basic ML"],
        experience: "0-2 years",
        salary: "$65,000 - $90,000"
      },
      "Mid Level": {
        skills: ["Advanced ML algorithms", "Big Data tools", "Cloud platforms", "Deep Learning", "Production ML"],
        experience: "3-5 years",
        salary: "$90,000 - $140,000"
      },
      "Senior Level": {
        skills: ["ML architecture", "Team leadership", "Research methods", "MLOps", "Business strategy"],
        experience: "5+ years",
        salary: "$140,000 - $220,000+"
      }
    }
  },
  "Cybersecurity & IT Security": {
    icon: "🔒",
    roles: [
      "Cybersecurity Analyst",
      "Penetration Tester",
      "Security Engineer",
      "Security Architect",
      "SOC Analyst",
      "Cryptography Engineer",
      "Compliance & Risk Analyst",
      "IAM Engineer"
    ],
    careerPath: {
      "Entry Level": {
        skills: ["Network fundamentals", "Security tools", "Linux", "Basic scripting", "Security concepts"],
        experience: "0-2 years",
        salary: "$65,000 - $90,000"
      },
      "Mid Level": {
        skills: ["Advanced security tools", "Threat analysis", "Incident response", "Security automation", "Compliance"],
        experience: "3-5 years",
        salary: "$90,000 - $140,000"
      },
      "Senior Level": {
        skills: ["Security architecture", "Team leadership", "Risk management", "Security strategy", "Advanced threats"],
        experience: "5+ years",
        salary: "$140,000 - $220,000+"
      }
    }
  }
};

// Mock user data
const MOCK_USERS = [
  { email: "demo@example.com", password: "demo123", fullName: "Demo User" }
];

// Login Component
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleEmailLogin = (e) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin({ email: user.email, fullName: user.fullName });
    } else {
      setError("Invalid email or password");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleGoogleLogin = () => {
    onLogin({ email: "google@example.com", fullName: "Google User" });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '30px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>AI Job Assistant</h1>
        
        {error && (
          <div style={{
            backgroundColor: '#440000',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} style={{ marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#2c2c2c',
              border: '1px solid #333',
              borderRadius: '4px',
              color: 'white'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              backgroundColor: '#2c2c2c',
              border: '1px solid #333',
              borderRadius: '4px',
              color: 'white'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            Login with Email
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#ffffff"
              d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
            />
            <path
              fill="#ffffff"
              d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
            />
            <path
              fill="#ffffff"
              d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
            />
            <path
              fill="#ffffff"
              d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
    setSelectedCategory(null);
    setSelectedRole(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError("Please select a PDF file");
      return;
    }
    setResumeFile(file);
    // Mock resume data
    setResumeData({
      personalInfo: {
        fullName: "John Doe",
        title: "Senior Software Engineer",
        location: "San Francisco, CA"
      },
      skills: [
        "JavaScript",
        "React",
        "Node.js",
        "Python",
        "AWS"
      ],
      experience: "5 years",
      education: "BS Computer Science",
      certifications: [
        "AWS Certified Developer",
        "MongoDB Certified"
      ]
    });
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{
      backgroundColor: "black",
      color: "white",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <h1>AI Job Assistant</h1>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}>
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

        {/* Resume Upload Section */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px" }}>Upload Your Resume</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            style={{ marginBottom: "10px" }}
          />
          {uploadError && (
            <div style={{
              color: "#ff4444",
              marginTop: "10px"
            }}>
              {uploadError}
            </div>
          )}
          {resumeData && (
            <div style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#1a1a1a",
              borderRadius: "8px"
            }}>
              <h3 style={{ marginBottom: "15px" }}>Extracted Information</h3>
              <div style={{ marginBottom: "15px" }}>
                <strong>Name:</strong> {resumeData.personalInfo.fullName}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Title:</strong> {resumeData.personalInfo.title}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Location:</strong> {resumeData.personalInfo.location}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Skills:</strong>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "10px"
                }}>
                  {resumeData.skills.map((skill) => (
                    <div
                      key={skill}
                      style={{
                        backgroundColor: "#2c2c2c",
                        padding: "5px 10px",
                        borderRadius: "15px",
                        fontSize: "0.9em"
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Experience:</strong> {resumeData.experience}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Education:</strong> {resumeData.education}
              </div>
              <div>
                <strong>Certifications:</strong>
                <ul style={{ marginTop: "10px" }}>
                  {resumeData.certifications.map((cert) => (
                    <li key={cert}>{cert}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px" }}>Tech Career Categories</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {Object.entries(TECH_CATEGORIES).map(([category, data]) => (
              <div
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  backgroundColor: selectedCategory === category ? "#2c2c2c" : "#1a1a1a",
                  padding: "20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: "1px solid #333",
                  transition: "transform 0.2s"
                }}
              >
                <div style={{
                  fontSize: "2em",
                  marginBottom: "10px"
                }}>
                  {data.icon}
                </div>
                <h3 style={{ marginBottom: "10px" }}>{category}</h3>
                <div style={{ color: "#666" }}>
                  {data.roles.length} roles • {Object.keys(data.careerPath).length} career levels
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Category Details */}
        {selectedCategory && (
          <div style={{ marginTop: "40px" }}>
            <h2>{TECH_CATEGORIES[selectedCategory].icon} {selectedCategory}</h2>
            
            {/* Career Paths */}
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "15px", color: "#4285f4" }}>Career Path</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px"
              }}>
                {Object.entries(TECH_CATEGORIES[selectedCategory].careerPath).map(([level, details]) => (
                  <div
                    key={level}
                    style={{
                      backgroundColor: "#1a1a1a",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid #333"
                    }}
                  >
                    <h4 style={{ color: "#4285f4", marginBottom: "10px" }}>{level}</h4>
                    <div style={{ marginBottom: "15px" }}>
                      <div><strong>Experience:</strong> {details.experience}</div>
                      <div><strong>Salary Range:</strong> {details.salary}</div>
                    </div>
                    <div>
                      <strong>Required Skills:</strong>
                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "5px",
                        marginTop: "5px"
                      }}>
                        {details.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: "#2c2c2c",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.9em"
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Roles */}
            <div style={{ marginTop: "40px" }}>
              <h3 style={{ marginBottom: "15px", color: "#4285f4" }}>Available Roles</h3>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "15px"
              }}>
                {TECH_CATEGORIES[selectedCategory].roles.map((role) => (
                  <div
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    style={{
                      backgroundColor: selectedRole === role ? "#2c2c2c" : "#1a1a1a",
                      padding: "10px 20px",
                      borderRadius: "20px",
                      cursor: "pointer",
                      border: "1px solid #333"
                    }}
                  >
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
