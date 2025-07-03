
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
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

const AppSidebar = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const navItems = [
    { 
      title: 'Dashboard', 
      url: '/', 
      icon: Home,
      description: 'Visão geral das finanças',
      gradient: 'from-emerald-500 to-green-600'
    },
    { 
      title: 'Receitas', 
      url: '/revenues', 
      icon: TrendingUp,
      description: 'Gerencie suas receitas',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      title: 'Despesas', 
      url: '/expenses', 
      icon: TrendingDown,
      description: 'Controle seus gastos',
      gradient: 'from-red-500 to-rose-600'
    },
    { 
      title: 'Transações', 
      url: '/transactions', 
      icon: Receipt,
      description: 'Histórico de transações',
      gradient: 'from-blue-500 to-cyan-600'
    },
    { 
      title: 'Investimentos', 
      url: '/investments', 
      icon: PieChart,
      description: 'Carteira de investimentos',
      gradient: 'from-purple-500 to-violet-600'
    },
    { 
      title: 'Metas', 
      url: '/goals', 
      icon: Target,
      description: 'Objetivos financeiros',
      gradient: 'from-orange-500 to-amber-600'
    },
    { 
      title: 'Histórico', 
      url: '/monthly-history', 
      icon: Calendar,
      description: 'Histórico mensal',
      gradient: 'from-indigo-500 to-purple-600'
    },
    { 
      title: 'Relatórios', 
      url: '/reports', 
      icon: FileText,
      description: 'Análises e relatórios',
      gradient: 'from-pink-500 to-rose-600'
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

  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <SidebarHeader className="border-b border-slate-800/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
        <div className="space-y-4 p-4">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 rounded-lg blur opacity-25"></div>
              <div className="relative bg-slate-950 rounded-lg px-4 py-2 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-6 w-6 text-green-400" />
                  {!isCollapsed && (
                    <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
                      PoupaIgão
                    </h1>
                  )}
                  <Sparkles className="h-4 w-4 text-green-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* User Profile */}
          {!isCollapsed && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-xl blur"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-green-400/50 shadow-lg">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-300 text-xs font-medium">Bem-vindo,</p>
                    <p className="text-white font-semibold truncate">{userName}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mini Profile for collapsed state */}
          {isCollapsed && (
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-green-400/50 shadow-lg">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-400/70 font-semibold text-xs uppercase tracking-wider mb-4">
            {!isCollapsed ? 'Menu Principal' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className="group relative overflow-hidden">
                      <NavLink
                        to={item.url}
                        className={`
                          flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                          ${isActive 
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}-500/25 border border-white/10` 
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-700/50'
                          }
                        `}
                      >
                        <div className="relative">
                          <item.icon className={`h-5 w-5 ${isActive ? 'drop-shadow-sm' : ''}`} />
                          {isActive && (
                            <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm"></div>
                          )}
                        </div>
                        {!isCollapsed && (
                          <div className="flex-1">
                            <span className="font-medium text-sm">{item.title}</span>
                            <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-400'} mt-0.5`}>
                              {item.description}
                            </p>
                          </div>
                        )}
                        {isActive && !isCollapsed && (
                          <div className="w-1 h-6 bg-white/30 rounded-full"></div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-4">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/profile"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-700/50"
              >
                <Settings className="h-5 w-5" />
                {!isCollapsed && <span className="font-medium text-sm">Configurações</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-slate-300 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
              >
                <LogOut className="h-5 w-5" />
                {!isCollapsed && <span className="font-medium text-sm">Sair</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* Trigger Button */}
        <div className="mt-4 flex justify-center">
          <SidebarTrigger className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
