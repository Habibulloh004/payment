import { NextResponse } from "next/server";

export function middleware(req) {
  // Get the cookies from the request
  const authToken = req.cookies.get("authToken");

  // Define the URL to redirect to if the token is missing
  const redirectUrl = new URL(
    `https://joinposter.com/api/auth?application_id=3771&redirect_uri=https://payment-one-green.vercel.app/auth&response_type=code`,
    req.url
  ); // Replace with your desired URL

  // If the authToken is not present, redirect
  if (!authToken) {
    return NextResponse.redirect(redirectUrl);
  }

  // If the authToken exists, continue with the request
  return NextResponse.next();
}

// Configure the paths where the middleware should run
export const config = {
  matcher: ["/"], // Add paths to protect
};
