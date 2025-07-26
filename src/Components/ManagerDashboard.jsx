import React, { useState, useEffect } from 'react';
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

const API_BASE_URL = 'http://localhost:5000/api';

const ManagerDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reassignData, setReassignData] = useState({
    newEmployee: '',
    notes: ''
  });
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    employee: '',
    machine: '',
    deadline: '',
    priority: 'Medium',
    description: ''
  });
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchTasks();
    fetchEmployees();
    fetchMachines();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Manager sees all tasks (they manage everything)
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/employees`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
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

  const openModal = (type, task = null, employee = null) => {
    setModalType(type);
    setShowModal(true);
    if (task) {
      setSelectedTask(task);
    }
    if (employee) {
      setSelectedEmployee(employee);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTask(null);
    setSelectedEmployee(null);
    setReassignData({ newEmployee: '', notes: '' });
    setNewTaskData({
      title: '',
      employee: '',
      machine: '',
      deadline: '',
      priority: 'Medium',
      description: ''
    });
  };

  const handleApproveTask = async (taskId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Completed' })
      });
      if (response.ok) {
        await fetchTasks();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error approving task.');
    } finally {
      setLoading(false);
    }
  };

  const handleReassignTask = async () => {
    if (!selectedTask || !reassignData.newEmployee) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            assignedTo: reassignData.newEmployee,
          notes: reassignData.notes
        })
      });
      if (response.ok) {
        await fetchTasks();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error reassigning task.');
    } finally {
      setLoading(false);
    }
  };

  const handleReassignInputChange = (e) => {
    const { name, value } = e.target;
    setReassignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignTask = async () => {
    if (!newTaskData.title || !newTaskData.employee) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
      title: newTaskData.title,
          description: newTaskData.description,
      assignedTo: newTaskData.employee,
          machine: newTaskData.machine,
      deadline: newTaskData.deadline,
          priority: newTaskData.priority
        })
      });
      if (response.ok) {
        await fetchTasks();
    closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error creating task.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTaskData(prev => ({
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
                <span><strong>Assigned to:</strong> {task.assignedTo ? (typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo.name) : 'Not assigned'}</span>
                <span><strong>Assigned by:</strong> {task.assignedBy}</span>
                <span><strong>Machine:</strong> {task.machine ? (typeof task.machine === 'string' ? task.machine : task.machine.name) : 'Not assigned'}</span>
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
              <button 
                className="action-btn small"
                onClick={() => openModal('viewTaskDetails', task)}
              >
                View Details
              </button>
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
                <span>Tasks Completed: {employee.tasksCompleted}</span>
                <span>Efficiency: {employee.efficiency}%</span>
              </div>
            </div>
            <div className="employee-actions">
              <button 
                className="action-btn small" 
                onClick={() => openModal('viewProfile', null, employee)}
              >
                View Profile
              </button>
              <button 
                className="action-btn small primary" 
                onClick={() => openModal('assignTask', null, employee)}
              >
                Assign Task
              </button>
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
              {modalType === 'viewProfile' && 'Employee Profile'}
              {modalType === 'assignTask' && 'Assign New Task'}
              {modalType === 'viewTaskDetails' && 'Task Details'}
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
                <input type="text" value={selectedTask.assignedTo ? (typeof selectedTask.assignedTo === 'string' ? selectedTask.assignedTo : selectedTask.assignedTo.name) : ''} disabled />
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
            {modalType === 'viewProfile' && selectedEmployee && (
              <div className="form-group">
                <label>Employee Name</label>
                <input type="text" value={selectedEmployee.name} disabled />
                <label>Status</label>
                <input type="text" value={selectedEmployee.status} disabled />
                <label>Current Task</label>
                <input type="text" value={selectedEmployee.currentTask || 'Available'} disabled />
                <label>Tasks Completed</label>
                <input type="text" value={`${selectedEmployee.tasksCompleted}/${selectedEmployee.totalTasks}`} disabled />
                <label>Efficiency</label>
                <input type="text" value={`${selectedEmployee.efficiency}%`} disabled />
                <label>Average Completion Time</label>
                <input type="text" value={selectedEmployee.averageCompletionTime} disabled />
                <label>Current Tasks</label>
                <input type="text" value={selectedEmployee.currentTasks} disabled />
                <label>Pending Tasks</label>
                <input type="text" value={selectedEmployee.pendingTasks} disabled />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            )}
            {modalType === 'assignTask' && selectedEmployee && (
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={newTaskData.title}
                  onChange={handleNewTaskInputChange}
                  placeholder="Enter task title" 
                />
                <label>Assign to Employee</label>
                <select 
                  name="employee"
                  value={newTaskData.employee}
                  onChange={handleNewTaskInputChange}
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
                <label>Machine</label>
                <select 
                  name="machine"
                  value={newTaskData.machine}
                  onChange={handleNewTaskInputChange}
                >
                  <option value="">Select machine</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.name}>{machine.name}</option>
                  ))}
                </select>
                <label>Deadline</label>
                <input 
                  type="date" 
                  name="deadline"
                  value={newTaskData.deadline}
                  onChange={handleNewTaskInputChange}
                />
                <label>Priority</label>
                <select 
                  name="priority"
                  value={newTaskData.priority}
                  onChange={handleNewTaskInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <label>Description</label>
                <textarea 
                  name="description"
                  value={newTaskData.description}
                  onChange={handleNewTaskInputChange}
                  placeholder="Enter task description"
                  rows="3"
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="action-btn primary" onClick={handleAssignTask}>Assign Task</button>
                </div>
              </div>
            )}
            {modalType === 'viewTaskDetails' && selectedTask && (
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" value={selectedTask.title} disabled />
                <label>Assigned To</label>
                <input type="text" value={selectedTask.assignedTo ? (typeof selectedTask.assignedTo === 'string' ? selectedTask.assignedTo : selectedTask.assignedTo.name) : ''} disabled />
                <label>Assigned By</label>
                <input type="text" value={selectedTask.assignedBy} disabled />
                <label>Machine</label>
                <input type="text" value={selectedTask.machine ? (typeof selectedTask.machine === 'string' ? selectedTask.machine : selectedTask.machine.name) : ''} disabled />
                <label>Deadline</label>
                <input type="text" value={selectedTask.deadline} disabled />
                <label>Priority</label>
                <input type="text" value={selectedTask.priority} disabled />
                <label>Status</label>
                <input type="text" value={selectedTask.status} disabled />
                <label>Progress</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="text" value={`${selectedTask.progress}%`} disabled style={{ flex: 1 }} />
                  <div className="progress-bar" style={{ width: '100px', height: '8px' }}>
                    <div className="progress-fill" style={{width: `${selectedTask.progress}%`}}></div>
                  </div>
                </div>
                <label>Notes</label>
                <textarea 
                  value={selectedTask.notes || 'No notes available'} 
                  disabled 
                  rows="4"
                  style={{ resize: 'none' }}
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                  {selectedTask.status === 'Pending Approval' && (
                    <button 
                      className="action-btn primary" 
                      onClick={() => {
                        handleApproveTask(selectedTask.id);
                        closeModal();
                      }}
                    >
                      Approve Task
                    </button>
                  )}
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
