// no direct React hooks needed here
import { Link, useNavigate } from "react-router-dom";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon, MenuIcon } from "lucide-react";
import { useAuth } from "@/context/auth/useAuth";
import { getDashboardPathForRole } from "@/context/auth/authRouting";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, role, user, signOut } = useAuth();

  const dashboardPath = getDashboardPathForRole(role);

  const displayName = user?.name || "Account";
  const profilePhoto = user?.profilePhoto || "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
            LR
          </span>
          <span>LawRoute</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className={"gap-2"}>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link to="/find-a-lawyer">Find a Lawyer</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Legal Library</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-70 gap-1 p-1">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/legal-library/articles">Articles</Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/legal-library/documents">Documents</Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link to="/civil-issues">Civil Issues</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0">
              <div className="border-b border-border p-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 font-semibold text-foreground"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
                    LR
                  </span>
                  <span>LawRoute</span>
                </Link>
              </div>

              <div className="p-2">
                <div className="grid gap-1">
                  <SheetClose asChild>
                    <Link
                      to="/"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Home
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      to="/find-a-lawyer"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Find a Lawyer
                    </Link>
                  </SheetClose>

                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted"
                      >
                        Legal Library
                        <ChevronDownIcon className="size-4 text-muted-foreground" />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid gap-1 pl-2">
                        <SheetClose asChild>
                          <Link
                            to="/legal-library/articles"
                            className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            Articles
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            to="/legal-library/documents"
                            className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            Documents
                          </Link>
                        </SheetClose>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <SheetClose asChild>
                    <Link
                      to="/civil-issues"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Civil Issues
                    </Link>
                  </SheetClose>
                </div>
              </div>

              <div className="mt-auto border-t border-border p-4">
                {!isAuthenticated ? (
                  <div className="grid gap-2">
                    <SheetClose asChild>
                      <Link
                        to="/auth"
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground"
                      >
                        Sign in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/auth"
                        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Get started
                      </Link>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <SheetClose asChild>
                      <Link
                        to={dashboardPath}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <Avatar size="sm">
                          <AvatarImage src={profilePhoto} alt={displayName} />
                          <AvatarFallback>{initials || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{displayName}</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                      >
                        Log out
                      </button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {!isAuthenticated ? (
            <>
              <Link
                to="/auth"
                className="hidden rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground lg:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="hidden rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 lg:inline-flex"
              >
                Get started
              </Link>
            </>
          ) : (
            <div className="hidden lg:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 cursor-pointer hover:bg-transparent focus:bg-transparent"
                  >
                    <Avatar size="sm">
                      <AvatarImage src={profilePhoto} alt={displayName} />
                      <AvatarFallback>{initials || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-40 truncate text-sm font-medium text-foreground">
                      {displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to={dashboardPath}>Dashboard</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(event) => {
                        event.preventDefault();
                        handleSignOut();
                      }}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
