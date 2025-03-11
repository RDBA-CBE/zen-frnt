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
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react"; // Using useState for dialog state management

export default function Header() {
  const [dialogOpen, setDialogOpen] = useState(false); // Manage dialog state with useState
  const router = useRouter();

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

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 shadow-md p-2 flex items-center">
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-start items-center">
          {/* <SidebarTrigger /> */}
          <Separator className="h-6 w-px bg-black mx-2" />
          <h1 className="text-lg font-semibold pl-2">Zen Wellness Lounge</h1>
        </div>
        <div className="flex items-center ml-auto">
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
