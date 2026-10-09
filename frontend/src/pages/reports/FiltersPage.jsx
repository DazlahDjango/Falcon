// frontend/src/pages/reports/FiltersPage.jsx
import React from 'react';
import { FilterList } from '../../components/reports/filters';
import './reports.css';

export const FiltersPage = () => {
    return (
        <div className="filters-page">
            <FilterList />
        </div>
    );
};

export default FiltersPage;
