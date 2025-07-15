import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultsPage = () => {
  const location = useLocation();

  const { evaluations = [], overallScore = 0 } = location.state || {};
  const [resumeFileName, setResumeFileName] = useState('');
  const [queryFileName, setQueryFileName] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/get_filenames')
      .then((res) => res.json())
      .then((data) => {
        setResumeFileName(data.resume_file);
        setQueryFileName(data.query_file);
      })
      .catch((err) => console.error("Failed to load filenames:", err));
  }, []);

  const getScoreColor = (score) => {
    if (score >= 7) return 'green';
    if (score >= 4) return 'orange';
    return 'red';
  };

  const colors = {
    tealDark: '#006D6D',
    teal: '#008080',
    tealLight: '#4FBFBF',
    greyLight: '#F5F5F5',
    grey: '#CCCCCC',
    greyDark: '#666666',
    black: '#000000',
  };

  return (
    <div>

      {/* Main Section */}
      <main style={{ padding: '60px 5% 100px' }}>
        {/* File Names */}
        <div style={{ marginBottom: '20px', color: colors.greyDark, fontSize: '1.1rem' }}>
          <p><strong>Resume File:</strong> {resumeFileName || 'Not uploaded'}</p>
          <p><strong>Query File:</strong> {queryFileName || 'Not uploaded'}</p>
        </div>

        {/* Overall Score */}
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: colors.tealDark }}>
            Overall Score:{' '}
            <span style={{
              color: 'white',
              backgroundColor: getScoreColor(overallScore),
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}>
              {overallScore.toFixed(2)}
            </span>
          </h2>
        </div>

        {/* Query Results Table */}
        <h2 style={{ color: colors.tealDark }}>Query Results</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.tealLight, color: 'white' }}>
              <th style={{ padding: '12px', border: '1px solid #ccc' }}>Q. No.</th>
              <th style={{ padding: '12px', border: '1px solid #ccc' }}>Query Details</th>
              <th style={{ padding: '12px', border: '1px solid #ccc' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: colors.greyDark }}>
                  Results not ready yet or no data available.
                </td>
              </tr>
            ) : evaluations.map((item, index) => {
              const resultData = item.result || {};
              return (
                <tr key={index}>
                  <td style={{
                    padding: '10px',
                    border: '1px solid #ccc',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </td>
                  <td style={{
                    padding: '10px',
                    border: '1px solid #ccc',
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap',
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#000', marginBottom: '10px' }}>
                      {item.question || item.query || 'No query provided'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#333' }}>
                      <div><strong>Status:</strong> {resultData.status || 'N/A'}</div>
                      <div><strong>Matched Keywords:</strong> {Array.isArray(resultData.matched_keywords) ? resultData.matched_keywords.join(', ') : 'None'}</div>
                      <div><strong>Missing Keywords:</strong> {Array.isArray(resultData.missing_keywords) ? resultData.missing_keywords.join(', ') : 'None'}</div>
                      <div><strong>Explanation:</strong> {resultData.explanation || 'No explanation provided.'}</div>
                    </div>
                  </td>
                  <td style={{
                    padding: '10px',
                    border: '1px solid #ccc',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: getScoreColor(resultData.score)
                  }}>
                    {resultData.score ?? 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default ResultsPage;
