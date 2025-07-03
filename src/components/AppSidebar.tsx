import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart, 
  Receipt, 
  BarChart3, 
  User,
  Menu,
  X,
  Settings,
  LogOut,
  Wallet,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

const AppSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const navItems = [
    { 
      title: 'Dashboard', 
      url: '/', 
      icon: Home,
      description: 'Visão geral das finanças'
    },
    { 
      title: 'Receitas', 
      url: '/revenues', 
      icon: TrendingUp,
      description: 'Gerencie suas receitas'
    },
    { 
      title: 'Despesas', 
      url: '/expenses', 
      icon: TrendingDown,
      description: 'Controle seus gastos'
    },
    { 
      title: 'Transações', 
      url: '/transactions', 
      icon: Receipt,
      description: 'Histórico de transações'
    },
    { 
      title: 'Investimentos', 
      url: '/investments', 
      icon: PieChart,
      description: 'Carteira de investimentos'
    },
    { 
      title: 'Metas', 
      url: '/goals', 
      icon: Target,
      description: 'Objetivos financeiros'
    },
    { 
      title: 'Histórico', 
      url: '/monthly-history', 
      icon: Calendar,
      description: 'Histórico mensal'
    },
    { 
      title: 'Relatórios', 
      url: '/reports', 
      icon: FileText,
      description: 'Análises e relatórios'
    }
  ];

  const userName = profile?.display_name || user?.email?.split('@')[0] || 'Usuário';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          border-r border-green-500/20 shadow-2xl backdrop-blur-xl z-50
          transition-all duration-500 ease-in-out transform flex flex-col
          ${isExpanded ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0 lg:pt-20' /* <-- AJUSTE AQUI */}
          lg:relative lg:h-screen
        `}
      >
        {/* Header do Sidebar */}
        <div className={`p-6 border-b border-green-500/20 ${!isExpanded ? 'lg:p-4' : ''}`}>
          {isExpanded ? (
            <div className="space-y-4">
              {/* Logo */}
              <div className="text-center">
                <div className="relative inline-block">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
                    PoupaIgão
                  </h1>
                  <div className="absolute -top-1 -right-2 animate-bounce">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-300 mx-auto rounded-full mt-2"></div>
              </div>

              {/* User Profile */}
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 ring-2 ring-green-400/50">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-300 text-sm">Bem-vindo,</p>
                    <p className="text-white font-semibold truncate">{userName}</p>
                    <p className="text-xs text-green-400/70">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex justify-center">
              <Avatar className="h-10 w-10 ring-2 ring-green-400/50">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.url;
              
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={`
                    group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/20' 
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-500/10 hover:text-white hover:border hover:border-green-500/20'
                    }
                    ${!isExpanded ? 'lg:justify-center lg:px-2' : ''}
                    relative overflow-hidden
                  `}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Efeito de brilho hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12" />
                  
                  <item.icon className={`
                    h-5 w-5 flex-shrink-0 transition-all duration-300 relative z-10
                    ${isActive ? 'text-green-400 scale-110' : 'group-hover:scale-110 group-hover:text-green-400'}
                  `} />
                  
                  {(isExpanded || (!isExpanded && window.innerWidth >= 1024)) && (
                    <div className={`${!isExpanded ? 'lg:hidden' : ''} relative z-10`}>
                      <span className="font-medium transition-all duration-300 group-hover:translate-x-1">
                        {item.title}
                      </span>
                      {isExpanded && (
                        <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Indicador de ativo */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded-l-full shadow-lg shadow-green-400/50" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-green-500/20 ${!isExpanded ? 'lg:p-2' : ''}`}>
          <div className="space-y-2">
            <NavLink
              to="/profile"
              className={`
                group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 hover:text-white hover:border hover:border-blue-500/20
                ${!isExpanded ? 'lg:justify-center lg:px-2' : ''}
              `}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {(isExpanded || (!isExpanded && window.innerWidth >= 1024)) && (
                <span className={`${!isExpanded ? 'lg:hidden' : ''} font-medium`}>
                  Configurações
                </span>
              )}
            </NavLink>

            <Button
              onClick={handleSignOut}
              variant="ghost"
              className={`
                w-full group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                text-gray-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 hover:text-white hover:border hover:border-red-500/20
                ${!isExpanded ? 'lg:justify-center lg:px-2' : ''}
              `}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {(isExpanded || (!isExpanded && window.innerWidth >= 1024)) && (
                <span className={`${!isExpanded ? 'lg:hidden' : ''} font-medium`}>
                  Sair
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Toggle Button - sempre visível */}
      <Button
        onClick={toggleSidebar}
        className={`
          fixed top-4 z-[60] bg-gradient-to-r from-green-500 to-emerald-500 
          hover:from-green-400 hover:to-emerald-400 text-white shadow-xl 
          hover:shadow-2xl transition-all duration-300 hover:scale-110 p-3 rounded-xl
          border border-green-400/20 backdrop-blur-sm
          ${isExpanded ? 'left-[21rem] lg:left-[21rem]' : 'left-4'}
        `}
        size="sm"
      >
        {isExpanded ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>
    </>
  );
};

export default AppSidebar;