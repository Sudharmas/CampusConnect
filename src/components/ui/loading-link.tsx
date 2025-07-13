
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
      const isSamePage = href.toString() === pathname;

      if (isSamePage) {
        // If it's the same page, do not show the loader and prevent default navigation.
        // This stops the infinite spinner issue.
        if (href.toString().startsWith('#')) {
            // Allow default behavior for hash links on the same page
        } else {
            e.preventDefault();
        }
      } else {
        // Only show loader for navigations to a different page.
        showLoader();
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
