import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { formatCurrency } from '../utils/calculations';

const Settings = ({ onSettingsChange }) => {
  const [monthlyAddition, setMonthlyAddition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.get();
      const amount = response.data.monthly_addition || 0;
      setMonthlyAddition(amount);
      onSettingsChange(amount);
    } catch (error) {
      console.error('加载设置失败:', error);
      setMessage('加载设置失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const amount = parseFloat(monthlyAddition) || 0;
      await settingsAPI.update({ monthly_addition: amount });
      onSettingsChange(amount);
      setMessage('设置保存成功！');
      
      // 3秒后清除成功消息
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('保存设置失败:', error);
      setMessage('保存设置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMonthlyAddition(value);
    setMessage(''); // 清除之前的消息
  };

  const yearlyAddition = (parseFloat(monthlyAddition) || 0) * 12;

  if (loading) {
    return (
      <div className="section">
        <h3 className="section-title">投资设置</h3>
        <div className="loading">加载设置中...</div>
      </div>
    );
  }

  return (
    <div className="section settings-section">
      <h3 className="section-title">💰 投资设置</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="settings-grid">
          <div className="settings-input-group">
            <label htmlFor="monthlyAddition">每月追加投资金额</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="monthlyAddition"
                value={monthlyAddition}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                disabled={saving}
              />
              <span className="input-unit">元</span>
            </div>
            <div className="input-help">
              设置每月定期追加的投资金额，将按各投资项目本金比例自动分配
            </div>
          </div>
          
          <div className="settings-summary">
            <h4>投资概览</h4>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">每月追加:</span>
                <span className="summary-value">{formatCurrency(parseFloat(monthlyAddition) || 0)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">每年追加:</span>
                <span className="summary-value">{formatCurrency(yearlyAddition)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">10年累计追加:</span>
                <span className="summary-value highlight">{formatCurrency(yearlyAddition * 10)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
          
          {monthlyAddition > 0 && (
            <button 
              type="button" 
              onClick={() => setMonthlyAddition(0)}
              className="btn btn-secondary"
              disabled={saving}
            >
              清零
            </button>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>

      <div className="settings-tips">
        <h4>💡 使用提示</h4>
        <ul>
          <li>每月追加投资将根据各投资项目的本金比例进行自动分配</li>
          <li>例如：A项目本金10万，B项目本金5万，追加3000元时，A项目分配2000元，B项目分配1000元</li>
          <li>设置为0表示不进行每月追加投资</li>
          <li>追加投资同样按照各项目的年化收益率进行复利计算</li>
        </ul>
      </div>

      <style jsx>{`
        .settings-section {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-left: 4px solid #28a745;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 25px;
        }
        
        .settings-input-group {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .settings-input-group label {
          display: block;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        
        .input-with-unit {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-with-unit input {
          flex: 1;
          padding-right: 40px;
        }
        
        .input-unit {
          position: absolute;
          right: 12px;
          color: #6c757d;
          font-weight: 500;
        }
        
        .input-help {
          margin-top: 8px;
          font-size: 0.875rem;
          color: #6c757d;
          line-height: 1.4;
        }
        
        .settings-summary {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .settings-summary h4 {
          margin: 0 0 15px 0;
          color: #333;
        }
        
        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f1f3f4;
        }
        
        .summary-item:last-child {
          border-bottom: none;
        }
        
        .summary-label {
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        .summary-value {
          font-weight: bold;
          color: #28a745;
        }
        
        .summary-value.highlight {
          color: #007bff;
          font-size: 1.1rem;
        }
        
        .settings-actions {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .message {
          padding: 12px 16px;
          border-radius: 4px;
          margin-top: 15px;
          font-weight: 500;
        }
        
        .message.success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
        
        .message.error {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        .settings-tips {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 25px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .settings-tips h4 {
          margin: 0 0 15px 0;
          color: #333;
        }
        
        .settings-tips ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .settings-tips li {
          margin-bottom: 8px;
          color: #6c757d;
          line-height: 1.5;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }
        
        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .settings-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
