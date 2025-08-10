import React, { useState } from 'react';

const InvestmentForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    principal: initialData?.principal || '',
    annual_rate: initialData?.annual_rate || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '投资名称不能为空';
    }
    
    if (!formData.principal || parseFloat(formData.principal) <= 0) {
      newErrors.principal = '本金必须大于0';
    }
    
    if (!formData.annual_rate || parseFloat(formData.annual_rate) < 0) {
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

  return (
    <div className="section">
      <h3 className="section-title">
        {initialData ? '编辑投资' : '添加新投资'}
      </h3>
      
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
              onClick={onCancel} 
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              取消编辑
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 5px;
        }
        
        .form-control.error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
        }
        
        .form-actions {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default InvestmentForm;
