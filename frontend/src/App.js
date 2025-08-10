import React, { useState, useEffect } from 'react';
import './App.css';
import InvestmentForm from './components/InvestmentForm';
import InvestmentList from './components/InvestmentList';
import PredictionChart from './components/PredictionChart';
import Settings from './components/Settings';
import { investmentAPI } from './services/api';

function App() {
  const [investments, setInvestments] = useState([]);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [monthlyAddition, setMonthlyAddition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await investmentAPI.getAll();
      setInvestments(response.data || []);
    } catch (error) {
      console.error('加载投资数据失败:', error);
      setError('加载投资数据失败，请检查网络连接或刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvestment = async (investmentData) => {
    try {
      await investmentAPI.create(investmentData);
      await loadInvestments();
      setError('');
      // 可以添加成功提示
    } catch (error) {
      console.error('创建投资失败:', error);
      setError('添加投资失败，请重试');
      throw error; // 重新抛出错误，让表单组件处理
    }
  };

  const handleUpdateInvestment = async (investmentData) => {
    try {
      await investmentAPI.update(editingInvestment.id, investmentData);
      setEditingInvestment(null);
      await loadInvestments();
      setError('');
    } catch (error) {
      console.error('更新投资失败:', error);
      setError('更新投资失败，请重试');
      throw error;
    }
  };

  const handleDeleteInvestment = async (id) => {
    try {
      await investmentAPI.delete(id);
      await loadInvestments();
      setError('');
    } catch (error) {
      console.error('删除投资失败:', error);
      setError('删除投资失败，请重试');
    }
  };

  const handleEditInvestment = (investment) => {
    setEditingInvestment(investment);
    // 滚动到表单位置
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingInvestment(null);
  };

  const handleSettingsChange = (newMonthlyAddition) => {
    setMonthlyAddition(newMonthlyAddition);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>正在加载投资数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">SFAS</h1>
        <p className="App-subtitle">Smart Financial Asset System - 智能投资理财账本</p>
      </header>
      
      {error && (
        <div className="alert alert-warning">
          <strong>⚠️ 错误：</strong> {error}
          <button 
            onClick={() => setError('')} 
            className="alert-close"
            aria-label="关闭错误提示"
          >
            ×
          </button>
        </div>
      )}
      
      <Settings onSettingsChange={handleSettingsChange} />
      
      <InvestmentForm
        onSubmit={editingInvestment ? handleUpdateInvestment : handleCreateInvestment}
        initialData={editingInvestment}
        onCancel={handleCancelEdit}
      />
      
      <InvestmentList
        investments={investments}
        onEdit={handleEditInvestment}
        onDelete={handleDeleteInvestment}
      />
      
      <PredictionChart 
        investments={investments} 
        monthlyAddition={monthlyAddition}
      />

      <footer className="App-footer">
        <p>© 2024 SFAS - 让投资理财更简单、更智能</p>
      </footer>

      <style jsx>{`
        .loading {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 400px;
          color: #6c757d;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .alert {
          position: relative;
          padding: 15px 50px 15px 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .alert-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        }
        
        .alert-close {
          position: absolute;
          top: 50%;
          right: 15px;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 24px;
          font-weight: bold;
          color: inherit;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .alert-close:hover {
          opacity: 0.7;
        }
        
        .App-footer {
          text-align: center;
          padding: 30px 20px;
          margin-top: 40px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

export default App;
