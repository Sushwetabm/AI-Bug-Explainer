import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-start">
        <div className="flex items-center gap-4 mr-auto">
          <Link
            to={user ? "/app/chat" : "/"}
            className="flex items-center gap-2 font-semibold"
          >
            {/* Logo image */}
            <img
              src="/logo.png"
              alt="AI Bug Explainer Logo"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="ml-2 text-lg font-bold tracking-wide">
              AI Bug Explainer
            </span>
          </Link>

          {user && ( // Only show nav links when logged in
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link
                to="/app/chat"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Chat
              </Link>
              <Link
                to="/app/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Dashboard
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 mr-2">
          <ThemeToggle />
          {user ? (
            <div className="relative z-[9999]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:bg-accent hover:shadow-md transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8 border-2 border-transparent hover:border-primary/20">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 z-[10000] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-2"
                  align="end"
                  forceMount
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="font-normal p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md mb-2">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400 mt-1">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                  <DropdownMenuItem
                    onClick={() => navigate("/app/profile")}
                    className="cursor-pointer px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <span className="font-medium">Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/app/faqs")}
                    className="cursor-pointer px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <span className="font-medium">FAQs & Contact Us</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                  >
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/auth/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/auth/register")}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
