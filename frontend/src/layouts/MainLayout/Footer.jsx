import React from 'react';
import styles from './Footer.module.css';

/**
 * Footer - Application footer
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <p>&copy; {currentYear} KPI Management System. All rights reserved.</p>
                <div className={styles.footerLinks}>
                    <a href="/privacy" className={styles.link}>Privacy Policy</a>
                    <a href="/terms" className={styles.link}>Terms of Service</a>
                    <a href="/support" className={styles.link}>Support</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;