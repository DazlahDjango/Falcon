// frontend/src/pages/tenant/TenantMigrationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MigrationListTable, MigrationSummaryCard, MigrationFilterBar, MigrationDetailsModal } from '../../components/tenant/migrations';
import { fetchMigrations, runMigrations, selectMigrations, selectMigrationSummary, selectMigrationsRunning, selectTenantLoading } from '../../store/tenant';

export const TenantMigrationsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const migrations = useSelector(selectMigrations);
    const summary = useSelector(selectMigrationSummary);
    const running = useSelector(selectMigrationsRunning);
    const loading = useSelector(selectTenantLoading);
    const [selectedMigration, setSelectedMigration] = useState(null);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        if (id) {
            dispatch(fetchMigrations(id));
        }
    }, [dispatch, id, filters]);

    const handleRunMigrations = async () => {
        await dispatch(runMigrations({ tenantId: id, appName: null }));
    };

    const handleViewDetails = (migration) => {
        setSelectedMigration(migration);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Database Migrations</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage tenant migrations</p>
                </div>
                <button
                    onClick={handleRunMigrations}
                    disabled={running}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {running ? 'Running...' : 'Run Migrations'}
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <MigrationSummaryCard title="Total" value={summary?.total || 0} />
                <MigrationSummaryCard title="Pending" value={summary?.pending || 0} type="pending" />
                <MigrationSummaryCard title="Completed" value={summary?.completed || 0} type="completed" />
                <MigrationSummaryCard title="Failed" value={summary?.failed || 0} type="failed" />
            </div>

            <MigrationFilterBar
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={() => setFilters({})}
            />

            <MigrationListTable
                migrations={migrations}
                onViewDetails={handleViewDetails}
                loading={loading}
            />

            <MigrationDetailsModal
                isOpen={!!selectedMigration}
                onClose={() => setSelectedMigration(null)}
                migration={selectedMigration}
            />
        </div>
    );
};