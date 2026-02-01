import { useState } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { href: '#visao-geral', label: 'Visão Geral' },
  { href: '#evolucao', label: 'Evolução' },
  { href: '#distribuicao', label: 'Distribuições' },
  { href: '#matriculas', label: 'Matrículas' },
  { href: '#insights', label: 'Insights' },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="border-t border-border/50">
      <div className="container mx-auto px-6">
        {/* Desktop Menu */}
        <div className="hidden md:flex justify-center items-center h-12 space-x-2">
          {!isAdminPage && navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
            >
              {link.label}
            </a>
          ))}
          {profile?.role === 'admin' && (
            <Link
              to={isAdminPage ? "/dashboard-analitico" : "/admin"}
              className="px-4 py-2 rounded-md text-sm font-bold text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {isAdminPage ? "Voltar ao Dashboard" : "Painel Admin"}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button stacked with Admin Link */}
        <div className="md:hidden flex items-center justify-between h-12">
          <span className="font-semibold text-sm text-foreground">
            {isAdminPage ? "Painel Administrativo" : "Navegação Rápida"}
          </span>
          <div className="flex items-center gap-2">
            {profile?.role === 'admin' && (
              <Link to={isAdminPage ? "/dashboard-analitico" : "/admin"} className="p-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </Link>
            )}
            {!isAdminPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && !isAdminPage && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border/50 bg-background/95">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;