import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDeviceId, switchDeviceId } from '../services/dataService';

function SyncPage() {
  const [deviceId, setDeviceId] = useState('');
  const [targetDeviceId, setTargetDeviceId] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    // Get the current device ID
    setDeviceId(getDeviceId());
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(deviceId);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const connectToDevice = async () => {
    if (!targetDeviceId.trim() || targetDeviceId === deviceId) {
      return;
    }
    
    setSyncStatus('syncing');
    try {
      await switchDeviceId(targetDeviceId);
      setSyncStatus('success');
      // Update displayed device ID to the new one
      setDeviceId(targetDeviceId);
      setTargetDeviceId('');
      
      // Force page reload after 1 second to refresh all data
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Sync Devices</h1>
          <p className="text-sm opacity-80">Share your restaurant data between devices</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-800 hover:text-gray-900 font-medium transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Restaurants
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 max-w-lg mx-auto">
          {/* Share your ID section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Your Device ID</h2>
            <p className="text-sm text-gray-600 mb-2">Share this ID with someone to let them see your restaurant data</p>
            
            <div className="flex">
              <input 
                type="text" 
                value={deviceId} 
                readOnly 
                className="flex-grow p-2 border border-gray-300 rounded-l-md bg-gray-100"
              />
              <button 
                onClick={copyToClipboard}
                className="bg-gray-800 text-white px-4 py-2 rounded-r-md hover:bg-gray-700"
              >
                Copy
              </button>
            </div>
            {copyStatus && (
              <p className="text-green-600 mt-1 text-sm">{copyStatus}</p>
            )}
          </div>
          
          {/* Connect to another device section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Connect to Another Device</h2>
            <p className="text-sm text-gray-600 mb-2">Enter someone else's device ID to see their restaurant data</p>
            
            <div className="flex mb-2">
              <input 
                type="text" 
                value={targetDeviceId} 
                onChange={(e) => setTargetDeviceId(e.target.value)}
                placeholder="Enter device ID" 
                className="flex-grow p-2 border border-gray-300 rounded-l-md"
              />
              <button 
                onClick={connectToDevice}
                className="bg-gray-800 text-white px-4 py-2 rounded-r-md hover:bg-gray-700 disabled:bg-gray-400"
                disabled={syncStatus === 'syncing' || !targetDeviceId.trim() || targetDeviceId === deviceId}
              >
                Connect
              </button>
            </div>
            
            {syncStatus === 'syncing' && (
              <p className="text-blue-600">Connecting and syncing data...</p>
            )}
            {syncStatus === 'success' && (
              <p className="text-green-600">Connected successfully! Redirecting to home page...</p>
            )}
            {syncStatus === 'error' && (
              <p className="text-red-600">Connection failed. Please check the device ID and try again.</p>
            )}
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Note: Connecting to another device will replace your current data with theirs.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SyncPage;