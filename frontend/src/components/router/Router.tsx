import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  pathname: string;
  navigate: (to: string, replace?: boolean) => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: window.location.pathname || '/',
  navigate: () => {},
});

export const useRouter = () => useContext(RouterContext);

export const Router: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => {
    // Normalize path (strip trailing slash if not root)
    const p = window.location.pathname || '/';
    return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname || '/';
      setPathname(p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, replace = false) => {
    const cleanTo = to.length > 1 && to.endsWith('/') ? to.slice(0, -1) : to;
    if (replace) {
      window.history.replaceState({}, '', cleanTo);
    } else {
      window.history.pushState({}, '', cleanTo);
    }
    setPathname(cleanTo);
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
}

export const Link: React.FC<LinkProps> = ({ to, replace, onClick, children, ...rest }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      navigate(to, replace);
    }
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
