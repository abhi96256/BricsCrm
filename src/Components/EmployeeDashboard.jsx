import React, { useState, useEffect } from 'react';
import './EmployeeDashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

const EmployeeDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [taskNotes, setTaskNotes] = useState('');
  const [issueReport, setIssueReport] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Technical'
  });
  const [tasks, setTasks] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  // Fetch all data on mount
  useEffect(() => {
    fetchTasks();
    fetchMachines();
  }, []);

  const fetchTasks = async () => {
    try {
      // Use backend filtering for Employee role
      if (currentUser && currentUser.role === 'Employee' && currentUser.id) {
        const response = await fetch(`${API_BASE_URL}/tasks/filter/${currentUser.id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data.data);
        }
      } else {
        // Fallback to frontend filtering
        const response = await fetch(`${API_BASE_URL}/tasks`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMachines(data.data);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setShowModal(true);
    if (type === 'viewTask' && item) {
      setSelectedTask(item);
      setTaskNotes(item.employeeNotes || '');
    }
    if (type === 'addNotes' && item) {
      setSelectedTask(item);
      setTaskNotes(item.employeeNotes || '');
    }
    if (type === 'viewManual' && item) {
      setSelectedMachine(item);
    }
    if (type === 'reportIssue' && item) {
      setSelectedMachine(item);
      setIssueReport({
        title: '',
        description: '',
        priority: 'Medium',
        category: 'Technical'
      });
    }
    if (type === 'updateProgress' && item) {
      setSelectedTask(item);
      setProgressValue(item.progress || 0);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTask(null);
    setSelectedMachine(null);
    setTaskNotes('');
    setProgressValue(0);
    setIssueReport({
      title: '',
      description: '',
      priority: 'Medium',
      category: 'Technical'
    });
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        await fetchTasks();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error updating task status.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (taskId, newProgress) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress: newProgress })
      });
      if (response.ok) {
        await fetchTasks();
        if (selectedTask) {
          closeModal();
          alert('Progress updated successfully!');
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error updating task progress.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedTask) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${selectedTask.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: taskNotes })
      });
      if (response.ok) {
        await fetchTasks();
        closeModal();
        alert('Notes saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error saving notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'Completed', 
          progress: 100 
        })
      });
      if (response.ok) {
        await fetchTasks();
        alert('Task completed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error completing task.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = async () => {
    if (!issueReport.title || !issueReport.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      // Create a new task for the issue report
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Issue Report: ${issueReport.title}`,
          description: `Machine: ${selectedMachine.name}\nCategory: ${issueReport.category}\nPriority: ${issueReport.priority}\n\nIssue Description:\n${issueReport.description}`,
          assignedTo: '3', // Assign to Manager (John)
          machine: selectedMachine.id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          priority: issueReport.priority,
          category: 'Issue Report'
        })
      });
      
      if (response.ok) {
        closeModal();
        alert('Issue reported successfully! It has been assigned to a manager for review.');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      alert('Error reporting issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueInputChange = (e) => {
    const { name, value } = e.target;
    setIssueReport(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <div className="user-info">
          <h1>{currentUser?.name || 'Employee'}</h1>
          <p className="role-indicator">Employee Dashboard</p>
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeFilter === 'today' ? 'active' : ''}`}
            onClick={() => handleFilterChange('today')}
          >
            Today
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'week' ? 'active' : ''}`}
            onClick={() => handleFilterChange('week')}
          >
            Week
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'month' ? 'active' : ''}`}
            onClick={() => handleFilterChange('month')}
          >
            Month
          </button>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="dashboard-widgets">
        <div className="widget">
          <h3>MY TASKS</h3>
          <div className="widget-content">
            <div className="main-number">{tasks.length}</div>
            <div className="period">total assigned tasks</div>
            <div className="sub-categories">
              <div className="sub-category">
                <span>In Progress ({tasks.filter(t => t.status === 'In Progress').length})</span>
              </div>
              <div className="sub-category">
                <span>Pending ({tasks.filter(t => t.status === 'Pending').length})</span>
              </div>
              <div className="sub-category">
                <span>Completed ({tasks.filter(t => t.status === 'Completed').length})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>COMPLETION RATE</h3>
          <div className="widget-content">
            <div className="main-number">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0}%
            </div>
            <div className="period">task completion rate</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{
                  width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>AVERAGE PROGRESS</h3>
          <div className="widget-content">
            <div className="main-number">
              {tasks.length > 0 ? Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length) : 0}%
            </div>
            <div className="period">overall progress</div>
          </div>
        </div>

        <div className="widget">
          <h3>UPCOMING DEADLINES</h3>
          <div className="widget-content">
            <div className="main-number">
              {tasks.filter(t => t.status !== 'Completed' && new Date(t.deadline) > new Date()).length}
            </div>
            <div className="period">tasks with deadlines</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaskAccess = () => (
    <div className="task-access-content">
      <div className="content-header">
        <h1>My Tasks</h1>
      </div>

      <div className="tasks-grid">
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3>{task.title}</h3>
              <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            </div>
            <div className="task-details">
              <div className="task-info">
                <span><strong>Assigned by:</strong> {task.assignedBy}</span>
                <span><strong>Machine:</strong> {task.machine ? (typeof task.machine === 'string' ? task.machine : task.machine.name) : 'Not assigned'}</span>
                <span><strong>Deadline:</strong> {task.deadline}</span>
                <span><strong>Status:</strong> {task.status}</span>
              </div>
              <div className="task-progress">
                <div className="progress-header">
                  <span>Progress: {task.progress}%</span>
                  {task.status !== 'Completed' && (
                    <button 
                      className="action-btn small primary"
                      onClick={() => openModal('updateProgress', task)}
                    >
                      Update Progress
                    </button>
                  )}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${task.progress}%`}}></div>
                </div>
              </div>
              {task.notes && (
                <div className="task-notes">
                  <strong>Task Description:</strong> {task.notes}
                </div>
              )}
              {task.employeeNotes && (
                <div className="employee-notes">
                  <strong>My Notes:</strong> {task.employeeNotes}
                </div>
              )}
            </div>
            <div className="task-actions">
              <button 
                className="action-btn small" 
                onClick={() => openModal('viewTask', task)}
              >
                View Details
              </button>
              <button 
                className="action-btn small" 
                onClick={() => openModal('addNotes', task)}
              >
                Add Notes
              </button>
              {task.status !== 'Completed' && (
                <button 
                  className="action-btn small success" 
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={loading}
                >
                  {loading ? 'Completing...' : 'Mark Complete'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMachineInfo = () => (
    <div className="machine-info-content">
      <div className="content-header">
        <h1>Machine Information</h1>
      </div>

      <div className="machines-grid">
        {machines.map(machine => (
          <div key={machine.id} className="machine-card">
            <div className="machine-header">
              <h3>{machine.name}</h3>
              <span className={`status-badge ${machine.status.toLowerCase()}`}>
                {machine.status}
              </span>
            </div>
            <div className="machine-details">
              <span><strong>Location:</strong> {machine.location}</span>
              <span><strong>Last Maintenance:</strong> 2024-01-15</span>
              <span><strong>Next Maintenance:</strong> 2024-02-15</span>
            </div>
            <div className="machine-actions">
              <button 
                className="action-btn small" 
                onClick={() => openModal('viewManual', machine)}
              >
                View Manual
              </button>
              <button 
                className="action-btn small warning" 
                onClick={() => openModal('reportIssue', machine)}
              >
                Report Issue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              {modalType === 'viewTask' && 'Task Details'}
              {modalType === 'addNotes' && 'Add Notes'}
              {modalType === 'updateProgress' && 'Update Progress'}
              {modalType === 'viewManual' && 'Machine Manual'}
              {modalType === 'reportIssue' && 'Report Issue'}
            </h2>
            <button className="close-btn" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            {modalType === 'viewTask' && selectedTask && (
              <div className="task-detail-view">
                <div className="detail-section">
                  <h3>{selectedTask.title}</h3>
                  <div className="detail-info">
                    <p><strong>Assigned by:</strong> {selectedTask.assignedBy}</p>
                    <p><strong>Machine:</strong> {selectedTask.machine ? (typeof selectedTask.machine === 'string' ? selectedTask.machine : selectedTask.machine.name) : 'Not assigned'}</p>
                    <p><strong>Deadline:</strong> {selectedTask.deadline}</p>
                    <p><strong>Priority:</strong> {selectedTask.priority}</p>
                    <p><strong>Status:</strong> {selectedTask.status}</p>
                    <p><strong>Progress:</strong> {selectedTask.progress}%</p>
                  </div>
                  <div className="task-description">
                    <h4>Task Description:</h4>
                    <p>{selectedTask.notes}</p>
                  </div>
                  {selectedTask.employeeNotes && (
                    <div className="employee-notes">
                      <h4>My Notes:</h4>
                      <p>{selectedTask.employeeNotes}</p>
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                  <button 
                    className="action-btn primary" 
                    onClick={() => openModal('addNotes', selectedTask)}
                  >
                    Add Notes
                  </button>
                </div>
              </div>
            )}
            {modalType === 'addNotes' && selectedTask && (
              <div className="form-group">
                <label>Add Notes/Comments</label>
                <textarea 
                  value={taskNotes} 
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Add your notes or comments about this task..."
                  rows="5"
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleSaveNotes}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'viewManual' && selectedMachine && (
              <div className="manual-view">
                <div className="detail-section">
                  <h3>{selectedMachine.name} - Operating Manual</h3>
                  
                  <div className="manual-section">
                    <h4>📋 Basic Information</h4>
                    <div className="detail-info">
                      <p><strong>Model:</strong> {selectedMachine.model || 'Not specified'}</p>
                      <p><strong>Serial Number:</strong> {selectedMachine.serialNumber || 'Not specified'}</p>
                      <p><strong>Location:</strong> {selectedMachine.location}</p>
                      <p><strong>Status:</strong> {selectedMachine.status}</p>
                      <p><strong>Department:</strong> {selectedMachine.department || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="manual-section">
                    <h4>⚙️ Operating Instructions</h4>
                    <div className="manual-content">
                      <h5>1. Startup Procedure</h5>
                      <ol>
                        <li>Check machine status indicator lights</li>
                        <li>Ensure safety guards are in place</li>
                        <li>Press the green START button</li>
                        <li>Wait for initialization (30-60 seconds)</li>
                        <li>Verify all systems are operational</li>
                      </ol>

                      <h5>2. Normal Operation</h5>
                      <ul>
                        <li>Monitor performance indicators</li>
                        <li>Check for unusual noises or vibrations</li>
                        <li>Maintain proper material feed rates</li>
                        <li>Record production data as required</li>
                      </ul>

                      <h5>3. Shutdown Procedure</h5>
                      <ol>
                        <li>Stop material feed</li>
                        <li>Press the red STOP button</li>
                        <li>Wait for complete shutdown (15-30 seconds)</li>
                        <li>Clean work area</li>
                        <li>Lock out machine if leaving unattended</li>
                      </ol>
                    </div>
                  </div>

                  {selectedMachine.specifications && (
                    <div className="manual-section">
                      <h4>📊 Technical Specifications</h4>
                      <div className="specs-grid">
                        {Object.entries(selectedMachine.specifications).map(([key, value]) => (
                          <div key={key} className="spec-item">
                            <strong>{key}:</strong> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="manual-section">
                    <h4>⚠️ Safety Guidelines</h4>
                    <div className="safety-content">
                      <ul>
                        <li>Always wear appropriate PPE (Personal Protective Equipment)</li>
                        <li>Never bypass safety interlocks or guards</li>
                        <li>Keep hands and loose clothing away from moving parts</li>
                        <li>Report any safety concerns immediately</li>
                        <li>Follow lockout/tagout procedures for maintenance</li>
                      </ul>
                    </div>
                  </div>

                  <div className="manual-section">
                    <h4>🔧 Troubleshooting</h4>
                    <div className="troubleshooting-content">
                      <div className="trouble-item">
                        <strong>Machine won't start:</strong>
                        <ul>
                          <li>Check power supply and circuit breakers</li>
                          <li>Verify emergency stop is not engaged</li>
                          <li>Check for error messages on display</li>
                        </ul>
                      </div>
                      <div className="trouble-item">
                        <strong>Unusual noises:</strong>
                        <ul>
                          <li>Stop machine immediately</li>
                          <li>Check for loose parts or obstructions</li>
                          <li>Contact maintenance if problem persists</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                  <button 
                    className="action-btn warning" 
                    onClick={() => openModal('reportIssue', selectedMachine)}
                  >
                    Report Issue
                  </button>
                </div>
              </div>
            )}
            {modalType === 'updateProgress' && selectedTask && (
              <div className="form-group">
                <h4>Update Progress for: {selectedTask.title}</h4>
                
                <label>Progress Percentage: {progressValue}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value))}
                  className="progress-slider"
                />
                
                <div className="progress-preview">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${progressValue}%`}}></div>
                  </div>
                  <span>{progressValue}%</span>
                </div>
                
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={() => handleUpdateProgress(selectedTask.id, progressValue)}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Progress'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'reportIssue' && selectedMachine && (
              <div className="form-group">
                <h4>Report Issue for {selectedMachine.name}</h4>
                
                <label>Issue Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={issueReport.title}
                  onChange={handleIssueInputChange}
                  placeholder="Brief description of the issue"
                />
                
                <label>Issue Category</label>
                <select 
                  name="category"
                  value={issueReport.category}
                  onChange={handleIssueInputChange}
                >
                  <option value="Technical">Technical Issue</option>
                  <option value="Safety">Safety Concern</option>
                  <option value="Performance">Performance Problem</option>
                  <option value="Maintenance">Maintenance Required</option>
                  <option value="Other">Other</option>
                </select>
                
                <label>Priority Level</label>
                <select 
                  name="priority"
                  value={issueReport.priority}
                  onChange={handleIssueInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                
                <label>Detailed Description *</label>
                <textarea 
                  name="description"
                  value={issueReport.description}
                  onChange={handleIssueInputChange}
                  placeholder="Please provide detailed information about the issue, including when it occurred, what you were doing, and any error messages..."
                  rows="6"
                />
                
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn warning" 
                    onClick={handleReportIssue}
                    disabled={loading}
                  >
                    {loading ? 'Reporting...' : 'Report Issue'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'tasks' && renderTaskAccess()}
        {activeTab === 'machines' && renderMachineInfo()}
      </div>
      {renderModal()}
    </>
  );
};

export default EmployeeDashboard;

