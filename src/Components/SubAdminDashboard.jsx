import React, { useState, useEffect } from 'react';
import './SubAdminDashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

const SubAdminDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    assignedTo: '',
    machine: '',
    deadline: '',
    priority: 'Medium',
    description: ''
  });
  const [editTaskData, setEditTaskData] = useState({
    title: '',
    assignedTo: '',
    machine: '',
    deadline: '',
    priority: 'Medium',
    description: '',
    status: '',
    progress: 0
  });
  const [newMachineData, setNewMachineData] = useState({
    name: '',
    location: '',
    status: 'Operational'
  });
  const [editMachineData, setEditMachineData] = useState({
    name: '',
    location: '',
    status: 'Operational',
    model: '',
    serialNumber: '',
    department: ''
  });
  const [tasks, setTasks] = useState([]);
  const [machines, setMachines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchTasks();
    fetchMachines();
    fetchEmployees();
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
        // Sub Admin sees all tasks (they have admin-like privileges)
        setTasks(data.data);
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

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setShowModal(true);
    
    if (type === 'addTask') {
      setNewTaskData({
        title: '',
        assignedTo: '',
        machine: '',
        deadline: '',
        priority: 'Medium',
        description: ''
      });
    }
    if (type === 'editTask' && item) {
      setSelectedTask(item);
      setEditTaskData({
        title: item.title || '',
        assignedTo: item.assignedTo || '',
        machine: item.machine || '',
        deadline: item.deadline ? item.deadline.split('T')[0] : '',
        priority: item.priority || 'Medium',
        description: item.description || item.notes || '',
        status: item.status || 'Pending',
        progress: item.progress || 0
      });
    }
    if (type === 'viewTask' && item) {
      setSelectedTask(item);
    }
    if (type === 'addMachine') {
      setNewMachineData({
        name: '',
        location: '',
        status: 'Operational'
      });
    }
    if (type === 'editMachine' && item) {
      setSelectedMachine(item);
      setEditMachineData({
        name: item.name || '',
        location: item.location || '',
        status: item.status || 'Operational',
        model: item.model || '',
        serialNumber: item.serialNumber || '',
        department: item.department || ''
      });
    }
    if (type === 'viewMachine' && item) {
      setSelectedMachine(item);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTask(null);
    setSelectedMachine(null);
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditTaskInputChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMachineInputChange = (e) => {
    const { name, value } = e.target;
    setNewMachineData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditMachineInputChange = (e) => {
    const { name, value } = e.target;
    setEditMachineData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTask = async () => {
    if (!newTaskData.title || !newTaskData.assignedTo) {
      alert('Please fill in all required fields');
      return;
    }
    
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
          assignedTo: newTaskData.assignedTo,
          machine: newTaskData.machine,
          deadline: newTaskData.deadline,
          priority: newTaskData.priority
        })
      });
      if (response.ok) {
        await fetchTasks();
        closeModal();
        alert('Task created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async () => {
    if (!editTaskData.title || !editTaskData.assignedTo) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTaskData.title,
          description: editTaskData.description,
          assignedTo: editTaskData.assignedTo,
          machine: editTaskData.machine,
          deadline: editTaskData.deadline,
          priority: editTaskData.priority,
          status: editTaskData.status,
          progress: editTaskData.progress
        })
      });
      if (response.ok) {
        await fetchTasks();
        closeModal();
        alert('Task updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await fetchTasks();
        alert('Task deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async () => {
    if (!newMachineData.name || !newMachineData.location) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/machines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newMachineData.name,
          location: newMachineData.location,
          status: newMachineData.status
        })
      });
      if (response.ok) {
        await fetchMachines();
        closeModal();
        alert('Machine added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding machine:', error);
      alert('Error adding machine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMachine = async () => {
    if (!editMachineData.name || !editMachineData.location) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${selectedMachine.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editMachineData.name,
          location: editMachineData.location,
          status: editMachineData.status,
          model: editMachineData.model,
          serialNumber: editMachineData.serialNumber,
          department: editMachineData.department
        })
      });
      if (response.ok) {
        await fetchMachines();
        closeModal();
        alert('Machine updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating machine:', error);
      alert('Error updating machine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMachine = async (machineId) => {
    if (!window.confirm('Are you sure you want to delete this machine?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${machineId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await fetchMachines();
        alert('Machine deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      alert('Error deleting machine. Please try again.');
    } finally {
      setLoading(false);
    }
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
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0}%
            </div>
            <div className="period">completion rate</div>
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
            </div>
            <div className="task-actions">
              <button 
                className="action-btn small" 
                onClick={() => openModal('editTask', task)}
                disabled={loading}
              >
                Edit
              </button>
              <button 
                className="action-btn small" 
                onClick={() => openModal('viewTask', task)}
              >
                View Details
              </button>
              <button 
                className="action-btn small danger" 
                onClick={() => handleDeleteTask(task.id)}
                disabled={loading}
              >
                Delete
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
              <button 
                className="action-btn small" 
                onClick={() => openModal('editMachine', machine)}
                disabled={loading}
              >
                Edit
              </button>
              <button 
                className="action-btn small" 
                onClick={() => openModal('viewMachine', machine)}
              >
                View Details
              </button>
              <button 
                className="action-btn small danger" 
                onClick={() => handleDeleteMachine(machine.id)}
                disabled={loading}
              >
                Delete
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
              {modalType === 'addTask' && 'Add New Task'}
              {modalType === 'editTask' && 'Edit Task'}
              {modalType === 'viewTask' && 'Task Details'}
              {modalType === 'addMachine' && 'Add New Machine'}
              {modalType === 'editMachine' && 'Edit Machine'}
              {modalType === 'viewMachine' && 'Machine Details'}
            </h2>
            <button className="close-btn" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            {modalType === 'addTask' && (
              <div className="form-group">
                <label>Task Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={newTaskData.title}
                  onChange={handleTaskInputChange}
                  placeholder="Enter task title" 
                />
                <label>Assign to Employee *</label>
                <select 
                  name="assignedTo"
                  value={newTaskData.assignedTo}
                  onChange={handleTaskInputChange}
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <label>Machine</label>
                <select 
                  name="machine"
                  value={newTaskData.machine}
                  onChange={handleTaskInputChange}
                >
                  <option value="">Select a machine (optional)</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>{machine.name}</option>
                  ))}
                </select>
                <label>Deadline</label>
                <input 
                  type="date" 
                  name="deadline"
                  value={newTaskData.deadline}
                  onChange={handleTaskInputChange}
                />
                <label>Priority</label>
                <select 
                  name="priority"
                  value={newTaskData.priority}
                  onChange={handleTaskInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <label>Description</label>
                <textarea 
                  name="description"
                  value={newTaskData.description}
                  onChange={handleTaskInputChange}
                  placeholder="Enter task description"
                  rows="3"
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleAddTask}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'editTask' && selectedTask && (
              <div className="form-group">
                <label>Task Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={editTaskData.title}
                  onChange={handleEditTaskInputChange}
                  placeholder="Enter task title" 
                />
                <label>Assign to Employee *</label>
                <select 
                  name="assignedTo"
                  value={editTaskData.assignedTo}
                  onChange={handleEditTaskInputChange}
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <label>Machine</label>
                <select 
                  name="machine"
                  value={editTaskData.machine}
                  onChange={handleEditTaskInputChange}
                >
                  <option value="">Select a machine (optional)</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>{machine.name}</option>
                  ))}
                </select>
                <label>Deadline</label>
                <input 
                  type="date" 
                  name="deadline"
                  value={editTaskData.deadline}
                  onChange={handleEditTaskInputChange}
                />
                <label>Priority</label>
                <select 
                  name="priority"
                  value={editTaskData.priority}
                  onChange={handleEditTaskInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <label>Status</label>
                <select 
                  name="status"
                  value={editTaskData.status}
                  onChange={handleEditTaskInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <label>Progress (%)</label>
                <input 
                  type="number" 
                  name="progress"
                  value={editTaskData.progress}
                  onChange={handleEditTaskInputChange}
                  min="0"
                  max="100"
                />
                <label>Description</label>
                <textarea 
                  name="description"
                  value={editTaskData.description}
                  onChange={handleEditTaskInputChange}
                  placeholder="Enter task description"
                  rows="3"
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleEditTask}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Task'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'viewTask' && selectedTask && (
              <div className="task-detail-view">
                <div className="detail-section">
                  <h3>{selectedTask.title}</h3>
                  <div className="detail-info">
                    <p><strong>Assigned to:</strong> {selectedTask.assignedTo ? (typeof selectedTask.assignedTo === 'string' ? selectedTask.assignedTo : selectedTask.assignedTo.name) : 'Not assigned'}</p>
                    <p><strong>Assigned by:</strong> {selectedTask.assignedBy}</p>
                    <p><strong>Machine:</strong> {selectedTask.machine ? (typeof selectedTask.machine === 'string' ? selectedTask.machine : selectedTask.machine.name) : 'Not assigned'}</p>
                    <p><strong>Deadline:</strong> {selectedTask.deadline}</p>
                    <p><strong>Priority:</strong> {selectedTask.priority}</p>
                    <p><strong>Status:</strong> {selectedTask.status}</p>
                    <p><strong>Progress:</strong> {selectedTask.progress}%</p>
                  </div>
                  <div className="task-description">
                    <h4>Task Description:</h4>
                    <p>{selectedTask.description || selectedTask.notes}</p>
                  </div>
                  {selectedTask.comments && selectedTask.comments.length > 0 && (
                    <div className="task-comments">
                      <h4>Comments:</h4>
                      {selectedTask.comments.map((comment, index) => (
                        <div key={index} className="comment">
                          <p><strong>{comment.userName}:</strong> {comment.comment}</p>
                          <small>{new Date(comment.createdAt).toLocaleString()}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                  <button 
                    className="action-btn primary" 
                    onClick={() => openModal('editTask', selectedTask)}
                  >
                    Edit Task
                  </button>
                </div>
              </div>
            )}
            {modalType === 'addMachine' && (
              <div className="form-group">
                <label>Machine Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={newMachineData.name}
                  onChange={handleMachineInputChange}
                  placeholder="Enter machine name" 
                />
                <label>Location *</label>
                <input 
                  type="text" 
                  name="location"
                  value={newMachineData.location}
                  onChange={handleMachineInputChange}
                  placeholder="Enter location" 
                />
                <label>Status</label>
                <select 
                  name="status"
                  value={newMachineData.status}
                  onChange={handleMachineInputChange}
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleAddMachine}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Machine'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'editMachine' && selectedMachine && (
              <div className="form-group">
                <label>Machine Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={editMachineData.name}
                  onChange={handleEditMachineInputChange}
                  placeholder="Enter machine name" 
                />
                <label>Location *</label>
                <input 
                  type="text" 
                  name="location"
                  value={editMachineData.location}
                  onChange={handleEditMachineInputChange}
                  placeholder="Enter location" 
                />
                <label>Status</label>
                <select 
                  name="status"
                  value={editMachineData.status}
                  onChange={handleEditMachineInputChange}
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
                <label>Model</label>
                <input 
                  type="text" 
                  name="model"
                  value={editMachineData.model}
                  onChange={handleEditMachineInputChange}
                  placeholder="Enter model" 
                />
                <label>Serial Number</label>
                <input 
                  type="text" 
                  name="serialNumber"
                  value={editMachineData.serialNumber}
                  onChange={handleEditMachineInputChange}
                  placeholder="Enter serial number" 
                />
                <label>Department</label>
                <input 
                  type="text" 
                  name="department"
                  value={editMachineData.department}
                  onChange={handleEditMachineInputChange}
                  placeholder="Enter department" 
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleEditMachine}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Machine'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'viewMachine' && selectedMachine && (
              <div className="machine-detail-view">
                <div className="detail-section">
                  <h3>{selectedMachine.name}</h3>
                  <div className="detail-info">
                    <p><strong>Location:</strong> {selectedMachine.location}</p>
                    <p><strong>Status:</strong> {selectedMachine.status}</p>
                    <p><strong>Model:</strong> {selectedMachine.model || 'Not specified'}</p>
                    <p><strong>Serial Number:</strong> {selectedMachine.serialNumber || 'Not specified'}</p>
                    <p><strong>Department:</strong> {selectedMachine.department || 'Not specified'}</p>
                    <p><strong>Efficiency:</strong> {selectedMachine.efficiency || 'Not specified'}%</p>
                  </div>
                  {selectedMachine.maintenance && (
                    <div className="maintenance-info">
                      <h4>Maintenance Information:</h4>
                      <p><strong>Last Maintenance:</strong> {new Date(selectedMachine.maintenance.lastMaintenance).toLocaleDateString()}</p>
                      <p><strong>Next Maintenance:</strong> {new Date(selectedMachine.maintenance.nextMaintenance).toLocaleDateString()}</p>
                      <p><strong>Interval:</strong> {selectedMachine.maintenance.interval} days</p>
                    </div>
                  )}
                  {selectedMachine.specifications && (
                    <div className="specifications">
                      <h4>Specifications:</h4>
                      {Object.entries(selectedMachine.specifications).map(([key, value]) => (
                        <p key={key}><strong>{key}:</strong> {value}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                  <button 
                    className="action-btn primary" 
                    onClick={() => openModal('editMachine', selectedMachine)}
                  >
                    Edit Machine
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
        {activeTab === 'tasks' && renderTaskManagement()}
        {activeTab === 'machines' && renderMachineManagement()}
      </div>
      {renderModal()}
    </>
  );
};

export default SubAdminDashboard;

