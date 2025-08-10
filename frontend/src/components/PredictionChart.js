import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  calculatePredictions, 
  calculateDailyIncome, 
  calculateMonthlyIncome, 
  calculateYearlyIncome,
  formatCurrency 
} from '../utils/calculations';

const PredictionChart = ({ investments, monthlyAddition }) => {
  if (investments.length === 0) {
    return (
      <div className="section">
        <h3 className="section-title">收益预测</h3>
        <div className="empty-state">
          <div className="empty-state-icon">📈</div>
          <p>请先添加投资项目</p>
          <p className="text-muted">添加投资后即可查看收益预测和增长趋势</p>
        </div>
      </div>
    );
  }

  const predictions = calculatePredictions(investments, monthlyAddition);
  const dailyIncome = calculateDailyIncome(investments);
  const monthlyIncome = calculateMonthlyIncome(investments);
  const yearlyIncome = calculateYearlyIncome(investments);

  const totalDailyIncome = dailyIncome.reduce((sum, item) => sum + item.dailyIncome, 0);
  const totalMonthlyIncome = monthlyIncome.reduce((sum, item) => sum + item.monthlyIncome, 0);
  const totalYearlyIncome = yearlyIncome.reduce((sum, item) => sum + item.yearlyIncome, 0);

  // 准备图表数据
  const chartData = predictions.map(prediction => ({
    year: `第${prediction.year}年`,
    totalAssets: prediction.totalAssets,
    ...prediction.investments.reduce((acc, inv) => {
      acc[inv.name] = inv.value;
      return acc;
    }, {})
  }));

  // 生成颜色
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="section">
      <h3 className="section-title">收益预测分析</h3>
      
      {/* 收益统计卡片 */}
      <div className="stats-grid">
        <div className="stats-card daily">
          <h4>📅 每日收益</h4>
          <div className="stats-total">{formatCurrency(totalDailyIncome)}</div>
          <div className="stats-details">
            {dailyIncome.map(item => (
              <div key={item.name} className="stats-detail">
                {item.name}: {formatCurrency(item.dailyIncome)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="stats-card monthly">
          <h4>📊 每月收益</h4>
          <div className="stats-total">{formatCurrency(totalMonthlyIncome)}</div>
          <div className="stats-details">
            {monthlyIncome.map(item => (
              <div key={item.name} className="stats-detail">
                {item.name}: {formatCurrency(item.monthlyIncome)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="stats-card yearly">
          <h4>📈 每年收益</h4>
          <div className="stats-total">{formatCurrency(totalYearlyIncome)}</div>
          <div className="stats-details">
            {yearlyIncome.map(item => (
              <div key={item.name} className="stats-detail">
                {item.name}: {formatCurrency(item.yearlyIncome)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {monthlyAddition > 0 && (
        <div className="alert alert-info">
          <strong>💡 提示：</strong> 
          已设置每月追加投资 {formatCurrency(monthlyAddition)}，
          将按各投资项目本金比例自动分配。
        </div>
      )}

      {/* 资产增长趋势图 */}
      <div className="chart-container">
        <h4 className="chart-title">10年资产增长趋势</h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `¥${(value / 10000).toFixed(1)}万`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalAssets" 
              stroke="#2563eb" 
              strokeWidth={3}
              name="总资产"
              dot={{ r: 4 }}
            />
            {investments.map((inv, index) => (
              <Line
                key={inv.id}
                type="monotone"
                dataKey={inv.name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                name={inv.name}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 各年度资产分布柱状图 */}
      <div className="chart-container">
        <h4 className="chart-title">各年度资产分布</h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData.filter((_, index) => index % 2 === 0)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `¥${(value / 10000).toFixed(1)}万`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {investments.map((inv, index) => (
              <Bar
                key={inv.id}
                dataKey={inv.name}
                stackId="a"
                fill={colors[index % colors.length]}
                name={inv.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 详细预测数据表格 */}
      <div className="prediction-table">
        <h4 className="chart-title">详细预测数据</h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>年份</th>
                {investments.map(inv => (
                  <th key={inv.id}>{inv.name}</th>
                ))}
                <th className="total-column">总资产</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((prediction) => (
                <tr key={prediction.year}>
                  <td><strong>第{prediction.year}年</strong></td>
                  {prediction.investments.map((inv, index) => (
                    <td key={index}>{formatCurrency(inv.value)}</td>
                  ))}
                  <td className="total-column">
                    {formatCurrency(prediction.totalAssets)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .custom-tooltip {
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .tooltip-label {
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
        }
        
        .stats-details {
          margin-top: 10px;
        }
        
        .table-container {
          overflow-x: auto;
          margin-top: 15px;
        }
        
        .table-container table {
          min-width: 800px;
        }
        
        .total-column {
          background-color: #fff3cd !important;
          font-weight: bold;
        }
        
        .chart-container {
          margin-top: 30px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }
        
        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }
        
        .text-muted {
          color: #6c757d;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default PredictionChart;
