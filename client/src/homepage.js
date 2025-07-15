import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [queryFile, setQueryFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [queryName, setQueryName] = useState('');
  const [evaluatedResumes, setEvaluatedResumes] = useState([]);
  const resumeInputRef = useRef(null);
  const queryInputRef = useRef(null);
  const navigate = useNavigate();
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [queryUploaded, setQueryUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  const colors = {
    tealDark: '#006D6D',
    teal: '#008080',
    tealLight: '#4FBFBF',
    greyLight: '#F5F5F5',
    grey: '#CCCCCC',
    greyDark: '#666666',
    black: '#000000',
  };

  useEffect(() => {
  fetch('http://localhost:5000/get_filenames')
    .then(res => res.json())
    .then(data => {
      if (data.evaluated_resumes) {
        setEvaluatedResumes(data.evaluated_resumes);
      }
      if (data.resume_file) setResumeName(data.resume_file);
      if (data.query_file) setQueryName(data.query_file);
    })
    .catch(err => {
      console.error("Failed to load evaluated resumes:", err);
    });
}, []);


  // Inject spinner animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .spinner {
        margin-left: 15px;
        width: 25px;
        height: 25px;
        border: 3px solid #ccc;
        border-top: 3px solid #006D6D;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const spinnerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.tealDark
  };

  const uploadResume = async () => {
    if (!resumeFile) {
      alert('Please select a resume file first.');
      return;
    }
    const resumeForm = new FormData();
    resumeForm.append('resume', resumeFile);
    try {
      const res = await fetch('http://localhost:5000/upload_resume', {
        method: 'POST',
        body: resumeForm,
      });
      const data = await res.json();
      if (res.ok) {
        setResumeUploaded(true);
        setResumeName(data.file);
      } else {
        alert(data.error || 'Resume upload failed');
      }
    } catch (err) {
      alert('Resume upload error. Please try again.');
    }
  };

  const uploadQuery = async () => {
    if (!queryFile) {
      alert('Please select a query file first.');
      return;
    }
    const queryForm = new FormData();
    queryForm.append('query', queryFile);
    try {
      const res = await fetch('http://localhost:5000/upload_query', {
        method: 'POST',
        body: queryForm,
      });
      const data = await res.json();
      if (res.ok) {
        setQueryUploaded(true);
        setQueryName(data.file);
      } else {
        alert(data.error || 'Query upload failed');
      }
    } catch (err) {
      alert('Query upload error. Please try again.');
    }
  };

  const handleResumeClick = () => resumeInputRef.current?.click();
  const handleQueryClick = () => queryInputRef.current?.click();

  const handleCheckResult = async () => {
    if (!resumeUploaded || !queryUploaded) {
      alert('Please upload both resume and query files before checking results.');
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      try {
        const res = await fetch('http://localhost:5000/check_result', { method: 'POST' });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('Server error:', errorText);
          alert("Server returned an error. Try again later.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        const evaluations = data.evaluations || [];
        const overallScore = data.overall_score || 0;

        if (evaluations.length === 0) {
          alert("LLM might not have returned valid results yet. Try again in a few seconds.");
          setLoading(false);
          return;
        }

        const formattedResults = evaluations.map(item => {
          let scoreRaw = item.result?.score;
          let score = 0;
          if (typeof scoreRaw === 'string') {
            if (scoreRaw.toLowerCase() === 'n/a') score = 0;
            else if (scoreRaw.includes('/')) score = parseFloat(scoreRaw.split('/')[0]);
            else score = parseFloat(scoreRaw);
          } else if (typeof scoreRaw === 'number') {
            score = scoreRaw;
          }
          return {
            query: item.question,
            score: isNaN(score) ? 0 : score,
          };
        });

        const resumeInfo = {
          resume: resumeName,
          query: queryName,
          score: overallScore,
        };

        setEvaluatedResumes(prev => [...prev, resumeInfo]);
        setUploadSuccessMessage("Analysis completed. Results are ready!");
        setLoading(false);
        navigate('/results', {
          state: {
            result: formattedResults,
            overallScore: overallScore,
            evaluations: evaluations
          },
        });
      } catch (error) {
        console.error('Check result failed:', error);
        setLoading(false);
        alert("Something went wrong during analysis.");
      }
    }, 0);
  };
  const filteredResumes = evaluatedResumes.filter(item =>
  item.resume.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <div>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '100px', fontFamily: 'sans-serif' }}>
        <p style={{
          fontSize: '18px',
          color: '#333',
          marginBottom: '10px',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          Click the button below to upload your resume and query file for automatic analysis and scoring.
        </p>
        <button
          onClick={() => setShowUploadOptions(!showUploadOptions)}
          style={{
            backgroundColor: colors.teal,
            color: 'white',
            padding: '16px 32px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '20px',
            fontSize: '20px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
          Evaluate
        </button>

        {showUploadOptions && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 0 25px rgba(0,0,0,0.3)',
              width: '90%',
              maxWidth: '500px',
              position: 'relative'
            }}>
              <button onClick={() => setShowUploadOptions(false)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: colors.greyDark }}>✕</button>
              <p>Please upload a PDF resume and a CSV query file.</p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>Resume:</label>
                <div onClick={handleResumeClick} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9', cursor: 'pointer' }}>
                  {resumeName || 'Click to select a PDF resume'}
                </div>
                <input type="file" accept=".pdf" ref={resumeInputRef} onChange={(e) => {
                  setResumeName(e.target.files[0]?.name || '');
                  setResumeFile(e.target.files[0]);
                }} style={{ display: 'none' }} />
                <button onClick={uploadResume} style={{ marginTop: '10px', backgroundColor: colors.teal, padding: '10px', border: 'none', borderRadius: '5px', color: 'white' }}>Upload Resume</button>
                {resumeUploaded && <span style={{ color: 'green', marginLeft: '10px' }}>✔</span>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>Query File:</label>
                <div onClick={handleQueryClick} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9', cursor: 'pointer' }}>
                  {queryName || 'Click to select a CSV query file'}
                </div>
                <input type="file" accept=".csv" ref={queryInputRef} onChange={(e) => {
                  setQueryName(e.target.files[0]?.name || '');
                  setQueryFile(e.target.files[0]);
                }} style={{ display: 'none' }} />
                <button onClick={uploadQuery} style={{ marginTop: '10px', backgroundColor: colors.teal, padding: '10px', border: 'none', borderRadius: '5px', color: 'white' }}>Upload Query</button>
                {queryUploaded && <span style={{ color: 'green', marginLeft: '10px' }}>✔</span>}
              </div>

              <button onClick={handleCheckResult} style={{ marginTop: '20px', backgroundColor: colors.tealDark, padding: '12px', border: 'none', borderRadius: '6px', color: 'white' }}>Check Result</button>
              {uploadSuccessMessage && <p style={{ color: 'green', marginTop: '10px' }}>{uploadSuccessMessage}</p>}
            </div>
          </div>
        )}

        {loading && (
          <div style={spinnerStyle}>
            Analyzing with LLM...
            <div className="spinner" />
          </div>
        )}

        <div style={{ marginTop: '40px', width: '90%', maxWidth: '800px' }}>
  <h2 style={{ textAlign: 'center', marginBottom: '20px', color: colors.tealDark }}>
    Evaluated Resumes
  </h2>

  <div style={{ marginBottom: '20px', textAlign: 'right' }}>
  <input
    type="text"
    placeholder="Search by resume name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      padding: '8px 12px',
      borderRadius: '6px',
      border: `1px solid ${colors.grey}`,
      fontSize: '14px',
      width: '250px'
    }}
  />
</div>


  <table style={{
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'sans-serif',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <thead style={{ backgroundColor: colors.tealLight, color: 'white' }}>
      <tr>
        <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Resume File</th>
        <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Query File</th>
        <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Overall Score</th>
      </tr>
    </thead>
    <tbody>
      {evaluatedResumes.length === 0 ? (
        <tr>
          <td colSpan="3" style={{
            padding: '16px',
            textAlign: 'center',
            color: colors.greyDark,
            fontStyle: 'italic',
            backgroundColor: '#fafafa'
          }}>
            No evaluations found.
          </td>
        </tr>
      ) : (
      filteredResumes.map((item, index) => (
          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
            <td style={{ padding: '10px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>{item.resume}</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>{item.query}</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>{item.score}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      </main>
    </div>
  );
}
