import { useState } from 'react';
import { useSignIn, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { BarChart3, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type LoginView = 'login' | 'forgot' | 'reset';

const Login = () => {
  const { isLoaded: isAuthLoaded, userId } = useClerkAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  // States
  const [view, setView] = useState<LoginView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redireciona se já logado
  if (isAuthLoaded && userId) {
    return <Navigate to="/dashboard-analitico" replace />;
  }

  // --- HANDLERS ---

  // 1. Login Normal
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success("Acesso autorizado!");
        navigate("/dashboard-analitico");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error(err.errors?.[0]?.message || "Credenciais inválidas.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Iniciar Recuperação (Enviar Código)
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setView('reset');
      toast.success("Código de recuperação enviado para seu e-mail!");
    } catch (err: any) {
      console.error("Reset Code Error:", err);
      toast.error(err.errors?.[0]?.message || "Erro ao enviar código.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Confirmar Reset (Código + Nova Senha)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success("Senha alterada com sucesso! Bem-vindo.");
        navigate("/dashboard-analitico");
      }
    } catch (err: any) {
      console.error("Reset Completion Error:", err);
      toast.error(err.errors?.[0]?.message || "Código inválido ou erro ao resetar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] animate-fade-in text-center">

        <div className="mb-10">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-primary text-primary-foreground mb-6 shadow-xl shadow-primary/20 scale-110">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            InsightFlow
          </h1>
          <p className="text-muted-foreground mt-3 text-sm font-medium uppercase tracking-[0.2em] opacity-80">
            Segurança de Dados Acadêmicos
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl text-left">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              {view !== 'login' && (
                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={() => setView('login')}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {view === 'login' ? 'Acessar Portal' : view === 'forgot' ? 'Recuperar Acesso' : 'Nova Senha'}
            </CardTitle>
            <CardDescription>
              {view === 'login' ? 'Identifique-se para continuar' :
                view === 'forgot' ? 'Enviaremos um código para seu e-mail' :
                  'Insira o código enviado e sua nova senha'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* TELA 1: LOGIN */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Identificador</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="E-mail organizacional" className="pl-10 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Chave de Acesso</Label>
                    <button type="button" className="text-xs text-primary hover:underline font-medium" onClick={() => setView('forgot')}>
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? "Validando..." : "Acessar Sistema"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            )}

            {/* TELA 2: ESQUECI SENHA (ENVIAR) */}
            {view === 'forgot' && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-mail de Cadastro</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="reset-email" type="email" placeholder="nome@uninassau.edu.br" className="pl-10 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar Código de Resgate"}
                  {!isLoading && <Mail className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            )}

            {/* TELA 3: RESETAR (CÓDIGO + SENHA) */}
            {view === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificação</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="code" type="text" placeholder="Digite o código" className="pl-10 h-11" value={code} onChange={(e) => setCode(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Chave de Acesso</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="new-password" type={showPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" className="pl-10 h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 font-bold bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                  {isLoading ? "Processando..." : "Confirmar Nova Senha"}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="border-t border-border/50 pt-6 mt-2 flex flex-col items-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
              Portal Monitorado pela Gerência de Dados
            </p>
          </CardFooter>
        </Card>

        <p className="text-[10px] text-muted-foreground mt-8 px-12 leading-relaxed uppercase opacity-60">
          Uso exclusivo para coordenadores e gestores autorizados.
        </p>
      </div>
    </div>
  );
};

export default Login;