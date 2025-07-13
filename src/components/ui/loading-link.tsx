
'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useLoading } from '@/context/loading-context';

interface LoadingLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

const LoadingLink = React.forwardRef<HTMLAnchorElement, LoadingLinkProps>(
  ({ children, onClick, ...props }, ref) => {
    const { showLoader } = useLoading();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      showLoader();
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Link {...props} onClick={handleClick} ref={ref}>
        {children}
      </Link>
    );
  }
);

LoadingLink.displayName = 'LoadingLink';

export default LoadingLink;
