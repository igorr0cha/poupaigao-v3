
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart, 
  Receipt, 
  Settings,
  LogOut,
  Calendar,
  FileText,
  Sparkles,
  DollarSign,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const isMobile = useIsMobile();

  const navItems = [
    { 
      title: 'Dashboard', 
      url: '/', 
      icon: Home,
      description: 'Visão geral das finanças',
      color: 'from-emerald-500 to-green-600'
    },
    { 
      title: 'Receitas', 
      url: '/revenues', 
      icon: TrendingUp,
      description: 'Gerencie suas receitas',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      title: 'Despesas', 
      url: '/expenses', 
      icon: TrendingDown,
      description: 'Controle seus gastos',
      color: 'from-red-500 to-rose-600'
    },
    { 
      title: 'Transações', 
      url: '/transactions', 
      icon: Receipt,
      description: 'Histórico de transações',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      title: 'Investimentos', 
      url: '/investments', 
      icon: PieChart,
      description: 'Carteira de investimentos',
      color: 'from-purple-500 to-violet-600'
    },
    { 
      title: 'Metas', 
      url: '/goals', 
      icon: Target,
      description: 'Objetivos financeiros',
      color: 'from-orange-500 to-amber-600'
    },
    { 
      title: 'Histórico', 
      url: '/monthly-history', 
      icon: Calendar,
      description: 'Histórico mensal',
      color: 'from-indigo-500 to-purple-600'
    },
    { 
      title: 'Relatórios', 
      url: '/reports', 
      icon: FileText,
      description: 'Análises e relatórios',
      color: 'from-pink-500 to-rose-600'
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

  // Menu flutuante para desktop quando recolhido
  if (isCollapsed && !isMobile) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={onToggle}
          className="relative group bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-600/50 shadow-2xl p-4 rounded-2xl transition-all duration-300 hover:scale-105"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-green-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative flex items-center space-x-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-2 border border-slate-600/50">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <Menu className="h-5 w-5 text-green-400" />
          </div>
        </Button>
      </div>
    );
  }

  // Menu completo para mobile (overlay) ou desktop expandido
  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      <div className={cn(
        "fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out",
        isMobile 
          ? isCollapsed 
            ? "-translate-x-full w-0" 
            : "translate-x-0 w-80"
          : isCollapsed 
            ? "w-0 -translate-x-full" 
            : "w-80"
      )}>
        {/* Backdrop blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-black/95 backdrop-blur-xl border-r border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent"></div>
        </div>

        <div className="relative h-full flex flex-col">
          {/* Header com Logo e Toggle */}
          <div className="p-4 sm:p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center justify-start">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-2 sm:p-3 border border-slate-600/50 shadow-2xl">
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                  </div>
                </div>
                
                <div className="ml-3 sm:ml-4">
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
                    PoupaIgão
                  </h1>
                  <div className="flex items-center mt-1">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-400 mr-1 animate-pulse" />
                    <span className="text-xs text-slate-400">Finanças Inteligentes</span>
                  </div>
                </div>
              </div>

              {/* Toggle Button */}
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Profile */}
            <div className="mt-4 sm:mt-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-green-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-slate-600/30">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-green-400/50 shadow-xl">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-sm sm:text-lg">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full border-2 sm:border-3 border-slate-900 animate-pulse shadow-lg"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-green-300 text-xs sm:text-sm font-medium">Bem-vindo,</p>
                      <p className="text-white font-bold text-base sm:text-lg truncate">{userName}</p>
                      <p className="text-xs sm:text-sm text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-4 sm:py-6 px-3 sm:px-4 overflow-y-auto">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 sm:px-4">
                Menu Principal
              </h3>
            </div>

            <nav className="space-y-1 sm:space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                
                return (
                  <div key={item.title} className="group">
                    <NavLink
                      to={item.url}
                      onClick={isMobile ? onToggle : undefined}
                      className={cn(
                        "relative flex items-center rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] p-3 sm:p-4",
                        isActive 
                          ? `bg-gradient-to-r ${item.color} text-white shadow-2xl border border-white/20` 
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-600/50'
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 sm:h-8 bg-white rounded-full shadow-lg"></div>
                      )}

                      {/* Icon with glow effect */}
                      <div className="relative">
                        <item.icon className={cn(
                          "h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200",
                          isActive && "drop-shadow-lg"
                        )} />
                        {isActive && (
                          <div className="absolute -inset-2 bg-white/20 rounded-lg blur-sm animate-pulse"></div>
                        )}
                      </div>

                      <div className="ml-3 sm:ml-4 flex-1">
                        <span className="font-semibold text-sm sm:text-base block">{item.title}</span>
                        <p className={cn(
                          "text-xs mt-0.5 transition-colors",
                          isActive ? 'text-white/80' : 'text-slate-400'
                        )}>
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Arrow indicator */}
                      <ChevronRight className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200",
                        isActive ? 'text-white/60' : 'text-slate-500 group-hover:text-slate-300'
                      )} />

                      {/* Hover effect overlay */}
                      <div className={cn(
                        "absolute inset-0 rounded-xl sm:rounded-2xl transition-opacity duration-200",
                        isActive 
                          ? "bg-white/10" 
                          : "bg-slate-700/0 group-hover:bg-slate-700/30"
                      )}></div>
                    </NavLink>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-slate-700/50">
            <div className="space-y-1 sm:space-y-2">
              {/* Settings */}
              <NavLink
                to="/profile"
                onClick={isMobile ? onToggle : undefined}
                className="relative flex items-center rounded-xl transition-all duration-300 p-2.5 sm:p-3 text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-600/50"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="ml-2.5 sm:ml-3 font-medium text-sm sm:text-base">Configurações</span>
              </NavLink>
              
              {/* Logout */}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full flex items-center justify-start rounded-xl transition-all duration-300 p-2.5 sm:p-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/30 text-sm sm:text-base h-auto"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="ml-2.5 sm:ml-3 font-medium">Sair</span>
              </Button>
            </div>

            {/* Version info */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/30">
              <div className="text-center">
                <p className="text-xs text-slate-500">v2.0.0</p>
                <p className="text-xs text-slate-600 mt-1">© 2024 PoupaIgão</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão flutuante para mobile quando recolhido */}
      {isMobile && isCollapsed && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={onToggle}
            className="relative group bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-600/50 shadow-2xl p-3 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-green-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative flex items-center space-x-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-2 border border-slate-600/50">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <Menu className="h-4 w-4 text-green-400" />
            </div>
          </Button>
        </div>
      )}
    </>
  );
};

export default AppSidebar;
