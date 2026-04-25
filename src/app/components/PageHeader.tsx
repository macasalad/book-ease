import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
}

export default function PageHeader({ title, subtitle, rightContent }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#a3b18a]/30 pb-6 gap-4">
      <div className="flex-1">
        <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a] leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-[#8a8a8a] mt-2 font-medium">{subtitle}</p>
        )}
      </div>
      {rightContent && (
        <div className="flex flex-wrap items-center w-full md:w-auto gap-4">
          {rightContent}
        </div>
      )}
    </div>
  );
}
