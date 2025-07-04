
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, ArrowLeft, User, Lock, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, signOut, updatePassword, deleteAccount } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePasswordConfirm, setDeletePasswordConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile({ display_name: displayName });
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar perfil.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { error } = await uploadAvatar(file);
      if (error) throw error;
      
      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload da foto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword) {
      toast({
        title: "Erro",
        description: "Digite sua senha atual para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      // Primeiro, verificar se a senha atual está correta
      const { signIn } = useAuth();
      const { error: authError } = await signIn(user?.email || '', currentPassword);
      if (authError) {
        throw new Error('Senha atual incorreta');
      }

      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePasswordConfirm) {
      toast({
        title: "Erro",
        description: "Digite sua senha para confirmar a exclusão.",
        variant: "destructive",
      });
      return;
    }

    setDeleting(true);
    try {
      const { error } = await deleteAccount(deletePasswordConfirm);
      if (error) throw error;
      
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });
      
      // Sair da autenticação e redirecionar para login
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir conta.",
        variant: "destructive",
      });
      setDeleting(false);
      setDeletePasswordConfirm('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>
      
      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6 md:mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 shadow-2xl">
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-xl md:text-2xl font-bold text-white flex items-center">
                <User className="mr-3 h-5 w-5 md:h-6 md:w-6 text-green-400" />
                Meu Perfil
              </CardTitle>
              <p className="text-gray-400 text-sm md:text-base">Gerencie suas informações pessoais</p>
            </CardHeader>
            
            <CardContent className="space-y-6 px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-green-600 text-white text-base md:text-lg">
                      {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                
                <p className="text-gray-400 text-xs md:text-sm text-center">
                  Clique no ícone da câmera para alterar sua foto
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 text-sm md:text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-900/50 border-gray-700 text-gray-400 text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-gray-300 text-sm md:text-base">Nome de Exibição</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Seu nome"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-green-500 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Seção de Alteração de Senha */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center">
                  <Lock className="mr-2 h-4 w-4 md:h-5 md:w-5 text-green-400" />
                  Alterar Senha
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-300 text-sm md:text-base">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-green-500 text-sm md:text-base"
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-300 text-sm md:text-base">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-green-500 text-sm md:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300 text-sm md:text-base">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-green-500 text-sm md:text-base"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={!currentPassword || !newPassword || !confirmPassword || updatingPassword}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm md:text-base"
                  >
                    {updatingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Alterar Senha
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 border-t border-gray-700 gap-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white text-sm md:text-base w-full sm:w-auto"
                  >
                    Sair da Conta
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-sm md:text-base w-full sm:w-auto"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-red-600/30 mx-4 max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white text-base md:text-lg">Excluir Conta</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 text-sm md:text-base">
                          Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                          Digite sua senha para confirmar:
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Input
                        type="password"
                        placeholder="Digite sua senha"
                        value={deletePasswordConfirm}
                        onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white text-sm md:text-base"
                      />
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel 
                          onClick={() => setDeletePasswordConfirm('')}
                          className="bg-gray-700 text-white border-gray-600 text-sm md:text-base w-full sm:w-auto"
                        >
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm md:text-base w-full sm:w-auto"
                        >
                          {deleting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Excluindo...
                            </>
                          ) : (
                            'Excluir Conta'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm md:text-base w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
