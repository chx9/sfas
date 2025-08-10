import React, { useState } from 'react';
import { calculateTotalPrincipal, calculateAverageRate, formatCurrency, formatPercentage } from '../utils/calculations';

const InvestmentList = ({ investments, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const totalPrincipal = calculateTotalPrincipal(investments);
  const avgRate = calculateAverageRate(investments);

  const handleDelete = (id, name) => {
    if (window.confirm(`确定要删除投资项目"${name}"吗？\n\n此操作不可撤销，删除后该投资的所有数据将丢失。`)) {
      onDelete(id);
    }
  };

  const startEdit = (investment) => {
    setEditingId(investment.id);
    setEditData({
      name: investment.name,
      principal: investment.principal,
      annual_rate: investment.annual_rate,
      monthly_addition_enabled: investment.monthly_addition_enabled !== undefined 
        ? investment.monthly_addition_enabled 
        : true
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setErrors({});
  };

  const validateEditData = () => {
    const newErrors = {};
    
    if (!editData.name || !editData.name.trim()) {
      newErrors.name = '投资名称不能为空';
    }
    
    if (!editData.principal || parseFloat(editData.principal) <= 0) {
      newErrors.principal = '本金必须大于0';
    }
    
    if (editData.annual_rate === '' || parseFloat(editData.annual_rate) < 0) {
      newErrors.annual_rate = '年化收益率不能为负数';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveEdit = async () => {
    if (!validateEditData()) {
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        name: editData.name.trim(),
        principal: parseFloat(editData.principal),
        annual_rate: parseFloat(editData.annual_rate),
        monthly_addition_enabled: editData.monthly_addition_enabled
      };

      await onEdit(editingId, updatedData);
      setEditingId(null);
      setEditData({});
      setErrors({});
    } catch (error) {
      console.error('保存编辑失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
      <h3 className="section-title">投资列表 ({investments.length} 个项目)</h3>
      
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
            <span className="summary-label">加权平均年化收益率:</span>
            <span className="summary-value">{formatPercentage(avgRate)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">参与追加投资:</span>
            <span className="summary-value">
              {investments.filter(inv => inv.monthly_addition_enabled).length} / {investments.length}
            </span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>投资名称</th>
              <th>本金 (元)</th>
              <th>年化收益率 (%)</th>
              <th>每月追加</th>
              <th>占比</th>
              <th>预计年收益</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((investment, index) => {
              const isEditing = editingId === investment.id;
              const proportion = totalPrincipal > 0 ? (investment.principal / totalPrincipal * 100) : 0;
              const yearlyIncome = investment.principal * investment.annual_rate / 100;
              
              return (
                <tr key={investment.id} className={isEditing ? 'editing-row' : ''}>
                  <td className="investment-index">{index + 1}</td>
                  
                  {/* 投资名称 */}
                  <td className="investment-name">
                    {isEditing ? (
                      <div className="edit-field">
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`edit-input ${errors.name ? 'error' : ''}`}
                          placeholder="投资名称"
                          disabled={saving}
                        />
                        {errors.name && <div className="field-error">{errors.name}</div>}
                      </div>
                    ) : (
                      <div className="name-cell">
                        <strong>{investment.name}</strong>
                        {investment.created_at && (
                          <small className="created-date">
                            创建于: {new Date(investment.created_at).toLocaleDateString('zh-CN')}
                          </small>
                        )}
                      </div>
                    )}
                  </td>
                  
                  {/* 本金 */}
                  <td className="investment-principal">
                    {isEditing ? (
                      <div className="edit-field">
                        <input
                          type="number"
                          value={editData.principal || ''}
                          onChange={(e) => handleInputChange('principal', e.target.value)}
                          className={`edit-input ${errors.principal ? 'error' : ''}`}
                          placeholder="本金"
                          min="0"
                          step="0.01"
                          disabled={saving}
                        />
                        {errors.principal && <div className="field-error">{errors.principal}</div>}
                      </div>
                    ) : (
                      formatCurrency(investment.principal)
                    )}
                  </td>
                  
                  {/* 年化收益率 */}
                  <td className="investment-rate">
                    {isEditing ? (
                      <div className="edit-field">
                        <input
                          type="number"
                          value={editData.annual_rate || ''}
                          onChange={(e) => handleInputChange('annual_rate', e.target.value)}
                          className={`edit-input ${errors.annual_rate ? 'error' : ''}`}
                          placeholder="收益率"
                          min="0"
                          step="0.01"
                          disabled={saving}
                        />
                        {errors.annual_rate && <div className="field-error">{errors.annual_rate}</div>}
                      </div>
                    ) : (
                      <span className="rate-badge">{formatPercentage(investment.annual_rate)}</span>
                    )}
                  </td>
                  
                  {/* 每月追加 */}
                  <td className="investment-monthly-addition">
                    {isEditing ? (
                      <div className="edit-field">
                        <label className="checkbox-label-inline">
                          <input
                            type="checkbox"
                            checked={editData.monthly_addition_enabled || false}
                            onChange={(e) => handleInputChange('monthly_addition_enabled', e.target.checked)}
                            disabled={saving}
                            className="checkbox-input-inline"
                          />
                          <span className="checkbox-text-inline">参与</span>
                        </label>
                      </div>
                    ) : (
                      <div className="monthly-addition-status">
                        {investment.monthly_addition_enabled ? (
                          <span className="status-enabled">✅ 参与</span>
                        ) : (
                          <span className="status-disabled">❌ 不参与</span>
                        )}
                      </div>
                    )}
                  </td>
                  
                  {/* 占比 */}
                  <td className="investment-proportion">
                    {isEditing ? (
                      <span className="editing-placeholder">编辑中...</span>
                    ) : (
                      <div className="proportion-bar">
                        <div 
                          className="proportion-fill" 
                          style={{ width: `${proportion}%` }}
                        ></div>
                        <span className="proportion-text">{proportion.toFixed(1)}%</span>
                      </div>
                    )}
                  </td>
                  
                  {/* 预计年收益 */}
                  <td className="investment-income">
                    {isEditing ? (
                      <span className="editing-placeholder">编辑中...</span>
                    ) : (
                      formatCurrency(yearlyIncome)
                    )}
                  </td>
                  
                  {/* 操作按钮 */}
                  <td className="investment-actions">
                    <div className="table-actions">
                      {isEditing ? (
                        <>
                          <button 
                            onClick={saveEdit}
                            className="btn btn-success btn-sm"
                            disabled={saving}
                            title="保存修改"
                          >
                            {saving ? '💾 保存中...' : '✅ 保存'}
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="btn btn-secondary btn-sm"
                            disabled={saving}
                            title="取消编辑"
                          >
                            ❌ 取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => startEdit(investment)}
                            className="btn btn-primary btn-sm"
                            title={`编辑 ${investment.name}`}
                            disabled={editingId !== null}
                          >
                            ✏️ 编辑
                          </button>
                          <button 
                            onClick={() => handleDelete(investment.id, investment.name)}
                            className="btn btn-danger btn-sm"
                            title={`删除 ${investment.name}`}
                            disabled={editingId !== null}
                          >
                            🗑️ 删除
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="summary-row">
              <td colSpan="2"><strong>合计</strong></td>
              <td><strong>{formatCurrency(totalPrincipal)}</strong></td>
              <td><strong>{formatPercentage(avgRate)}</strong></td>
              <td><strong>
                {investments.filter(inv => inv.monthly_addition_enabled).length} / {investments.length}
              </strong></td>
              <td><strong>100.0%</strong></td>
              <td><strong>{formatCurrency(totalPrincipal * avgRate / 100)}</strong></td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="list-tips">
        <h4>💡 操作提示</h4>
        <ul>
          <li><strong>每月追加投资：</strong>勾选后该投资将参与每月追加资金的分配</li>
          <li><strong>分配规则：</strong>每月追加资金只在勾选"参与"的投资项目间按本金比例分配</li>
          <li><strong>直接编辑：</strong>点击编辑按钮后可在表格中直接修改所有数据</li>
          <li><strong>实时计算：</strong>修改参数后预测数据会自动重新计算</li>
        </ul>
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
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
          margin-bottom: 25px;
        }
        
        .investment-table {
          width: 100%;
          min-width: 1000px;
        }
        
        .investment-table th {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          font-weight: 600;
          color: #495057;
          text-align: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .investment-table td {
          text-align: center;
          vertical-align: middle;
          padding: 12px 8px;
          transition: background-color 0.2s ease;
        }
        
        .editing-row {
          background-color: #fff3cd !important;
          box-shadow: 0 0 0 2px #ffc107;
        }
        
        .editing-row td {
          background-color: transparent;
        }
        
        .investment-monthly-addition {
          min-width: 100px;
        }
        
        .monthly-addition-status {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .status-enabled {
          color: #28a745;
          font-weight: bold;
          font-size: 0.9rem;
        }
        
        .status-disabled {
          color: #6c757d;
          font-weight: bold;
          font-size: 0.9rem;
        }
        
        .checkbox-label-inline {
          display: flex;
          align-items: center;
          cursor: pointer;
          justify-content: center;
        }
        
        .checkbox-input-inline {
          width: 16px;
          height: 16px;
          margin-right: 6px;
          cursor: pointer;
        }
        
        .checkbox-text-inline {
          font-size: 12px;
          color: #333;
        }
        
        .investment-index {
          font-weight: bold;
          color: #6c757d;
          width: 60px;
        }
        
        .investment-name {
          text-align: left !important;
          min-width: 180px;
        }
        
        .name-cell strong {
          color: #333;
          display: block;
        }
        
        .created-date {
          color: #6c757d;
          font-size: 0.75rem;
          margin-top: 2px;
          display: block;
        }
        
        .edit-field {
          position: relative;
        }
        
        .edit-input {
          width: 100%;
          padding: 6px 8px;
          border: 2px solid #007bff;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          transition: border-color 0.2s ease;
        }
        
        .edit-input:focus {
          outline: none;
          border-color: #0056b3;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .edit-input.error {
          border-color: #dc3545;
        }
        
        .edit-input.error:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
        }
        
        .field-error {
          color: #dc3545;
          font-size: 0.75rem;
          margin-top: 2px;
          position: absolute;
          white-space: nowrap;
          z-index: 20;
          background: white;
          padding: 2px 4px;
          border-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .editing-placeholder {
          color: #6c757d;
          font-style: italic;
          font-size: 0.875rem;
        }
        
        .investment-principal,
        .investment-income {
          font-weight: 500;
          color: #28a745;
          min-width: 120px;
        }
        
        .investment-rate {
          min-width: 100px;
        }
        
        .rate-badge {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .investment-proportion {
          min-width: 120px;
        }
        
        .proportion-bar {
          position: relative;
          background: #e9ecef;
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .proportion-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          transition: width 0.3s ease;
        }
        
        .proportion-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          font-weight: bold;
          color: #333;
        }
        
        .table-actions {
          display: flex;
          gap: 6px;
          justify-content: center;
          min-width: 140px;
        }
        
        .btn-sm {
          padding: 4px 8px;
          font-size: 11px;
          border-radius: 4px;
          white-space: nowrap;
          min-width: 60px;
        }
        
        .btn-primary {
          background-color: #007bff;
          border-color: #007bff;
          color: white;
        }
        
        .btn-success {
          background-color: #28a745;
          border-color: #28a745;
          color: white;
        }
        
        .btn-secondary {
          background-color: #6c757d;
          border-color: #6c757d;
          color: white;
        }
        
        .btn-danger {
          background-color: #dc3545;
          border-color: #dc3545;
          color: white;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .summary-row {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          font-weight: bold;
        }
        
        .summary-row td {
          border-top: 2px solid #007bff;
        }
        
        .list-tips {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .list-tips h4 {
          margin: 0 0 15px 0;
          color: #333;
        }
        
        .list-tips ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .list-tips li {
          margin-bottom: 8px;
          color: #6c757d;
          line-height: 1.5;
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
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          
          .table-actions {
            flex-direction: column;
            gap: 4px;
            min-width: 80px;
          }
          
          .btn-sm {
            font-size: 10px;
            padding: 3px 6px;
            min-width: 50px;
          }
          
          .edit-input {
            font-size: 12px;
            padding: 4px 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default InvestmentList;
