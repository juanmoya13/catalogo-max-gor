import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const isAccessingAdmin = request.nextUrl.pathname.startsWith("/admin");
  const isAccessingLogin = request.nextUrl.pathname === "/login";
  const hasSupabaseConfig = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY,
  );

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!hasSupabaseConfig) {
    if (isAccessingAdmin) {
      return NextResponse.redirect(new URL("/login?error=missing_supabase", request.url));
    }

    return response;
  }

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAccessingAdmin && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAccessingLogin && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
