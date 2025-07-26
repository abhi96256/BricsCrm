import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ManagerDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ManagerDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [reassignData, setReassignData] = useState({
    newEmployee: '',
    notes: ''
  });

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
      progress: 75,
      notes: 'Working on initial setup'
    },
    { 
      id: 2, 
      title: 'Quality Check', 
      assignedTo: 'Mike Worker', 
      assignedBy: 'Admin User',
      deadline: '2024-02-10',
      priority: 'Medium',
      machine: 'Machine B',
      status: 'Pending Approval',
      progress: 100,
      notes: 'Task completed, waiting for approval'
    },
    { 
      id: 3, 
      title: 'Maintenance Check', 
      assignedTo: 'Sarah Employee', 
      assignedBy: 'Admin User',
      deadline: '2024-02-20',
      priority: 'Low',
      machine: 'Machine C',
      status: 'Completed',
      progress: 100,
      notes: 'Maintenance completed successfully'
    }
  ]);

  const [employees, setEmployees] = useState([
    { 
      id: 1, 
      name: 'Sarah Employee', 
      status: 'Active', 
      currentTask: 'Production Line Setup',
      tasksCompleted: 45,
      totalTasks: 50,
      efficiency: 92,
      averageCompletionTime: '2.3 days',
      currentTasks: 2,
      pendingTasks: 1
    },
    { 
      id: 2, 
      name: 'Mike Worker', 
      status: 'Active', 
      currentTask: 'Quality Check',
      tasksCompleted: 38,
      totalTasks: 45,
      efficiency: 87,
      averageCompletionTime: '3.1 days',
      currentTasks: 1,
      pendingTasks: 2
    },
    { 
      id: 3, 
      name: 'John Doe', 
      status: 'Available', 
      currentTask: null,
      tasksCompleted: 52,
      totalTasks: 55,
      efficiency: 95,
      averageCompletionTime: '1.8 days',
      currentTasks: 0,
      pendingTasks: 0
    },
    { 
      id: 4, 
      name: 'Lisa Chen', 
      status: 'Active', 
      currentTask: 'Maintenance Check',
      tasksCompleted: 28,
      totalTasks: 35,
      efficiency: 78,
      averageCompletionTime: '4.2 days',
      currentTasks: 3,
      pendingTasks: 1
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
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTask(null);
    setReassignData({ newEmployee: '', notes: '' });
  };

  const handleApproveTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'Completed' } : task
    ));
  };

  const handleReassignTask = () => {
    if (!selectedTask || !reassignData.newEmployee) return;
    
    setTasks(prev => prev.map(task => 
      task.id === selectedTask.id 
        ? { 
            ...task, 
            assignedTo: reassignData.newEmployee,
            notes: reassignData.notes,
            status: 'In Progress'
          } 
        : task
    ));
    closeModal();
  };

  const handleReassignInputChange = (e) => {
    const { name, value } = e.target;
    setReassignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderDashboard = () => {
    // Prepare data for the bar chart
    const employeeNames = employees.map(e => e.name);
    const totalTasks = employees.map(e => e.totalTasks);
    const completedTasks = employees.map(e => e.tasksCompleted);

    const data = {
      labels: employeeNames,
      datasets: [
        {
          label: 'Total Tasks',
          data: totalTasks,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
          label: 'Completed Tasks',
          data: completedTasks,
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#fff',
            font: { size: 14 }
          }
        },
        title: {
          display: true,
          text: 'Employee Task Distribution',
          color: '#fff',
          font: { size: 18 }
        },
      },
      scales: {
        x: {
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      }
    };

    return (
      <div className="dashboard-content">
        <div className="content-header">
          <div className="user-info">
            <h1>{currentUser?.name || 'Manager'}</h1>
            <p className="role-indicator">Manager Dashboard</p>
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
            <h3>ASSIGNED TASKS</h3>
            <div className="widget-content">
              <div className="main-number">{tasks.length}</div>
              <div className="period">total tasks</div>
              <div className="sub-categories">
                <div className="sub-category">
                  <span>In Progress ({tasks.filter(t => t.status === 'In Progress').length})</span>
                </div>
                <div className="sub-category">
                  <span>Pending Approval ({tasks.filter(t => t.status === 'Pending Approval').length})</span>
                </div>
                <div className="sub-category">
                  <span>Completed ({tasks.filter(t => t.status === 'Completed').length})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="widget">
            <h3>TEAM MEMBERS</h3>
            <div className="widget-content">
              <div className="main-number">{employees.length}</div>
              <div className="period">active employees</div>
              <div className="sub-categories">
                <div className="sub-category">
                  <span>Working ({employees.filter(e => e.currentTask).length})</span>
                </div>
                <div className="sub-category">
                  <span>Available ({employees.filter(e => !e.currentTask).length})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="widget">
            <h3>MACHINES</h3>
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
            <h3>APPROVAL PENDING</h3>
            <div className="widget-content">
              <div className="main-number">{tasks.filter(t => t.status === 'Pending Approval').length}</div>
              <div className="period">tasks need approval</div>
            </div>
          </div>
        </div>

        {/* Employee Performance Bar Chart */}
        <div style={{ marginTop: '2rem', background: 'rgba(15,52,96,0.8)', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  };

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
              {task.notes && (
                <div className="task-notes">
                  <strong>Notes:</strong> {task.notes}
                </div>
              )}
            </div>
            <div className="task-actions">
              <button className="action-btn small">View Details</button>
              {task.status === 'Pending Approval' && (
                <button 
                  className="action-btn small success" 
                  onClick={() => handleApproveTask(task.id)}
                >
                  Approve
                </button>
              )}
              <button 
                className="action-btn small warning" 
                onClick={() => openModal('reassign', task)}
              >
                Reassign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeamCoordination = () => (
    <div className="team-coordination-content">
      <div className="content-header">
        <h1>Team Coordination</h1>
      </div>

      <div className="team-grid">
        {employees.map(employee => (
          <div key={employee.id} className="employee-card">
            <div className="employee-header">
              <h3>{employee.name}</h3>
              <span className={`status-badge ${employee.status.toLowerCase()}`}>
                {employee.status}
              </span>
            </div>
            <div className="employee-details">
              <div className="current-task">
                <strong>Current Task:</strong>
                {employee.currentTask ? (
                  <span className="task-name">{employee.currentTask}</span>
                ) : (
                  <span className="available">Available for new task</span>
                )}
              </div>
              <div className="employee-stats">
                <span>Tasks Completed: 12</span>
                <span>Efficiency: 95%</span>
              </div>
            </div>
            <div className="employee-actions">
              <button className="action-btn small">View Profile</button>
              <button className="action-btn small">Assign Task</button>
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
              {modalType === 'reassign' && 'Reassign Task'}
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
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
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
            {modalType === 'reassign' && selectedTask && (
              <div className="form-group">
                <label>Current Assignment</label>
                <input type="text" value={selectedTask.assignedTo} disabled />
                <label>Reassign to</label>
                <select 
                  name="newEmployee" 
                  value={reassignData.newEmployee} 
                  onChange={handleReassignInputChange}
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
                <label>Notes</label>
                <textarea 
                  name="notes" 
                  value={reassignData.notes} 
                  onChange={handleReassignInputChange}
                  placeholder="Add notes for reassignment"
                  rows="3"
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="action-btn primary" onClick={handleReassignTask}>Reassign</button>
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
        {activeTab === 'team' && renderTeamCoordination()}
        {activeTab === 'machines' && renderMachineManagement()}
      </div>
      {renderModal()}
    </>
  );
};

export default ManagerDashboard;
