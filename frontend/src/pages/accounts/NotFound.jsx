import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="error-page">
            <div className="error-content">
                <div className="error-code">404</div>
                <h1>Page not found</h1>
                <p>The page you're looking for doesn't exists or has been moved</p>
                <Link to="/" className="btn btn-primary">Go home</Link>
            </div>
        </div>
    );
};
export default NotFound;