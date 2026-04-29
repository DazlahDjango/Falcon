import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

/**
 * Breadcrumb - Navigation breadcrumb component
 */
const Breadcrumb = ({ items, separator = '/' }) => {
    const location = useLocation();
    
    // Generate breadcrumbs from path if not provided
    const breadcrumbItems = items || (() => {
        const paths = location.pathname.split('/').filter(Boolean);
        const crumbs = [];
        let currentPath = '';
        
        paths.forEach((path, index) => {
            currentPath += `/${path}`;
            const isLast = index === paths.length - 1;
            crumbs.push({
                label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
                path: currentPath,
                active: isLast,
            });
        });
        
        return crumbs;
    })();

    return (
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <ol className={styles.breadcrumbList}>
                <li className={styles.breadcrumbItem}>
                    <Link to="/" className={styles.breadcrumbLink}>
                        Home
                    </Link>
                    {breadcrumbItems.length > 0 && (
                        <span className={styles.separator}>{separator}</span>
                    )}
                </li>
                {breadcrumbItems.map((item, index) => (
                    <li key={index} className={styles.breadcrumbItem}>
                        {item.active ? (
                            <span className={styles.breadcrumbActive}>{item.label}</span>
                        ) : (
                            <Link to={item.path} className={styles.breadcrumbLink}>
                                {item.label}
                            </Link>
                        )}
                        {!item.active && index < breadcrumbItems.length - 1 && (
                            <span className={styles.separator}>{separator}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;