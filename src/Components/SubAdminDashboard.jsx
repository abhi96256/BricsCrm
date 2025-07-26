import React, { useState } from 'react';
import './SubAdminDashboard.css';

const SubAdminDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Sample data
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Production Line Setup', 
      assignedTo: 'Sarah Employee', 
      assignedBy: 'Admin User',
      deadline: '2024-02-15',
      priority: 'High',
      machine: 'Machine A',
      status: 'In Progress',
      progress: 75
    },
    { 
      id: 2, 
      title: 'Quality Check', 
      assignedTo: 'Mike Worker', 
      assignedBy: 'Admin User',
      deadline: '2024-02-10',
      priority: 'Medium',
      machine: 'Machine B',
      status: 'Completed',
      progress: 100
    },
    { 
      id: 3, 
      title: 'Maintenance Check', 
      assignedTo: 'John Doe', 
      assignedBy: 'Admin User',
      deadline: '2024-02-20',
      priority: 'Low',
      machine: 'Machine C',
      status: 'Pending',
      progress: 0
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

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <div className="user-info">
          <h1>{currentUser?.name || 'Sub Admin'}</h1>
          <p className="role-indicator">Sub Admin Dashboard</p>
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
          <h3>ACTIVE TASKS</h3>
          <div className="widget-content">
            <div className="main-number">{tasks.filter(t => t.status !== 'Completed').length}</div>
            <div className="period">active tasks</div>
            <div className="sub-categories">
              <div className="sub-category">
                <span>In Progress ({tasks.filter(t => t.status === 'In Progress').length})</span>
              </div>
              <div className="sub-category">
                <span>Pending ({tasks.filter(t => t.status === 'Pending').length})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>TASK COMPLETION RATE</h3>
          <div className="widget-content">
            <div className="main-number">
              {Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100)}%
            </div>
            <div className="period">completion rate</div>
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
          <h3>MACHINE UTILIZATION</h3>
          <div className="widget-content">
            <div className="main-number">{machines.filter(m => m.status === 'Operational').length}</div>
            <div className="period">operational machines</div>
            <div className="sub-categories">
              <div className="sub-category">
                <span>Total ({machines.length})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>HIGH PRIORITY TASKS</h3>
          <div className="widget-content">
            <div className="main-number">{tasks.filter(t => t.priority === 'High').length}</div>
            <div className="period">high priority tasks</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaskManagement = () => (
    <div className="task-management-content">
      <div className="content-header">
        <h1>Task Management</h1>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => openModal('addTask')}>
            Add New Task
          </button>
        </div>
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
                <span><strong>Assigned to:</strong> {task.assignedTo}</span>
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
            </div>
            <div className="task-actions">
              <button className="action-btn small">Edit</button>
              <button className="action-btn small">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMachineManagement = () => (
    <div className="machine-management-content">
      <div className="content-header">
        <h1>Machine Management</h1>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => openModal('addMachine')}>
            Add New Machine
          </button>
        </div>
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
              <button className="action-btn small">Edit</button>
              <button className="action-btn small">Maintenance Log</button>
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
              {modalType === 'addTask' && 'Add New Task'}
              {modalType === 'addMachine' && 'Add New Machine'}
            </h2>
            <button className="close-btn" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            {modalType === 'addTask' && (
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" placeholder="Enter task title" />
                <label>Assign to Employee</label>
                <select>
                  <option value="Sarah Employee">Sarah Employee</option>
                  <option value="Mike Worker">Mike Worker</option>
                  <option value="John Doe">John Doe</option>
                </select>
                <label>Machine</label>
                <select>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.name}>{machine.name}</option>
                  ))}
                </select>
                <label>Deadline</label>
                <input type="date" />
                <label>Priority</label>
                <select>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="action-btn primary">Create Task</button>
                </div>
              </div>
            )}
            {modalType === 'addMachine' && (
              <div className="form-group">
                <label>Machine Name</label>
                <input type="text" placeholder="Enter machine name" />
                <label>Location</label>
                <input type="text" placeholder="Enter location" />
                <label>Status</label>
                <select>
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="action-btn primary">Add Machine</button>
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
        {activeTab === 'tasks' && renderTaskManagement()}
        {activeTab === 'machines' && renderMachineManagement()}
      </div>
      {renderModal()}
    </>
  );
};

export default SubAdminDashboard;

