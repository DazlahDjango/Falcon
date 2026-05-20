import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiBell } from 'react-icons/fi';

export const NotificationBell = ({ 
  unreadCount = 0, 
  onClick, 
  onOpen,
  size = 24,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (unreadCount > 0 && !isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    if (newOpen && onOpen) {
      onOpen();
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <button
        ref={bellRef}
        onClick={handleClick}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <FiBell size={size} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: '#ef4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              minWidth: '16px',
              height: '16px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              animation: isAnimating ? 'ring 0.5s ease' : 'none'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      <style>{`
        @keyframes ring {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          50% { transform: rotate(-15deg); }
          75% { transform: rotate(5deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

NotificationBell.propTypes = {
  unreadCount: PropTypes.number,
  onClick: PropTypes.func,
  onOpen: PropTypes.func,
  size: PropTypes.number,
  className: PropTypes.string
};