import React from "react";
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Falcon PMS</h1>
                        <p>Performance Management System</p>
                    </div>
                    <div className="auth-body">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;