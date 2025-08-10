/**
 * 使用更可靠的方法修复浮点数精度问题
 * @param {number} num 需要修复的数字
 * @returns {number} 修复后的数字
 */
const fixPrecision = (num) => {
  // 转换为字符串，然后解析，避免浮点数精度问题
  const str = num.toString();
  const decimal = str.indexOf('.');
  
  if (decimal === -1) {
    return num; // 整数，无需处理
  }
  
  // 保留两位小数
  const truncated = str.substring(0, decimal + 3);
  return parseFloat(truncated);
};

/**
 * 更安全的货币格式化
 * @param {number} amount 金额
 * @returns {string} 格式化后的金额字符串
 */
export const formatCurrency = (amount) => {
  // 直接使用原始数值，让 Intl.NumberFormat 处理精度
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '¥0.00';
  }
  
  // 使用 toFixed 确保精度，然后转回数字
  const fixedAmount = parseFloat(amount.toFixed(2));
  
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fixedAmount);
};

/**
 * 计算投资预测数据（包含年终奖）
 * @param {Array} investments 投资列表
 * @param {number} monthlyAddition 每月追加金额
 * @param {Array} bonuses 奖金列表
 * @returns {Array} 预测数据
 */
export const calculatePredictions = (investments, monthlyAddition = 0, bonuses = []) => {
  const predictions = [];
  const years = 10;
  
  // 只计算参与每月追加投资的项目的总本金
  const participatingInvestments = investments.filter(inv => inv.monthly_addition_enabled);
  const totalParticipatingPrincipal = participatingInvestments.reduce((sum, inv) => sum + inv.principal, 0);
  
  // 按月份分组奖金
  const bonusesByMonth = bonuses.reduce((groups, bonus) => {
    if (!groups[bonus.month]) {
      groups[bonus.month] = [];
    }
    groups[bonus.month].push(bonus);
    return groups;
  }, {});
  
  for (let year = 0; year <= years; year++) {
    let totalAssets = 0;
    const yearData = { year, investments: [], totalAssets: 0 };
    
    investments.forEach(investment => {
      const { principal, annual_rate, monthly_addition_enabled } = investment;
      const annualRate = annual_rate / 100;
      const monthlyRate = annualRate / 12;
      
      // 本金复利增长
      let value = principal * Math.pow(1 + annualRate, year);
      
      // 每月追加投资
      if (monthly_addition_enabled && monthlyAddition > 0 && year > 0 && totalParticipatingPrincipal > 0) {
        const proportion = principal / totalParticipatingPrincipal;
        const monthlyInvestment = monthlyAddition * proportion;
        const months = year * 12;
        
        if (monthlyRate > 0) {
          const annuityValue = monthlyInvestment * 
            ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
          value += annuityValue;
        } else {
          value += monthlyInvestment * months;
        }
      }
      
      // 奖金投资（在发放当月投入）
      if (monthly_addition_enabled && totalParticipatingPrincipal > 0) {
        const proportion = principal / totalParticipatingPrincipal;
        
        // 遍历每个月的奖金
        for (let month = 1; month <= 12; month++) {
          if (bonusesByMonth[month]) {
            const monthlyBonusTotal = bonusesByMonth[month].reduce((sum, bonus) => sum + bonus.amount, 0);
            const bonusInvestment = monthlyBonusTotal * proportion;
            
            // 计算从投资月份到当前年末的增长
            for (let investYear = 1; investYear <= year; investYear++) {
              // 计算从投资月份到年末的月数
              const monthsFromInvestment = (year - investYear) * 12 + (12 - month + 1);
              
              if (monthsFromInvestment > 0) {
                const bonusValue = bonusInvestment * Math.pow(1 + monthlyRate, monthsFromInvestment);
                value += bonusValue;
              } else if (monthsFromInvestment === 0 && investYear === year) {
                // 当年发放的奖金，在年末时的价值（不计增长）
                value += bonusInvestment;
              }
            }
          }
        }
      }
      
      // 使用 toFixed 确保精度
      value = parseFloat(value.toFixed(2));
      
      yearData.investments.push({
        name: investment.name,
        value: value,
        monthly_addition_enabled: monthly_addition_enabled
      });
      
      totalAssets += value;
    });
    
    yearData.totalAssets = parseFloat(totalAssets.toFixed(2));
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
    dailyIncome: parseFloat((investment.principal * investment.annual_rate / 100 / 365).toFixed(2)),
    monthly_addition_enabled: investment.monthly_addition_enabled
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
    monthlyIncome: parseFloat((investment.principal * investment.annual_rate / 100 / 12).toFixed(2)),
    monthly_addition_enabled: investment.monthly_addition_enabled
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
    yearlyIncome: parseFloat((investment.principal * investment.annual_rate / 100).toFixed(2)),
    monthly_addition_enabled: investment.monthly_addition_enabled
  }));
};

/**
 * 格式化百分比显示
 * @param {number} rate 比率
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercentage = (rate) => {
  const fixedRate = parseFloat(rate.toFixed(2));
  return `${fixedRate.toFixed(2)}%`;
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
  
  return parseFloat((weightedRate / totalPrincipal).toFixed(4));
};

/**
 * 计算总本金
 * @param {Array} investments 投资列表
 * @returns {number} 总本金
 */
export const calculateTotalPrincipal = (investments) => {
  const total = investments.reduce((sum, inv) => sum + inv.principal, 0);
  return parseFloat(total.toFixed(2));
};

/**
 * 计算参与每月追加投资的总本金
 * @param {Array} investments 投资列表
 * @returns {number} 参与每月追加投资的总本金
 */
export const calculateParticipatingPrincipal = (investments) => {
  const total = investments
    .filter(inv => inv.monthly_addition_enabled)
    .reduce((sum, inv) => sum + inv.principal, 0);
  return parseFloat(total.toFixed(2));
};

/**
 * 计算年度奖金总额
 * @param {Array} bonuses 奖金列表
 * @returns {number} 年度奖金总额
 */
export const calculateTotalAnnualBonus = (bonuses) => {
  const total = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
  return parseFloat(total.toFixed(2));
};

/**
 * 按月份分组奖金
 * @param {Array} bonuses 奖金列表
 * @returns {Object} 按月份分组的奖金
 */
export const groupBonusesByMonth = (bonuses) => {
  return bonuses.reduce((groups, bonus) => {
    const month = bonus.month;
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push({
      ...bonus,
      amount: parseFloat(bonus.amount.toFixed(2))
    });
    return groups;
  }, {});
};

/**
 * 计算奖金投资时间线
 * @param {Array} bonuses 奖金列表
 * @param {number} years 预测年数
 * @returns {Array} 奖金投资时间线
 */
export const calculateBonusTimeline = (bonuses, years = 10) => {
  const timeline = [];
  const bonusesByMonth = groupBonusesByMonth(bonuses);
  
  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      if (bonusesByMonth[month]) {
        const monthlyBonusTotal = bonusesByMonth[month].reduce((sum, bonus) => sum + bonus.amount, 0);
        timeline.push({
          year,
          month,
          monthName: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'][month - 1],
          amount: parseFloat(monthlyBonusTotal.toFixed(2)),
          bonuses: bonusesByMonth[month]
        });
      }
    }
  }
  
  return timeline;
};
