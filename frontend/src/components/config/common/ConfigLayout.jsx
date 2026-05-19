import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * ConfigLayout - Content wrapper for config pages
 * Note: Layout (Sidebar, Header) is handled by MainLayout above this
 * This component only wraps the page content
 */
export const ConfigLayout = () => {
  return <Outlet />;
};