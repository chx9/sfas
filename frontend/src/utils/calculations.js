/**
 * 计算投资预测数据
 * @param {Array} investments 投资列表
 * @param {number} monthlyAddition 每月追加金额
 * @returns {Array} 预测数据
 */
export const calculatePredictions = (investments, monthlyAddition = 0) => {
  const predictions = [];
  const years = 10;
  
  // 计算总本金用于分配每月追加资金
  const totalPrincipal = investments.reduce((sum, inv) => sum + inv.principal, 0);
  
  for (let year = 0; year <= years; year++) {
    let totalAssets = 0;
    const yearData = { year, investments: [], totalAssets: 0 };
    
    investments.forEach(investment => {
      const { principal, annual_rate } = investment;
      const annualRate = annual_rate / 100;
      const monthlyRate = annualRate / 12;
      const months = year * 12;
      
      // 本金复利增长
      let value = principal * Math.pow(1 + annualRate, year);
      
      // 如果有每月追加投资且不是第0年
      if (monthlyAddition > 0 && year > 0 && totalPrincipal > 0) {
        // 按本金比例分配每月追加资金
        const proportion = principal / totalPrincipal;
        const monthlyInvestment = monthlyAddition * proportion;
        
        // 使用年金现值公式计算每月追加投资的累计价值
        if (monthlyRate > 0) {
          const annuityValue = monthlyInvestment * 
            ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
          value += annuityValue;
        } else {
          // 如果利率为0，直接累加
          value += monthlyInvestment * months;
        }
      }
      
      yearData.investments.push({
        name: investment.name,
        value: Math.round(value * 100) / 100
      });
      
      totalAssets += value;
    });
    
    yearData.totalAssets = Math.round(totalAssets * 100) / 100;
    predictions.push(yearData);
  }
  
  return predictions;
};

/**
 * 计算每日收益
 * @param {Array} investments 投资列表
 * @returns {Array} 每日收益数据
 */
export const calculateDailyIncome = (investments) => {
  return investments.map(investment => ({
    name: investment.name,
    dailyIncome: Math.round((investment.principal * investment.annual_rate / 100 / 365) * 100) / 100
  }));
};

/**
 * 计算每月收益
 * @param {Array} investments 投资列表
 * @returns {Array} 每月收益数据
 */
export const calculateMonthlyIncome = (investments) => {
  return investments.map(investment => ({
    name: investment.name,
    monthlyIncome: Math.round((investment.principal * investment.annual_rate / 100 / 12) * 100) / 100
  }));
};

/**
 * 计算每年收益
 * @param {Array} investments 投资列表
 * @returns {Array} 每年收益数据
 */
export const calculateYearlyIncome = (investments) => {
  return investments.map(investment => ({
    name: investment.name,
    yearlyIncome: Math.round((investment.principal * investment.annual_rate / 100) * 100) / 100
  }));
};

/**
 * 格式化货币显示
 * @param {number} amount 金额
 * @returns {string} 格式化后的金额字符串
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * 格式化百分比显示
 * @param {number} rate 比率
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercentage = (rate) => {
  return `${rate.toFixed(2)}%`;
};

/**
 * 计算投资组合的平均年化收益率
 * @param {Array} investments 投资列表
 * @returns {number} 平均年化收益率
 */
export const calculateAverageRate = (investments) => {
  if (investments.length === 0) return 0;
  
  const totalPrincipal = investments.reduce((sum, inv) => sum + inv.principal, 0);
  if (totalPrincipal === 0) return 0;
  
  const weightedRate = investments.reduce((sum, inv) => 
    sum + (inv.annual_rate * inv.principal), 0
  );
  
  return weightedRate / totalPrincipal;
};

/**
 * 计算总本金
 * @param {Array} investments 投资列表
 * @returns {number} 总本金
 */
export const calculateTotalPrincipal = (investments) => {
  return investments.reduce((sum, inv) => sum + inv.principal, 0);
};
