import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "5xl" | "7xl";
  className?: string;
  withBlobs?: boolean;
}

export default function PageContainer({ 
  children, 
  maxWidth = "7xl", 
  className = "",
  withBlobs = true
}: PageContainerProps) {
  return (
    <main className={`min-h-[calc(100vh-64px)] text-[#4a4a4a] overflow-x-hidden relative font-sans ${className}`}>
      {withBlobs && (
        <>
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}
      <div className={`mx-auto ${maxWidth === '7xl' ? 'max-w-7xl' : 'max-w-5xl'} px-6 py-8 relative z-10`}>
        {children}
      </div>
    </main>
  );
}
