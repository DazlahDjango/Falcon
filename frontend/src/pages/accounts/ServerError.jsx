import React from 'react';
import { Link } from 'react-router-dom';

const ServerError = () => {
    return (
        <div className="error-page">
            <div className="error-content">
                <div className="error-code">500</div>
                <h1>Server Error</h1>
                <p>Something went wrong on our end. Please try again later.</p>
                <Link to="/" className="btn btn-primary">
                    Go Home
                </Link>
            </div>
        </div>
    );
};
export default ServerError;