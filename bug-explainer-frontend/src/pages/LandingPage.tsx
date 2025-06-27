import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <h1 className="text-4xl font-bold mb-6">Hello Developer!</h1>
      <p className="text-xl mb-8">
        Need to resolve your code issues? {showLogin ? "Login" : "Register"}{" "}
        here
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {showLogin ? (
          <>
            <Button asChild>
              <Link to="/auth/login">Sign In</Link>
            </Button>
            <Button variant="link" onClick={() => setShowLogin(false)}>
              Need to register instead?
            </Button>
          </>
        ) : (
          <>
            <Button asChild>
              <Link to="/auth/register">Create Account</Link>
            </Button>
            <Button variant="link" onClick={() => setShowLogin(true)}>
              Already have an account?
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
