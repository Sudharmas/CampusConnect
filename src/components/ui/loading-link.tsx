
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
    const { showLoader } = useLoading();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const hrefStr = href.toString();
      const isSamePage = hrefStr === pathname;
      const isHashLink = hrefStr.startsWith('#');

      if (!isSamePage && !isHashLink) {
        showLoader();
      } else if (isSamePage && !isHashLink) {
        // Prevent default behavior only if it's the exact same page path, but not a hash link
        e.preventDefault();
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
