import React, { useState } from 'react';
import './EmployeeDashboard.css';

const EmployeeDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskNotes, setTaskNotes] = useState('');

  // Sample data for employee tasks
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Production Line Setup', 
      assignedBy: 'Admin User',
      deadline: '2024-02-15',
      priority: 'High',
      machine: 'Machine A',
      status: 'In Progress',
      progress: 75,
      notes: 'Working on initial setup',
      employeeNotes: ''
    },
    { 
      id: 2, 
      title: 'Quality Check', 
      assignedBy: 'Manager User',
      deadline: '2024-02-10',
      priority: 'Medium',
      machine: 'Machine B',
      status: 'Pending',
      progress: 0,
      notes: 'Quality check required for batch #123',
      employeeNotes: ''
    },
    { 
      id: 3, 
      title: 'Maintenance Check', 
      assignedBy: 'Admin User',
      deadline: '2024-02-20',
      priority: 'Low',
      machine: 'Machine C',
      status: 'Completed',
      progress: 100,
      notes: 'Maintenance completed successfully',
      employeeNotes: 'All systems checked and working properly'
    }
  ]);

  const [machines, setMachines] = useState([
    { id: 1, name: 'Machine A', status: 'Operational', location: 'Production Floor 1' },
    { id: 2, name: 'Machine B', status: 'Maintenance', location: 'Production Floor 2' },
    { id: 3, name: 'Machine C', status: 'Operational', location: 'Production Floor 1' }
  ]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const openModal = (type, task = null) => {
    setModalType(type);
    setShowModal(true);
    if (task) {
      setSelectedTask(task);
      setTaskNotes(task.employeeNotes || '');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTask(null);
    setTaskNotes('');
  };

  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleUpdateProgress = (taskId, newProgress) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, progress: newProgress } : task
    ));
  };

  const handleSaveNotes = () => {
    if (!selectedTask) return;
    
    setTasks(prev => prev.map(task => 
      task.id === selectedTask.id 
        ? { ...task, employeeNotes: taskNotes }
        : task
    ));
    closeModal();
  };

  const handleCompleteTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'Completed', progress: 100 }
        : task
    ));
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
              {Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100)}%
            </div>
            <div className="period">task completion rate</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{
                  width: `${(tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>AVERAGE PROGRESS</h3>
          <div className="widget-content">
            <div className="main-number">
              {Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length)}%
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
                <span><strong>Machine:</strong> {task.machine}</span>
                <span><strong>Deadline:</strong> {task.deadline}</span>
                <span><strong>Status:</strong> {task.status}</span>
              </div>
              <div className="task-progress">
                <span>Progress: {task.progress}%</span>
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
                >
                  Mark Complete
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
              <button className="action-btn small">View Manual</button>
              <button className="action-btn small">Report Issue</button>
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
                    <p><strong>Machine:</strong> {selectedTask.machine}</p>
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
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="action-btn primary" onClick={handleSaveNotes}>Save Notes</button>
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

