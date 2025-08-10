import React from 'react';
import { calculateTotalPrincipal, calculateAverageRate, formatCurrency, formatPercentage } from '../utils/calculations';

const InvestmentList = ({ investments, onEdit, onDelete }) => {
  const totalPrincipal = calculateTotalPrincipal(investments);
  const avgRate = calculateAverageRate(investments);

  const handleDelete = (id, name) => {
    if (window.confirm(`确定要删除投资项目"${name}"吗？此操作不可撤销。`)) {
      onDelete(id);
    }
  };

  if (investments.length === 0) {
    return (
      <div className="section">
        <h3 className="section-title">投资列表</h3>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>暂无投资记录</p>
          <p className="text-muted">请先添加您的第一个投资项目</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <h3 className="section-title">投资列表</h3>
      
      <div className="investment-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">投资项目数量:</span>
            <span className="summary-value">{investments.length} 个</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">总本金:</span>
            <span className="summary-value">{formatCurrency(totalPrincipal)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">平均年化收益率:</span>
            <span className="summary-value">{formatPercentage(avgRate)}</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>投资名称</th>
              <th>本金</th>
              <th>年化收益率</th>
              <th>占比</th>
              <th>预计年收益</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((investment) => {
              const proportion = totalPrincipal > 0 ? (investment.principal / totalPrincipal * 100) : 0;
              const yearlyIncome = investment.principal * investment.annual_rate / 100;
              
              return (
                <tr key={investment.id}>
                  <td className="investment-name">{investment.name}</td>
                  <td className="investment-principal">{formatCurrency(investment.principal)}</td>
                  <td className="investment-rate">{formatPercentage(investment.annual_rate)}</td>
                  <td className="investment-proportion">{proportion.toFixed(1)}%</td>
                  <td className="investment-income">{formatCurrency(yearlyIncome)}</td>
                  <td className="investment-actions">
                    <div className="table-actions">
                      <button 
                        onClick={() => onEdit(investment)}
                        className="btn btn-success btn-sm"
                        title="编辑投资"
                      >
                        编辑
                      </button>
                      <button 
                        onClick={() => handleDelete(investment.id, investment.name)}
                        className="btn btn-danger btn-sm"
                        title="删除投资"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .investment-summary {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
          border-left: 4px solid #007bff;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .summary-label {
          font-size: 0.9rem;
          color: #6c757d;
          margin-bottom: 5px;
        }
        
        .summary-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: #007bff;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .investment-table {
          width: 100%;
          min-width: 700px;
        }
        
        .investment-table th {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          font-weight: 600;
          color: #495057;
          text-align: center;
        }
        
        .investment-table td {
          text-align: center;
          vertical-align: middle;
        }
        
        .investment-name {
          font-weight: 500;
          color: #333;
          text-align: left !important;
        }
        
        .investment-principal,
        .investment-income {
          font-weight: 500;
          color: #28a745;
        }
        
        .investment-rate {
          font-weight: 500;
          color: #007bff;
        }
        
        .investment-proportion {
          color: #6c757d;
        }
        
        .table-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        
        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
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
        
        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .table-actions {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default InvestmentList;
