import React, { useState, useEffect } from 'react';
import { bonusAPI } from '../services/api';
import { formatCurrency, calculateBonusTimeline, groupBonusesByMonth } from '../utils/calculations';

const BonusManagement = ({ onBonusChange }) => {
  const [bonuses, setBonuses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newBonus, setNewBonus] = useState({
    name: '',
    amount: '',
    month: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  useEffect(() => {
    loadBonuses();
  }, []);

  const loadBonuses = async () => {
    try {
      const response = await bonusAPI.getAll();
      setBonuses(response.data || []);
      onBonusChange(response.data || []);
    } catch (error) {
      console.error('加载奖金数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    
    if (!data.name || !data.name.trim()) {
      newErrors.name = '奖金名称不能为空';
    }
    
    if (!data.amount || parseFloat(data.amount) <= 0) {
      newErrors.amount = '奖金金额必须大于0';
    }
    
    if (!data.month || parseInt(data.month) < 1 || parseInt(data.month) > 12) {
      newErrors.month = '请选择正确的月份';
    }
    
    return newErrors;
  };

  const handleAddBonus = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(newBonus);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      // 确保金额是正确的数值
      const amount = parseFloat(parseFloat(newBonus.amount).toFixed(2));
      
      console.log(`添加奖金: ${newBonus.name}, 金额: ${amount}`);
      
      await bonusAPI.create({
        name: newBonus.name.trim(),
        amount: amount,
        month: parseInt(newBonus.month)
      });
      
      setNewBonus({ name: '', amount: '', month: '' });
      setErrors({});
      await loadBonuses();
    } catch (error) {
      console.error('添加奖金失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (bonus) => {
    setEditingId(bonus.id);
    setEditData({
      name: bonus.name,
      amount: bonus.amount,
      month: bonus.month
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setErrors({});
  };

  const saveEdit = async () => {
    const validationErrors = validateForm(editData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      // 确保金额是正确的数值
      const amount = parseFloat(parseFloat(editData.amount).toFixed(2));
      
      console.log(`更新奖金: ${editData.name}, 金额: ${amount}`);
      
      await bonusAPI.update(editingId, {
        name: editData.name.trim(),
        amount: amount,
        month: parseInt(editData.month)
      });
      
      setEditingId(null);
      setEditData({});
      setErrors({});
      await loadBonuses();
    } catch (error) {
      console.error('更新奖金失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`确定要删除"${name}"吗？\n\n此操作不可撤销。`)) {
      try {
        await bonusAPI.delete(id);
        await loadBonuses();
      } catch (error) {
        console.error('删除奖金失败:', error);
      }
    }
  };

  const handleInputChange = (field, value, isNew = false) => {
    if (isNew) {
      setNewBonus(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 计算总奖金金额，添加调试信息
  const totalBonusAmount = bonuses.reduce((sum, bonus) => {
    console.log(`奖金: ${bonus.name}, 原始金额: ${bonus.amount}, 类型: ${typeof bonus.amount}`);
    return sum + bonus.amount;
  }, 0);
  
  console.log(`总奖金金额: ${totalBonusAmount}, 格式化后: ${formatCurrency(totalBonusAmount)}`);

  const bonusesByMonth = groupBonusesByMonth(bonuses);
  const bonusTimeline = calculateBonusTimeline(bonuses, 3); // 显示前3年的时间线

  if (loading) {
    return (
      <div className="section">
        <h3 className="section-title">年终奖 & 额外收入</h3>
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="section">
      <h3 className="section-title">💰 年终奖 & 额外收入管理</h3>
      
      {/* 添加新奖金表单 */}
      <div className="add-bonus-form">
        <h4>添加新的额外收入</h4>
        <form onSubmit={handleAddBonus}>
          <div className="form-row">
            <div className="form-group">
              <label>收入名称 *</label>
              <input
                type="text"
                value={newBonus.name}
                onChange={(e) => handleInputChange('name', e.target.value, true)}
                className={`form-control ${errors.name ? 'error' : ''}`}
                placeholder="例如：年终奖、项目奖金、股票分红等"
                disabled={saving}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label>金额 (元) *</label>
              <input
                type="number"
                value={newBonus.amount}
                onChange={(e) => handleInputChange('amount', e.target.value, true)}
                className={`form-control ${errors.amount ? 'error' : ''}`}
                placeholder="请输入金额"
                min="0"
                step="0.01"
                disabled={saving}
              />
              {errors.amount && <div className="error-message">{errors.amount}</div>}
            </div>
            
            <div className="form-group">
              <label>发放月份 *</label>
              <select
                value={newBonus.month}
                onChange={(e) => handleInputChange('month', e.target.value, true)}
                className={`form-control ${errors.month ? 'error' : ''}`}
                disabled={saving}
              >
                <option value="">请选择月份</option>
                {monthNames.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
              {errors.month && <div className="error-message">{errors.month}</div>}
            </div>
            
            <div className="form-group">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? '添加中...' : '➕ 添加'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 奖金统计 */}
      {bonuses.length > 0 && (
        <div className="bonus-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">额外收入项目:</span>
              <span className="summary-value">{bonuses.length} 个</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">年度总额:</span>
              <span className="summary-value">{formatCurrency(totalBonusAmount)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">月均额外收入:</span>
              <span className="summary-value">{formatCurrency(totalBonusAmount / 12)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 投资时间线 */}
      {bonuses.length > 0 && (
        <div className="bonus-timeline">
          <h4>📅 投资时间线（前3年）</h4>
          <div className="timeline-container">
            {bonusTimeline.length > 0 ? (
              <div className="timeline-grid">
                {bonusTimeline.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-date">
                      <strong>第{item.year}年 {item.monthName}</strong>
                    </div>
                    <div className="timeline-amount">
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="timeline-details">
                      {item.bonuses.map(bonus => (
                        <div key={bonus.id} className="timeline-bonus">
                          {bonus.name}: {formatCurrency(bonus.amount)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">暂无奖金投资时间线</p>
            )}
          </div>
        </div>
      )}

      {/* 奖金列表 */}
      {bonuses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <p>暂无额外收入记录</p>
          <p className="text-muted">添加年终奖、项目奖金等额外收入，系统会在发放当月自动投入投资项目</p>
        </div>
      ) : (
        <div className="bonus-list">
          <h4>额外收入列表</h4>
          <div className="table-container">
            <table className="bonus-table">
              <thead>
                <tr>
                  <th>收入名称</th>
                  <th>金额</th>
                  <th>发放月份</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {bonuses.map((bonus) => {
                  const isEditing = editingId === bonus.id;
                  
                  return (
                    <tr key={bonus.id} className={isEditing ? 'editing-row' : ''}>
                      <td>
                        {isEditing ? (
                          <div className="edit-field">
                            <input
                              type="text"
                              value={editData.name || ''}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className={`edit-input ${errors.name ? 'error' : ''}`}
                              disabled={saving}
                            />
                            {errors.name && <div className="field-error">{errors.name}</div>}
                          </div>
                        ) : (
                          <strong>{bonus.name}</strong>
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <div className="edit-field">
                            <input
                              type="number"
                              value={editData.amount || ''}
                              onChange={(e) => handleInputChange('amount', e.target.value)}
                              className={`edit-input ${errors.amount ? 'error' : ''}`}
                              min="0"
                              step="0.01"
                              disabled={saving}
                            />
                            {errors.amount && <div className="field-error">{errors.amount}</div>}
                          </div>
                        ) : (
                          <span className="amount-text">
                            {formatCurrency(bonus.amount)}
                            <small style={{display: 'block', color: '#666', fontSize: '0.7rem'}}>
                              原始值: {bonus.amount}
                            </small>
                          </span>
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <div className="edit-field">
                            <select
                              value={editData.month || ''}
                              onChange={(e) => handleInputChange('month', e.target.value)}
                              className={`edit-input ${errors.month ? 'error' : ''}`}
                              disabled={saving}
                            >
                              <option value="">请选择</option>
                              {monthNames.map((month, index) => (
                                <option key={index + 1} value={index + 1}>
                                  {month}
                                </option>
                              ))}
                            </select>
                            {errors.month && <div className="field-error">{errors.month}</div>}
                          </div>
                        ) : (
                          <span className="month-badge">{monthNames[bonus.month - 1]}</span>
                        )}
                      </td>
                      
                      <td>
                        <small className="created-date">
                          {new Date(bonus.created_at).toLocaleDateString('zh-CN')}
                        </small>
                      </td>
                      
                      <td>
                        <div className="table-actions">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={saveEdit}
                                className="btn btn-success btn-sm"
                                disabled={saving}
                              >
                                {saving ? '💾 保存中...' : '✅ 保存'}
                              </button>
                              <button 
                                onClick={cancelEdit}
                                className="btn btn-secondary btn-sm"
                                disabled={saving}
                              >
                                ❌ 取消
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => startEdit(bonus)}
                                className="btn btn-primary btn-sm"
                                disabled={editingId !== null}
                              >
                                ✏️ 编辑
                              </button>
                              <button 
                                onClick={() => handleDelete(bonus.id, bonus.name)}
                                className="btn btn-danger btn-sm"
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
            </table>
          </div>
        </div>
      )}

      <div className="bonus-tips">
        <h4>💡 使用说明</h4>
        <ul>
          <li><strong>即时投资：</strong>奖金会在发放当月立即投入到参与追加投资的项目中</li>
          <li><strong>发放时间：</strong>选择实际发放月份，系统会据此计算投资收益时间</li>
          <li><strong>投资分配：</strong>奖金按照勾选"参与每月追加投资"的项目本金比例分配</li>
          <li><strong>复利计算：</strong>奖金投资后从投资月份开始享受复利增长</li>
          <li><strong>时间线：</strong>可查看未来3年的奖金投资时间安排</li>
        </ul>
      </div>

      <style jsx>{`
        .add-bonus-form {
          background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 4px solid #28a745;
        }
        
        .add-bonus-form h4 {
          margin: 0 0 15px 0;
          color: #155724;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr auto;
          gap: 15px;
          align-items: end;
        }
        
        .bonus-summary {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
          border-left: 4px solid #ffc107;
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
          color: #856404;
          margin-bottom: 5px;
        }
        
        .summary-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: #b8860b;
        }
        
        .bonus-timeline {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
          border-left: 4px solid #2196f3;
        }
        
        .bonus-timeline h4 {
          margin: 0 0 15px 0;
          color: #1565c0;
        }
        
        .timeline-container {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .timeline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .timeline-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 3px solid #2196f3;
        }
        
        .timeline-date {
          color: #1565c0;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        
        .timeline-amount {
          font-size: 1.2rem;
          font-weight: bold;
          color: #2196f3;
          margin-bottom: 8px;
        }
        
        .timeline-details {
          font-size: 0.8rem;
          color: #666;
        }
        
        .timeline-bonus {
          margin-bottom: 2px;
        }
        
        .bonus-list h4 {
          margin-bottom: 15px;
          color: #333;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .bonus-table {
          width: 100%;
          min-width: 700px;
        }
        
        .bonus-table th {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          font-weight: 600;
          color: #495057;
          text-align: center;
        }
        
        .bonus-table td {
          text-align: center;
          vertical-align: middle;
          padding: 12px 8px;
        }
        
        .editing-row {
          background-color: #fff3cd !important;
          box-shadow: 0 0 0 2px #ffc107;
        }
        
        .amount-text {
          font-weight: bold;
          color: #28a745;
        }
        
        .month-badge {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .created-date {
          color: #6c757d;
          font-size: 0.8rem;
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
        }
        
        .edit-input:focus {
          outline: none;
          border-color: #0056b3;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .edit-input.error {
          border-color: #dc3545;
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
        
        .table-actions {
          display: flex;
          gap: 6px;
          justify-content: center;
        }
        
        .btn-sm {
          padding: 4px 8px;
          font-size: 11px;
          border-radius: 4px;
          white-space: nowrap;
          min-width: 60px;
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
        
        .bonus-tips {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .bonus-tips h4 {
          margin: 0 0 15px 0;
          color: #333;
        }
        
        .bonus-tips ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .bonus-tips li {
          margin-bottom: 8px;
          color: #6c757d;
          line-height: 1.5;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 5px;
        }
        
        .form-control.error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .summary-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .timeline-grid {
            grid-template-columns: 1fr;
          }
          
          .table-actions {
            flex-direction: column;
            gap: 4px;
          }
          
          .btn-sm {
            font-size: 10px;
            padding: 3px 6px;
            min-width: 50px;
          }
        }
      `}</style>
    </div>
  );
};

export default BonusManagement;
