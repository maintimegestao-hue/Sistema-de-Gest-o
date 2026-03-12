
const AccessDenied = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Acesso Restrito
        </h2>
        <p className="text-muted-foreground">
          Você precisa estar logado para acessar esta página.
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;
