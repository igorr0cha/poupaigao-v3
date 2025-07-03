
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface EnhancedFinancialChartProps {
  income: number;
  expenses: number;
  showComparison?: boolean;
}

export const EnhancedFinancialChart = ({ income, expenses, showComparison = false }: EnhancedFinancialChartProps) => {
  const data = [
    { name: 'Receitas', value: income, color: '#10B981' },
    { name: 'Despesas', value: expenses, color: '#EF4444' },
  ];

  const comparisonData = [
    { name: 'Receitas', value: income, fill: '#10B981' },
    { name: 'Despesas', value: expenses, fill: '#EF4444' },
  ];

  const COLORS = ['#10B981', '#EF4444'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-3 rounded-lg border border-green-500/30 shadow-lg">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-green-400 font-bold">
            R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-400 text-sm">
            {((payload[0].value / (income + expenses)) * 100).toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  if (showComparison) {
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
            <YAxis tick={{ fill: '#9CA3AF' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#DC2626" stopOpacity={1} />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={130}
            paddingAngle={8}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? 'url(#incomeGradient)' : 'url(#expenseGradient)'}
                stroke="#1F2937"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: 'white', paddingTop: '20px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
