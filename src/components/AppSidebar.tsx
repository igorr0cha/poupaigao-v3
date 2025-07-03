
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart, 
  Receipt, 
  User,
  Settings,
  LogOut,
  Calendar,
  FileText
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
} from "@/components/ui/sidebar";
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

const AppSidebar = () => {
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

  return (
    <Sidebar className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-green-500/20">
      <SidebarHeader className="p-6 border-b border-green-500/20">
        <div className="space-y-4">
          {/* Logo */}
          <div className="text-center">
            <div className="relative inline-block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
                PoupaIgão
              </h1>
              <div className="absolute -top-1 -right-2 animate-bounce">
                <span className="text-xl">💰</span>
              </div>
            </div>
            <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-300 mx-auto rounded-full mt-2"></div>
          </div>

          {/* User Profile */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-3 border border-green-500/20">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-green-400/50">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-green-300 text-xs">Bem-vindo,</p>
                <p className="text-white font-semibold truncate text-sm">{userName}</p>
                <p className="text-xs text-green-400/70 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-400/70 font-medium">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300
                          ${isActive 
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30' 
                            : 'text-gray-300 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-500/10 hover:text-white'
                          }
                        `}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <div className="group-data-[collapsible=icon]:hidden">
                          <span className="font-medium text-sm">{item.title}</span>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-green-500/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/profile"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 hover:text-white"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden font-medium text-sm">Configurações</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 text-gray-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 hover:text-white"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden font-medium text-sm">Sair</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* Trigger Button */}
        <div className="mt-4">
          <SidebarTrigger className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
