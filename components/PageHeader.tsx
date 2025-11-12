import React from 'react';

interface PageHeaderProps {
  title: string;
  actionText?: string;
  onActionClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, actionText, onActionClick }) => {
  return (
    <div className="mb-6 md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-text-primary sm:text-3xl sm:truncate">
          {title}
        </h2>
      </div>
      {actionText && onActionClick && (
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={onActionClick}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-transform duration-150 active:scale-95"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;