import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsb, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import './InitScreen.css';

interface ComPort {
  name: string;
}

const InitScreen: React.FC = () => {
  const [comPorts, setComPorts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComPorts();
  }, []);

  const fetchComPorts = async () => {
    try {
      setLoading(true);
      
      // Create a minimum delay promise (1.5 seconds)
      const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fetch COM ports
      const fetchPromise = fetch('http://localhost:8000/api/meshtastic/comports')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch COM ports');
          }
          return response.json();
        });
      
      // Wait for both the API call and minimum delay
      const [data] = await Promise.all([fetchPromise, minDelay]);
      
      setComPorts(data.comports || []);
      setError(null);
    } catch (err) {
      setError('Unable to fetch COM ports. Please ensure the server is running.');
      console.error('Error fetching COM ports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePortSelect = (port: string) => {
    setSelectedPort(port);
    // Store selected port in localStorage or context
    localStorage.setItem('selectedComPort', port);
    
    // Navigate to dashboard page after short delay for visual feedback
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="init-screen">
      <div className="init-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="init-header"
        >
          <FaUsb className="init-icon" />
          <h1>Select COM Port</h1>
          <p>Choose an active COM port to connect to your Meshtastic device</p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="loading-container"
          >
            <FaSpinner className="spinner" />
            <p>Scanning for available COM ports...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="error-container"
          >
            <p className="error-message">{error}</p>
            <button onClick={fetchComPorts} className="retry-button">
              Retry
            </button>
          </motion.div>
        ) : comPorts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="no-ports-container"
          >
            <p>No active COM ports found</p>
            <button onClick={fetchComPorts} className="retry-button">
              Refresh
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="ports-grid"
          >
            {comPorts.map((port, index) => (
              <motion.div
                key={port}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`port-card ${selectedPort === port ? 'selected' : ''}`}
                onClick={() => handlePortSelect(port)}
              >
                <div className="port-icon-wrapper">
                  <FaUsb className="port-icon" />
                  {selectedPort === port && (
                    <FaCheckCircle className="check-icon" />
                  )}
                </div>
                <h3>{port}</h3>
                <p>Click to connect</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InitScreen;