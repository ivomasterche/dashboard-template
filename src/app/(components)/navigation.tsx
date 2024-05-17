"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import logoutAction from "@/actions/logoutActions";
import { Button } from "@/components/ui/button";
import { IUserInfo } from "@/types";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

type NavigationProps = {
  user: IUserInfo | null;
};

export default function Navigation(props: NavigationProps) {
  const { user } = props;
  const [showHomeLink, setShowHomeLink] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  /**
   * Show the home link if the user is on the auth page
   */
  useEffect(() => {
    if (pathname.indexOf("auth") != -1) {
      setShowHomeLink(true);
    } else {
      setShowHomeLink(false);
    }
  }, [pathname]);

  /**
   * Check if the user is logged in
   */

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  const logOutClick = () => {
    logoutAction();
  };

  return (
    <NavigationMenu className="bg-secondary flex justify-end py-1 px-3 w-full">
      <NavigationMenuList className="flex justify-end  ">
        <NavigationMenuItem>
          {showHomeLink ? (
            <Link href="/" className="px-3" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Home
              </NavigationMenuLink>
            </Link>
          ) : (
            !isLoggedIn && (
              <Link href="/auth/login" className="px-3" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Log in here
                </NavigationMenuLink>
              </Link>
            )
          )}
        </NavigationMenuItem>

        {isLoggedIn && (
          <>
            {"Admin" === user?.role && (
              <NavigationMenuItem>
                <Link
                  href="/admin/dashboard"
                  className="px-3"
                  legacyBehavior
                  passHref
                >
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Admin
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}
            <NavigationMenuItem>
              <Link
                href="/user/dashboard"
                className="px-3"
                legacyBehavior
                passHref
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                href="/user/profile"
                className="px-3"
                legacyBehavior
                passHref
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Profile
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        )}

        {isLoggedIn && (
          <NavigationMenuItem>
            <NavigationMenuLink
              onClick={logOutClick}
              className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
            >
              Logout
            </NavigationMenuLink>{" "}
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
