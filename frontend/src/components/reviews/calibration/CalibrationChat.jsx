// src/components/reviews/calibration/CalibrationChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import './calibration.css';

const CalibrationChat = ({ 
    messages = [], 
    onSendMessage, 
    onTyping,
    currentUser,
    isConnected = true 
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSendMessage = () => {
        if (inputMessage.trim() && onSendMessage) {
            onSendMessage(inputMessage.trim());
            setInputMessage('');
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (onTyping) onTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleTyping = () => {
        if (!isTyping && onTyping) {
            setIsTyping(true);
            onTyping(true);
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                if (onTyping) onTyping(false);
            }, 1000);
        }
    };

    return (
        <div className="calibration-chat">
            <div className="chat-messages">
                {messages.map((message, index) => {
                    const isMine = message.sender === currentUser?.email;
                    return (
                        <div 
                            key={index} 
                            className={`chat-message ${isMine ? 'chat-message-mine' : 'chat-message-other'}`}
                        >
                            {!isMine && (
                                <div className="chat-message-sender">
                                    {message.sender_name || message.sender}
                                </div>
                            )}
                            <div className="chat-message-bubble">
                                {message.message}
                            </div>
                            <div className="chat-message-time">
                                {formatTime(message.timestamp)}
                            </div>
                        </div>
                    );
                })}
                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onKeyDown={handleTyping}
                    placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
                    disabled={!isConnected}
                />
                <button 
                    className="btn-primary" 
                    onClick={handleSendMessage}
                    disabled={!isConnected || !inputMessage.trim()}
                    style={{ padding: '0.5rem 1rem' }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default CalibrationChat;