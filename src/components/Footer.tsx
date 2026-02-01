const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-background border-t border-border/50 py-4">
      <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} UNINASSAU. Todos os direitos reservados.</p>
        <p className="mt-1">Desenvolvido por Edgar Tavares</p>
      </div>
    </footer>
  );
};

export default Footer;