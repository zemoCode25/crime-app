import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * Verify Supabase Bearer token from Authorization header.
 * Use this in API routes that need to be accessed from mobile apps.
 *
 * @param request - The incoming NextRequest
 * @returns Object with user data if authenticated, or error response
 */
export async function verifyBearerToken(request: NextRequest): Promise<
  | { success: true; user: { id: string; email?: string } }
  | { success: false; response: NextResponse }
> {
  const authHeader = request.headers.get("Authorization");

  // Check for Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: "Missing or invalid Authorization header" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  // Create a Supabase client and verify the token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  // Verify the token by getting the user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

/**
 * Helper to check if request is from browser (cookie-based) or mobile (Bearer token)
 * This allows API routes to work with both web and mobile clients.
 */
export async function verifyAuth(request: NextRequest): Promise<
  | { success: true; user: { id: string; email?: string }; source: "cookie" | "bearer" }
  | { success: false; response: NextResponse }
> {
  // First, try Bearer token (mobile)
  const authHeader = request.headers.get("Authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const result = await verifyBearerToken(request);
    if (result.success) {
      return { ...result, source: "bearer" };
    }
    return result;
  }

  // No Bearer token - try cookie-based authentication (web browser)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // We don't need to set cookies for read-only auth check
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
    },
    source: "cookie",
  };
}

