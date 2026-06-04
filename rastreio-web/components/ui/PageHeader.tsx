import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumb && (
        <div className="flex items-center gap-2 mb-4 text-sm text-primary-300">
          {breadcrumb.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              {item.href ? (
                <a href={item.href} className="text-accent-400 hover:underline">
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {description && (
            <p className="mt-2 text-primary-300">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
