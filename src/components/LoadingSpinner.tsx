import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ message = "Carregando..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingSpinner;