import React, { useState } from 'react'
import Login from './Components/Login'
import AdminDashboard from './Components/AdminDashboard'
import ManagerDashboard from './Components/ManagerDashboard'
import SubAdminDashboard from './Components/SubAdminDashboard'
import EmployeeDashboard from './Components/EmployeeDashboard'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Get sidebar items based on user role
  const getSidebarItems = () => {
    const role = currentUser?.role?.toLowerCase();
    
    if (role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'analytics', label: 'Analytics', icon: 'analytics' },
        { id: 'users', label: 'User Management', icon: 'users' },
        { id: 'tasks', label: 'Task Management', icon: 'tasks' },
        { id: 'machines', label: 'Machine Management', icon: 'machines' }
      ];
    } else if (role === 'sub admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'tasks', label: 'Task Management', icon: 'tasks' },
        { id: 'machines', label: 'Machine Management', icon: 'machines' }
      ];
    } else if (role === 'manager') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'tasks', label: 'Task Management', icon: 'tasks' },
        { id: 'team', label: 'Team Coordination', icon: 'users' },
        { id: 'machines', label: 'Machine Management', icon: 'machines' }
      ];
    } else {
      // Employee
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'tasks', label: 'My Tasks', icon: 'tasks' },
        { id: 'machines', label: 'Machine Info', icon: 'machines' }
      ];
    }
  };

  // Get dashboard component based on user role
  const getDashboardComponent = () => {
    const role = currentUser?.role?.toLowerCase();
    
    if (role === 'admin') {
      return <AdminDashboard onLogout={handleLogout} activeTab={activeTab} currentUser={currentUser} />;
    } else if (role === 'sub admin') {
      return <SubAdminDashboard onLogout={handleLogout} activeTab={activeTab} currentUser={currentUser} />;
    } else if (role === 'manager') {
      return <ManagerDashboard onLogout={handleLogout} activeTab={activeTab} currentUser={currentUser} />;
    } else {
      return <EmployeeDashboard onLogout={handleLogout} activeTab={activeTab} currentUser={currentUser} />;
    }
  };

  // Get icon SVG based on icon name
  const getIconSvg = (iconName) => {
    const icons = {
      dashboard: (
        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      ),
      analytics: (
        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
        </svg>
      ),
      users: (
        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.64l-2.64-4.37c-.38-.63-1.08-1.03-1.85-1.03H15c-1.1 0-2 .9-2 2v6h-3v-7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v7H2v-6c0-1.1.9-2 2-2h3c1.1 0 2-.9 2-2V6c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v2h2c.77 0 1.47.4 1.85 1.03L22 16.37V22h-2z"/>
        </svg>
      ),
      tasks: (
        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      ),
      machines: (
        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    };
    
    return icons[iconName] || icons.dashboard;
  };

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <div className="crm-dashboard">
          {/* Top Header */}
          <div className="top-header">
            <div className="header-left">
              <div className="user-avatar">
                <span>{currentUser?.name?.charAt(0) || 'U'}</span>
              </div>
              <div className="logo">Kommo</div>
            </div>
            
            <div className="search-bar">
              <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input type="text" placeholder="Search" />
            </div>
            
            <div className="header-right">
              <div className="user-info-display" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: '#ffffff',
                fontSize: '0.9rem'
              }}>
                <span>{currentUser?.name}</span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {currentUser?.role}
                </span>
              </div>
              <button className="events-btn">
                EVENTS
                <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          <div className="dashboard-container">
            {/* Left Sidebar */}
            <div className="sidebar">
              {getSidebarItems().map(item => (
                <div 
                  key={item.id}
                  className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(item.id)}
                >
                  {getIconSvg(item.icon)}
                  <span>{item.label}</span>
                  {item.id === 'tasks' && currentUser?.role?.toLowerCase() === 'manager' && (
                    <div className="notification-badge">2</div>
                  )}
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="main-content">
              {getDashboardComponent()}
            </div>
          </div>
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}

export default App
