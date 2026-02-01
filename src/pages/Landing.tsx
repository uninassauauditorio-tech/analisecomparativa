import { Link, Navigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart3, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/dashboard-analitico" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 select-none pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-2 px-3 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase">
          Inteligência de Dados Educacionais
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          Olinda <span className="text-primary italic">InsightFlow</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Transforme dados brutos em decisões estratégicas. Monitore o fluxo de alunos, captação e evasão com precisão e clareza.
        </p>
      </div>

      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <Link to="/login" className="group block">
          <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-md transition-all duration-500 hover:border-primary group-hover:shadow-[0_0_30px_-10px_rgba(var(--primary),0.3)] hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/20 transform group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="h-10 w-10" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Acessar Ecossistema</CardTitle>
                  <CardDescription className="text-base">Login Seguro via Supabase Auth</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pb-8">
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Acesse o dashboard analítico completo para visualizar KPIs, gráficos de evolução e insights gerados automaticamente para a UNINASSAU.
              </p>
              <div className="flex items-center font-bold text-primary text-lg group-hover:gap-3 transition-all duration-300">
                Iniciar Sessão
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <footer className="mt-24 text-center text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
        <p className="font-medium">&copy; {new Date().getFullYear()} Olinda InsightFlow • UNINASSAU</p>
        <p className="mt-2 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Powered by Edgar Tavares
        </p>
      </footer>
    </div>
  );
};

export default Landing;