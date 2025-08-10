import React, { useState, useEffect } from 'react';

const InvestmentForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    annual_rate: '',
    monthly_addition_enabled: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当 initialData 改变时，更新表单数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        principal: initialData.principal || '',
        annual_rate: initialData.annual_rate || '',
        monthly_addition_enabled: initialData.monthly_addition_enabled !== undefined 
          ? initialData.monthly_addition_enabled 
          : true
      });
    } else {
      setFormData({
        name: '',
        principal: '',
        annual_rate: '',
        monthly_addition_enabled: true
      });
    }
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '投资名称不能为空';
    }
    
    if (!formData.principal || parseFloat(formData.principal) <= 0) {
      newErrors.principal = '本金必须大于0';
    }
    
    if (formData.annual_rate === '' || parseFloat(formData.annual_rate) < 0) {
      newErrors.annual_rate = '年化收益率不能为负数';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 阻止表单默认提交行为
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        principal: parseFloat(formData.principal),
        annual_rate: parseFloat(formData.annual_rate),
        monthly_addition_enabled: formData.monthly_addition_enabled
      });
      
      // 只有在添加新投资时才清空表单
      if (!initialData) {
        setFormData({ 
          name: '', 
          principal: '', 
          annual_rate: '',
          monthly_addition_enabled: true
        });
        setErrors({});
      }
    } catch (error) {
      console.error('提交表单失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCancel = () => {
    setFormData({ 
      name: '', 
      principal: '', 
      annual_rate: '',
      monthly_addition_enabled: true
    });
    setErrors({});
    onCancel();
  };

  return (
    <div className="section">
      <h3 className="section-title">
        {initialData ? `编辑投资 - ${initialData.name}` : '添加新投资'}
      </h3>
      
      {initialData && (
        <div className="edit-notice">
          <p>💡 正在编辑投资项目，您可以修改所有投资参数</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">投资名称 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-control ${errors.name ? 'error' : ''}`}
            placeholder="例如：支付宝余额宝、银行定期存款等"
            disabled={isSubmitting}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="principal">本金 (元) *</label>
            <input
              type="number"
              id="principal"
              name="principal"
              value={formData.principal}
              onChange={handleChange}
              className={`form-control ${errors.principal ? 'error' : ''}`}
              placeholder="请输入投资本金"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
            {errors.principal && <div className="error-message">{errors.principal}</div>}
            {initialData && (
              <div className="field-help">
                原本金: ¥{initialData.principal.toFixed(2)}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="annual_rate">年化收益率 (%) *</label>
            <input
              type="number"
              id="annual_rate"
              name="annual_rate"
              value={formData.annual_rate}
              onChange={handleChange}
              className={`form-control ${errors.annual_rate ? 'error' : ''}`}
              placeholder="例如：3.5 表示3.5%的年化收益率"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
            {errors.annual_rate && <div className="error-message">{errors.annual_rate}</div>}
            {initialData && (
              <div className="field-help">
                原年化收益率: {initialData.annual_rate.toFixed(2)}%
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="monthly_addition_enabled"
                checked={formData.monthly_addition_enabled}
                onChange={handleChange}
                disabled={isSubmitting}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                📈 参与每月追加投资
              </span>
            </label>
            <div className="checkbox-help">
              {formData.monthly_addition_enabled ? (
                <span className="help-enabled">
                  ✅ 该投资将按比例分配每月追加的资金
                </span>
              ) : (
                <span className="help-disabled">
                  ❌ 该投资不参与每月追加投资分配
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : (initialData ? '更新投资' : '添加投资')}
          </button>
          
          {initialData && (
            <button 
              type="button" 
              onClick={handleCancel} 
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              取消编辑
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .edit-notice {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          border-left: 4px solid #2196f3;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .edit-notice p {
          margin: 0;
          color: #1565c0;
          font-weight: 500;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .checkbox-group {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .checkbox-input {
          width: 18px;
          height: 18px;
          margin-right: 10px;
          cursor: pointer;
        }
        
        .checkbox-text {
          font-size: 16px;
          color: #333;
        }
        
        .checkbox-help {
          margin-left: 28px;
          font-size: 14px;
        }
        
        .help-enabled {
          color: #28a745;
          font-weight: 500;
        }
        
        .help-disabled {
          color: #6c757d;
          font-weight: 500;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 5px;
        }
        
        .field-help {
          color: #6c757d;
          font-size: 0.875rem;
          margin-top: 5px;
          font-style: italic;
        }
        
        .form-control.error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
        }
        
        .form-actions {
          margin-top: 20px;
          display: flex;
          gap: 15px;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default InvestmentForm;
