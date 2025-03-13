"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BadgeCheck, Bell, CreditCard, FacebookIcon, InstagramIcon, LinkedinIcon, LogOut, SparklesIcon, TwitchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";
import { useSetState } from "@/utils/function.utils";

const Header = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [clickedMenu, setClickedMenu] = useState<string | null>(null); // To track which menu is clicked
  const [dialogOpen, setDialogOpen] = useState(false);
  const [group, setGroup] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control the dropdown
  const router = useRouter();
  const [token, setToken] = useState(null)

  useEffect(() => {
    const Token: any = localStorage?.getItem("token")
    setToken(Token)
    const Group: any = localStorage?.getItem("group");
    setGroup(Group);
  }, []);

  // Logout function to remove token and navigate to login page
  const handleLogout = () => {
    localStorage.removeItem("token");
    setDialogOpen(false);
    router.push("/login");
  };

  // Cancel function to close the dialog without performing any action
  const handleCancel = () => {
    setDialogOpen(false);
  };

  const AdminLeftSideMenu = [
    {
      title: "Wellness Lounge",
      url: "#",
      isActive: true,
      items: [
        {
          title: "Lounge Session List",
          url: "/wellness-lounge-list",
        },
        {
          title: "Create Lounge Session",
          url: "/create-wellness-lounge",
        },
        {
          title: "Categories",
          url: "/categories-list",
        },

      ],
    },
    {
      title: "Orders",
      url: "#",
      items: [
        {
          title: "Orders List",
          url: "/order-list",
        },
        {
          title: "Create order",
          url: "/create-order",
        },
      ],
    },
    {
      title: "Users",
      url: "/user-list",
      items: [
        {
          title: "User List",
          url: "/user-list",
        },
        {
          title: "Create User",
          url: "create-user",
        },
      ],
    },
    {
      title: "Payment Gateways",
      url: "/payment",
      items: [
        {
          title: "Payment Gateway List",
          url: "/payment-gateway-list",
        },
      ],
    },
    {
      title: "Coupons",
      url: "/coupon-list",
      items: [
        {
          title: "Coupon List",
          url: "/coupon-list",
        },
        {
          title: "Create Coupon",
          url: "create-coupon",
        },
      ],
    },

  ];

  const StudentLeftSideMenu = [
    {
      title: "Wellness Lounge",
      url: "#",
      isActive: true,
      items: [
        {
          title: "Calendar",
          url: "/calendar",
        },
      ],
    },
    {
      title: "Orders",
      url: "#",
      items: [
        {
          title: "Orders List",
          url: "/order-list",
        },
        {
          title: "Create order",
          url: "/create-order",
        },
      ],
    },
    {
      title: "Users",
      url: "/user-list",
      items: [
        {
          title: "User List",
          url: "/user-list",
        },
        {
          title: "Create User",
          url: "create-user",
        },
      ],
    },
    {
      title: "Payment Gateways",
      url: "/payment",
      items: [
        {
          title: "Payment Gateway List",
          url: "/payment-gateway-list",
        },
      ],
    },
    {
      title: "Coupons",
      url: "/coupon-list",
      items: [
        {
          title: "Coupon List",
          url: "/coupon-list",
        },
        {
          title: "Create Coupon",
          url: "create-coupon",
        },
      ],
    },

  ];



  const handleMenuClick = (menuTitle: string) => {
    // Toggle the clicked menu (set active if clicked, reset if already clicked)
    if (clickedMenu === menuTitle) {
      setClickedMenu(null); // Close the submenu when clicked again
    } else {
      setClickedMenu(null); // Set the clicked menu to active
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-[999]">
      {/* Top Header */}
      <div className="backcolor-purpole text-white py-2">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="mailto:viji.zenwellnesslounge@gmail.com" className="hover:underline border-r border-white pr-4">
              Student Registration
            </Link>

            <Link href="mailto:viji.zenwellnesslounge@gmail.com" className="hover:underline">
              Alumni Registration
            </Link>
          </div>
          <div>
            <div className="col-auto d-none d-md-block">
              <div className="flex justify-between items-center gap-2">

                <a href="#"><InstagramIcon className="w-4 h-4" /> </a>
                <a href="#"><LinkedinIcon className="w-4 h-4" /></a>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="py-4 border-b border-gray-200">
        <div className="container mx-auto flex items-center justify-between gap-20">

          <div className="flex justify-center">
            <Link href="/">
              <Image src="/assets/images/logo.png" alt="logo" width={200} height={80} />
            </Link>
          </div>

          {/* Left Menu */}
          {
            group == "Admin" ? (
              <nav className="hidden lg:flex space-x-6">
                {AdminLeftSideMenu.map((menu) => (
                  <div
                    key={menu.title}
                    className="relative "
                    onMouseEnter={() => setActiveMenu(menu.title)}  // Set active menu when hovered
                    onMouseLeave={() => setActiveMenu(null)}  // Reset active menu when mouse leaves
                  >
                    <Link
                      href={menu.url}
                      className="hover:text-blue-600 font-medium"
                      onClick={() => handleMenuClick(menu.title)} // Toggle submenu on click
                    >
                      {menu.title}
                    </Link>

                    {/* Submenu */}
                    {(activeMenu === menu.title || clickedMenu === menu.title) && (
                      <div
                        className="absolute left-0   w-56 bg-gray-300 p-4 rounded-lg shadow-lg"
                        onMouseEnter={() => setActiveMenu(menu.title)}  // Keep submenu open when hovering over it
                        onMouseLeave={() => setActiveMenu(null)}  // Close submenu when leaving both parent and submenu
                      >
                        {menu.items.map((item) => (
                          <div key={item.title} className="mb-2">
                            <Link href={item.url} className="text-sm text-black hover:text-blue-600">
                              {item.title}
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            ) : group == "Student" && (
              <nav className="hidden lg:flex space-x-6">
                {StudentLeftSideMenu.map((menu) => (
                  <div
                    key={menu.title}
                    className="relative "
                    onMouseEnter={() => setActiveMenu(menu.title)}  // Set active menu when hovered
                    onMouseLeave={() => setActiveMenu(null)}  // Reset active menu when mouse leaves
                  >
                    <Link
                      href={menu.url}
                      className="hover:text-blue-600 font-medium"
                      onClick={() => handleMenuClick(menu.title)} // Toggle submenu on click
                    >
                      {menu.title}
                    </Link>

                    {/* Submenu */}
                    {(activeMenu === menu.title || clickedMenu === menu.title) && (
                      <div
                        className="absolute left-0   w-56 bg-gray-300 p-4 rounded-lg shadow-lg"
                        onMouseEnter={() => setActiveMenu(menu.title)}  // Keep submenu open when hovering over it
                        onMouseLeave={() => setActiveMenu(null)}  // Close submenu when leaving both parent and submenu
                      >
                        {menu.items.map((item) => (
                          <div key={item.title} className="mb-2">
                            <Link href={item.url} className="text-sm text-black hover:text-blue-600">
                              {item.title}
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )
          }


          {/* Logo */}


          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="data-[state=open]:bg-gray-300 data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="h-10 w-10 rounded">
                    <AvatarFallback>A</AvatarFallback>
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
                      <AvatarFallback>A</AvatarFallback>
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
                    <SparklesIcon />
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
                <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                  <LogOut />
                  {token ? "Logout" : "Login"}
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
        </div>
      </div >
    </header >
  );
};

export default Header;
