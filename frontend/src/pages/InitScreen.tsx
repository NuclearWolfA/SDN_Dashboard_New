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
  const [connecting, setConnecting] = useState(false);
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

  const handlePortSelect = async (port: string) => {
    setSelectedPort(port);
    setConnecting(true);
    setError(null);
    
    try {
      // Store selected port in localStorage
      localStorage.setItem('selectedComPort', port);
      
      // Start the Meshtastic client with the selected port
      const response = await fetch(`http://localhost:8000/api/meshtastic/start-client?devPath=${port}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to start Meshtastic client' }));
        throw new Error(errorData.detail || 'Failed to start Meshtastic client');
      }
      
      console.log('✅ Meshtastic client started on', port);
      
      // Navigate to dashboard after successful connection
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
    } catch (err) {
      console.error('Error starting Meshtastic client:', err);
      setError(err instanceof Error ? err.message : 'Failed to start Meshtastic client');
      setSelectedPort(null);
      setConnecting(false);
    }
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
        ) : connecting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="loading-container"
          >
            <FaSpinner className="spinner" />
            <p>Connecting to {selectedPort}...</p>
            <p className="text-sm text-muted-foreground mt-2">Starting Meshtastic client</p>
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
                className={`port-card ${selectedPort === port ? 'selected' : ''} ${connecting ? 'disabled' : ''}`}
                onClick={() => !connecting && handlePortSelect(port)}
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