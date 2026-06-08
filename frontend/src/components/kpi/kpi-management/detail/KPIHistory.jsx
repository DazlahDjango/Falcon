import { useDispatch, useSelector } from 'react-redux';
import { fetchKPIHistoryForKPI, selectKPIHistoryForKPI, selectHistoryLoading } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';

const KPIHistory = ({ kpiId }) => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    
    const history = useSelector(state => selectKPIHistoryForKPI(kpiId)(state));
    const loading = useSelector(selectHistoryLoading);
    
    useEffect(() => {
        if (kpiId) {
            dispatch(fetchKPIHistoryForKPI({ kpiId, params: { page, page_size: 20 } }));
        }
    }, [dispatch, kpiId, page]);
    
    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'info';
            case 'ACTIVATE': return 'success';
            case 'DEACTIVATE': return 'warning';
            case 'ARCHIVE': return 'danger';
            default: return 'default';
        }
    };
    
    if (loading && history.length === 0) {
        return <KPILoading size="sm" text="Loading history..." />;
    }
    
    if (history.length === 0) {
        return (
            <KPIEmptyState 
                icon="📜"
                title="No History"
                description="No changes have been recorded for this KPI yet"
            />
        );
    }
    
    return (
        <div className="kpi-history-section">
            <div className="timeline">
                {history.map((item, index) => (
                    <div key={item.id} className="timeline-item">
                        <div className="timeline-marker">
                            <div className={`marker-dot marker-${getActionColor(item.action)}`} />
                            {index < history.length - 1 && <div className="marker-line" />}
                        </div>
                        <div className="timeline-content">
                            <div className="timeline-header">
                                <span className={`action-badge action-${getActionColor(item.action)}`}>
                                    {item.action}
                                </span>
                                <span className="timeline-date">
                                    {new Date(item.performed_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="timeline-user">
                                By: {item.performed_by_email || 'System'}
                            </div>
                            {item.reason && (
                                <div className="timeline-reason">
                                    Reason: {item.reason}
                                </div>
                            )}
                            {item.changes && Object.keys(item.changes).length > 0 && (
                                <div className="timeline-changes">
                                    <strong>Changes:</strong>
                                    <ul>
                                        {Object.entries(item.changes).map(([key, value]) => (
                                            <li key={key}>{key}: {JSON.stringify(value)}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KPIHistory;