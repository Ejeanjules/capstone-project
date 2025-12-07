import React, { useState, useEffect } from 'react';
import TopNavigation from './BottomNavigation';
import './BulkResumeAnalysisPage.css';

const BulkResumeAnalysisPage = ({ user, onLogout }) => {
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [expandedResults, setExpandedResults] = useState({});
  
  // Filter states
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all', 'excellent', 'good', 'fair', 'poor', 'custom'
  const [sortBy, setSortBy] = useState('score-desc'); // 'score-desc', 'score-asc', 'name-asc', 'name-desc'

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (!auth?.token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('/api/jobs/my-jobs/', {
        headers: {
          'Authorization': `Token ${auth.token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyJobs(data);
        console.log('Loaded jobs:', data);
      } else {
        console.error('Failed to fetch jobs:', response.status);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setError('');
  };

  const handleJobSelect = (e) => {
    setSelectedJobId(e.target.value);
    setError('');
    setResults(null);
  };

  const handleAnalyze = async () => {
    if (!selectedJobId) {
      setError('Please select a job posting');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one resume file');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    const formData = new FormData();
    formData.append('job_id', selectedJobId);
    selectedFiles.forEach((file) => {
      formData.append('resumes', file);
    });

    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      
      const response = await fetch('/api/jobs/bulk-analyze/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${auth.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Sort results by score (highest first)
        const sortedResults = [...data.results].sort((a, b) => b.score - a.score);
        setResults({ ...data, results: sortedResults });
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleExpand = (index) => {
    setExpandedResults(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleScoreFilterChange = (filterType) => {
    setScoreFilter(filterType);
    switch (filterType) {
      case 'excellent':
        setMinScore(80);
        setMaxScore(100);
        break;
      case 'good':
        setMinScore(70);
        setMaxScore(79);
        break;
      case 'fair':
        setMinScore(60);
        setMaxScore(69);
        break;
      case 'poor':
        setMinScore(0);
        setMaxScore(59);
        break;
      case 'all':
        setMinScore(0);
        setMaxScore(100);
        break;
      default:
        break;
    }
  };

  const getFilteredAndSortedResults = () => {
    if (!results || !results.results) return [];

    let filtered = results.results.filter(result => 
      result.score >= minScore && result.score <= maxScore
    );

    // Sort results
    switch (sortBy) {
      case 'score-desc':
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'score-asc':
        filtered.sort((a, b) => a.score - b.score);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.filename.localeCompare(a.filename));
        break;
      default:
        break;
    }

    return filtered;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    if (score >= 50) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'EXCEPTIONAL';
    if (score >= 80) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 60) return 'FAIR';
    if (score >= 50) return 'MARGINAL';
    return 'POOR';
  };

  const formatAnalysisData = (analysis) => {
    if (!analysis) return null;

    const categoryScores = analysis.category_scores || {};
    const matched = analysis.matched_keywords || {};
    const missing = analysis.missing_keywords || {};

    return (
      <div className="detailed-analysis">
        <div className="category-scores">
          <h4>Category Breakdown</h4>
          <div className="category-score-grid">
            <div className="category-score-item">
              <span className="category-label">Hard Skills</span>
              <div className="score-bar-container">
                <div 
                  className="score-bar" 
                  style={{ width: `${categoryScores.technical_skills || 0}%`, backgroundColor: getScoreColor(categoryScores.technical_skills || 0) }}
                ></div>
                <span className="score-percentage">{(categoryScores.technical_skills || 0).toFixed(1)}%</span>
              </div>
            </div>
            <div className="category-score-item">
              <span className="category-label">Education</span>
              <div className="score-bar-container">
                <div 
                  className="score-bar" 
                  style={{ width: `${categoryScores.education || 0}%`, backgroundColor: getScoreColor(categoryScores.education || 0) }}
                ></div>
                <span className="score-percentage">{(categoryScores.education || 0).toFixed(1)}%</span>
              </div>
            </div>
            <div className="category-score-item">
              <span className="category-label">Soft Skills</span>
              <div className="score-bar-container">
                <div 
                  className="score-bar" 
                  style={{ width: `${categoryScores.soft_skills || 0}%`, backgroundColor: getScoreColor(categoryScores.soft_skills || 0) }}
                ></div>
                <span className="score-percentage">{(categoryScores.soft_skills || 0).toFixed(1)}%</span>
              </div>
            </div>
            <div className="category-score-item">
              <span className="category-label">Experience</span>
              <div className="score-bar-container">
                <div 
                  className="score-bar" 
                  style={{ width: `${categoryScores.experience || 0}%`, backgroundColor: getScoreColor(categoryScores.experience || 0) }}
                ></div>
                <span className="score-percentage">{(categoryScores.experience || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="keywords-section">
          <div className="keyword-category">
            <h4>Hard Skills</h4>
            {matched.technical_skills && matched.technical_skills.length > 0 && (
              <div className="keyword-list">
                <span className="keyword-label">Matched:</span>
                {matched.technical_skills.map((kw, i) => (
                  <span key={i} className="keyword-badge matched">{kw}</span>
                ))}
              </div>
            )}
            {missing.technical_skills && missing.technical_skills.length > 0 && (
              <div className="keyword-list">
                <span className="keyword-label">Missing:</span>
                {missing.technical_skills.map((kw, i) => (
                  <span key={i} className="keyword-badge missing">{kw}</span>
                ))}
              </div>
            )}
          </div>

          {(matched.education?.length > 0 || missing.education?.length > 0) && (
            <div className="keyword-category">
              <h4>Education</h4>
              {matched.education && matched.education.length > 0 && (
                <div className="keyword-list">
                  <span className="keyword-label">Matched:</span>
                  {matched.education.map((kw, i) => (
                    <span key={i} className="keyword-badge matched">{kw}</span>
                  ))}
                </div>
              )}
              {missing.education && missing.education.length > 0 && (
                <div className="keyword-list">
                  <span className="keyword-label">Missing:</span>
                  {missing.education.map((kw, i) => (
                    <span key={i} className="keyword-badge missing">{kw}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {(matched.soft_skills?.length > 0 || missing.soft_skills?.length > 0) && (
            <div className="keyword-category">
              <h4>Soft Skills</h4>
              {matched.soft_skills && matched.soft_skills.length > 0 && (
                <div className="keyword-list">
                  <span className="keyword-label">Matched:</span>
                  {matched.soft_skills.map((kw, i) => (
                    <span key={i} className="keyword-badge matched">{kw}</span>
                  ))}
                </div>
              )}
              {missing.soft_skills && missing.soft_skills.length > 0 && (
                <div className="keyword-list">
                  <span className="keyword-label">Missing:</span>
                  {missing.soft_skills.map((kw, i) => (
                    <span key={i} className="keyword-badge missing">{kw}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {analysis.summary && (
          <div className="analysis-summary">
            <h4>Summary</h4>
            <pre>{analysis.summary}</pre>
          </div>
        )}
      </div>
    );
  };

  const selectedJob = myJobs.find(job => job.id === parseInt(selectedJobId));

  return (
    <div className="main-page page-with-top-nav">
      <TopNavigation user={user} onLogout={onLogout} />
      
      <main className="main-content">
        <div className="bulk-analysis-container">
          <div className="bulk-analysis-header">
            <h1>Bulk Resume Analysis</h1>
            <p>Analyze multiple resumes against a job posting without creating applications</p>
          </div>

          <div className="analysis-form">
            <div className="form-section">
              <label htmlFor="job-select">Select Job Posting</label>
              <select 
                id="job-select"
                value={selectedJobId} 
                onChange={handleJobSelect}
                className="job-select"
              >
                <option value="">-- Choose a job posting --</option>
                {myJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} at {job.company}
                  </option>
                ))}
              </select>

              {selectedJob && (
                <div className="selected-job-info">
                  <h3>{selectedJob.title}</h3>
                  <p className="company">{selectedJob.company} • {selectedJob.location}</p>
                  <p className="job-type">{selectedJob.job_type}</p>
                </div>
              )}
            </div>

        <div className="form-section">
          <label htmlFor="resume-upload">Upload Resumes</label>
          <input
            id="resume-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="file-input"
          />
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <p><strong>{selectedFiles.length}</strong> file(s) selected:</p>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing || !selectedJobId || selectedFiles.length === 0}
          className="analyze-button"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Resumes'}
        </button>
      </div>

      {results && (
        <div className="analysis-results">
          <div className="results-header">
            <h2>Analysis Results</h2>
            <div className="results-stats">
              <span className="stat success">✓ {results.success_count} Successful</span>
              {results.error_count > 0 && (
                <span className="stat error">✗ {results.error_count} Failed</span>
              )}
            </div>
          </div>

          {results.results.length > 0 && (
            <>
              {/* Filter Controls */}
              <div className="filter-controls">
                <div className="filter-section">
                  <label>Filter by Score:</label>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${scoreFilter === 'all' ? 'active' : ''}`}
                      onClick={() => handleScoreFilterChange('all')}
                    >
                      All ({results.results.length})
                    </button>
                    <button 
                      className={`filter-btn ${scoreFilter === 'excellent' ? 'active' : ''}`}
                      onClick={() => handleScoreFilterChange('excellent')}
                    >
                      Excellent (80%+)
                    </button>
                    <button 
                      className={`filter-btn ${scoreFilter === 'good' ? 'active' : ''}`}
                      onClick={() => handleScoreFilterChange('good')}
                    >
                      Good (70-79%)
                    </button>
                    <button 
                      className={`filter-btn ${scoreFilter === 'fair' ? 'active' : ''}`}
                      onClick={() => handleScoreFilterChange('fair')}
                    >
                      Fair (60-69%)
                    </button>
                    <button 
                      className={`filter-btn ${scoreFilter === 'poor' ? 'active' : ''}`}
                      onClick={() => handleScoreFilterChange('poor')}
                    >
                      Below 60%
                    </button>
                  </div>
                </div>

                <div className="filter-section">
                  <label>Custom Range:</label>
                  <div className="range-inputs">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={minScore}
                      onChange={(e) => {
                        setMinScore(Number(e.target.value));
                        setScoreFilter('custom');
                      }}
                      className="range-input"
                      placeholder="Min %"
                    />
                    <span className="range-separator">to</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={maxScore}
                      onChange={(e) => {
                        setMaxScore(Number(e.target.value));
                        setScoreFilter('custom');
                      }}
                      className="range-input"
                      placeholder="Max %"
                    />
                  </div>
                </div>

                <div className="filter-section">
                  <label>Sort by:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="score-desc">Score (High to Low)</option>
                    <option value="score-asc">Score (Low to High)</option>
                    <option value="name-asc">Name (A to Z)</option>
                    <option value="name-desc">Name (Z to A)</option>
                  </select>
                </div>
              </div>

              {/* Filtered Results Display */}
              {(() => {
                const filteredResults = getFilteredAndSortedResults();
                return (
                  <>
                    {filteredResults.length > 0 ? (
                      <>
                        <div className="filtered-count">
                          Showing {filteredResults.length} of {results.results.length} results
                        </div>
                        <div className="results-list">
                          {filteredResults.map((result, index) => (
                            <div key={index} className="result-card">
                              <div className="result-header" onClick={() => toggleExpand(index)}>
                                <div className="result-info">
                                  <span className="result-rank">#{index + 1}</span>
                                  <h3>{result.filename}</h3>
                                </div>
                                <div className="result-score">
                                  <div 
                                    className="score-circle"
                                    style={{ borderColor: getScoreColor(result.score) }}
                                  >
                                    <span className="score-value" style={{ color: getScoreColor(result.score) }}>
                                      {result.score.toFixed(1)}%
                                    </span>
                                    <span className="score-label">{getScoreLabel(result.score)}</span>
                                  </div>
                                  <button className="expand-button">
                                    {expandedResults[index] ? '▼' : '▶'}
                                  </button>
                                </div>
                              </div>
                              
                              {expandedResults[index] && (
                                <div className="result-details">
                                  {formatAnalysisData(result.analysis)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="no-results">
                        <p>No results match your filter criteria.</p>
                        <button 
                          className="reset-filter-btn"
                          onClick={() => handleScoreFilterChange('all')}
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}

          {results.errors.length > 0 && (
            <div className="errors-section">
              <h3>Errors</h3>
              {results.errors.map((err, index) => (
                <div key={index} className="error-item">
                  <strong>{err.filename}:</strong> {err.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </main>
    </div>
  );
};

export default BulkResumeAnalysisPage;
