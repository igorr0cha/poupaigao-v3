
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

const Accounts = () => {
  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Contas</h1>
            <p className="text-gray-400">Sistema de contas foi simplificado</p>
          </div>
        </div>

        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Sistema Simplificado</h3>
          <p className="text-gray-500 mb-4">
            O sistema de contas foi simplificado. Agora você pode ajustar seu valor em conta 
            diretamente nas ações rápidas do dashboard.
          </p>
          <p className="text-gray-400">
            Use o dashboard principal para gerenciar suas finanças de forma mais simples e direta.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
