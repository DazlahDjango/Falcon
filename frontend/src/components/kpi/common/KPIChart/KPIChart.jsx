import React from "react";
import PropTypes from 'prop-types';
import styles from './KPIChart.module.css';
import LineChart from "./LineChart";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import GaugeChart from "./GaugeChart";

const KPIChart = ({ type, data, options, hieght = 300, width = '100%', title }) => {
    const renderChart = () => {
        switch (type) {
            case 'line':
                return <LineChart data={data} options={options} hieght={hieght} width={width} />;
            case 'bar':
                return <BarChart data={data} options={options} hieght={hieght} width={width} />;
            case 'pie':
                return <PieChart data={data} options={options} hieght={hieght} width={width} />;
            case 'gauge':
                return <GaugeChart data={data} options={options} hieght={hieght} width={width} />;
            default:
                return <LineChart data={data} options={options} hieght={hieght} width={width} />;
        }
    };
    return (
        <div className={styles.chartContainer} style={{ hieght, width }}>
            {title && <h4 className={styles.chartTitle}>{title}</h4>}
            <div className={styles.chartWrapper}>{renderChart()}</div>
        </div>
    );
};
KPIChart.propTypes = {
    type: PropTypes.oneOf(['line', 'bar', 'pie', 'gauge']),
    data: PropTypes.object.isRequired,
    options: PropTypes.object,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
};
KPIChart.defaultProps = {
    type: 'line',
    options: {},
    height: 300,
    width: '100%',
    title: '',
};
export default KPIChart;