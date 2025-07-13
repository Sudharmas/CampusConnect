
'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useLoading } from '@/context/loading-context';
import { usePathname } from 'next/navigation';

interface LoadingLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

const LoadingLink = React.forwardRef<HTMLAnchorElement, LoadingLinkProps>(
  ({ children, onClick, href, ...props }, ref) => {
    const { showLoader, hideLoader } = useLoading();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Check if the link's destination is the same as the current page
      const isSamePage = href === pathname;

      if (!isSamePage) {
        showLoader();
      } else {
        // For same-page clicks, briefly show and then hide the loader
        // to acknowledge the click without getting stuck.
        showLoader();
        setTimeout(() => hideLoader(), 100); 
      }
      
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Link href={href} {...props} onClick={handleClick} ref={ref}>
        {children}
      </Link>
    );
  }
);

LoadingLink.displayName = 'LoadingLink';

export default LoadingLink;
