'use client'; 

import { useRouter } from 'next/navigation'; 
import Link from 'next/link';

export default function BotonSeguirComprando({className}: {className?: string}) {
  const router = useRouter();

  const handleSeguirComprando = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const previousUrl = document.referrer;
    const hasSameOriginPreviousPage = previousUrl && new URL(previousUrl).origin === window.location.origin;

    if (hasSameOriginPreviousPage) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <Link
      href="/"
      onClick={handleSeguirComprando}
      className={className}
    >
      SEGUIR COMPRANDO
    </Link>
  );
}
