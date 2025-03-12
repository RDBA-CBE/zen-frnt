"use client";

// import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Bell, CreditCard, LogOut, Settings2Icon, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react"; // Using useState for dialog state management
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { icons } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import * as React from "react"

export default function Header() {
  const [dialogOpen, setDialogOpen] = useState(false); // Manage dialog state with useState
  const [group, setGroup] = useState(null)
  const router = useRouter();

  useEffect(() => {
    const Group: any = localStorage?.getItem("group")
    setGroup(Group)
  }, [])

  console.log("group", group)
  // Logout function to remove token and navigate to login page
  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem("token");
    // Close the dialog and redirect to login page
    setDialogOpen(false);
    router.push("/login");
  };

  // Cancel function to close the dialog without performing any action
  const handleCancel = () => {
    setDialogOpen(false); // Close the dialog
  };


  const components: { title: string; href: string; description: string }[] = [
    {
      title: "Alert Dialog",
      href: "/docs/primitives/alert-dialog",
      description:
        "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
      title: "Hover Card",
      href: "/docs/primitives/hover-card",
      description:
        "For sighted users to preview content available behind a link.",
    },
    {
      title: "Progress",
      href: "/docs/primitives/progress",
      description:
        "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
      title: "Scroll-area",
      href: "/docs/primitives/scroll-area",
      description: "Visually or semantically separates content.",
    },
    {
      title: "Tabs",
      href: "/docs/primitives/tabs",
      description:
        "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
      title: "Tooltip",
      href: "/docs/primitives/tooltip",
      description:
        "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
  ]
  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 shadow-md p-2 flex items-center">
      <div className="flex justify-center items-center w-full">
        {/* <div className="flex justify-start items-center">
          <SidebarTrigger />
          <Separator className="h-6 w-px bg-black mx-2" />
          <h1 className="text-lg font-semibold pl-2">Zen Wellness Lounge</h1>
        </div> */}
        <div>

          <NavigationMenu>
            <NavigationMenuList>

              {
                group == "Admin" ? (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Wellness Lounge</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className=" p-4 md:w-[400px] lg:w-[250px]">

                        <ListItem href="/wellness-lounge-list" title="Lounge Session List">
                        </ListItem>
                        <ListItem href="/create-wellness-lounge" title="Create Lounge Session">
                        </ListItem>
                        <ListItem href="/categories-list" title="Categories">
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : group == "Student" && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Wellness Lounge</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className=" p-4 md:w-[400px] lg:w-[250px]">

                        <ListItem href="/calendar" title="Calendar">
                        </ListItem>

                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )
              }


              {
                group == "Admin" ? (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Orders</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className=" p-2 md:w-[400px] lg:w-[250px]">
                        <ListItem href="/order-list" title="Orders List">
                        </ListItem>
                        <ListItem href="/create-order" title="Create order">
                        </ListItem>
                        <ListItem href="/view-order" title="View order">
                        </ListItem>
                        <ListItem href="Zoom Meeting Link" title="Zoom Meeting Link">
                        </ListItem>
                        <ListItem href="Order Cancelation" title="Order Cancelation">
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : group == "Student" && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Order History</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className=" p-4 md:w-[400px] lg:w-[250px]">
                        <ListItem href="/order-list" title="Orders List">
                        </ListItem>
                        <ListItem href="/view-order" title="View order">
                        </ListItem>
                        <ListItem href="Zoom Meeting Link" title="Zoom Meeting Link">
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )
              }


              <NavigationMenuItem>
                <NavigationMenuTrigger>Orders</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {components.map((component: any) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Users</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {components.map((component: any) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Payment Gateways</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {components.map((component: any) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Coupons</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {components.map((component: any) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Documentation
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem> */}

            </NavigationMenuList>
          </NavigationMenu>
        </div>

      </div>
      <div className="flex items-center ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="data-[state=open]:bg-gray-300 data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] bg-gray-300 p-4 min-w-56 rounded-lg"
            side={"bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Zen Lounge</span>
                  <span className="truncate text-xs">zenlounge@gmail.com</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* Trigger dialog for logout confirmation */}
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Confirmation Dialog for Log out */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white p-6 rounded-lg w-96">
          <DialogTitle className="text-lg font-semibold">Confirm Logout</DialogTitle>
          <p className="mb-4">Are you sure you want to log out?</p>
          <div className="flex justify-end gap-4">
            <Button
              onClick={handleCancel} // Cancel button closes the dialog
              className="px-4 py-2 bg-gray-300 rounded text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout} // Confirm button logs out and closes the dialog
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"