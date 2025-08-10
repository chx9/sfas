import React, { useState, useEffect } from 'react';

const InvestmentForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    annual_rate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当 initialData 改变时，更新表单数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        principal: initialData.principal || '',
        annual_rate: initialData.annual_rate || ''
      });
    } else {
      setFormData({
        name: '',
        principal: '',
        annual_rate: ''
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
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        principal: parseFloat(formData.principal),
        annual_rate: parseFloat(formData.annual_rate)
      });
      
      // 只有在添加新投资时才清空表单
      if (!initialData) {
        setFormData({ name: '', principal: '', annual_rate: '' });
        setErrors({});
      }
    } catch (error) {
      console.error('提交表单失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    setFormData({ name: '', principal: '', annual_rate: '' });
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
          <p>💡 正在编辑投资项目，您可以修改本金和年化收益率</p>
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
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default InvestmentForm;
