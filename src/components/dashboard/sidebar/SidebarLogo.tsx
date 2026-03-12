
interface SidebarLogoProps {
  className?: string;
}

const SidebarLogo = ({ className = "" }: SidebarLogoProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">M</span>
      </div>
      <div>
        <span className="text-lg font-bold text-foreground block leading-tight">
          Maintime
        </span>
        <span className="text-xs text-muted-foreground">Soluções em Manutenções</span>
      </div>
    </div>
  );
};

export default SidebarLogo;
