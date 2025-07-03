
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BalanceChartProps {
  data: Array<{
    month: string;
    balance: number;
    revenue: number;
    expenses: number;
  }>;
}

const BalanceChart = ({ data }: BalanceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="month" 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F3F4F6'
          }}
          formatter={(value: number, name: string) => {
            const labels = {
              balance: 'Saldo',
              revenue: 'Receitas',
              expenses: 'Despesas'
            };
            return [
              `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              labels[name as keyof typeof labels] || name
            ];
          }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Area 
          type="monotone" 
          dataKey="balance" 
          stroke="#3B82F6" 
          fillOpacity={1} 
          fill="url(#balanceGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default BalanceChart;
