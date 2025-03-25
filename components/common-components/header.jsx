"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BadgeCheck, Bell, CreditCard, DiscAlbum, FacebookIcon, InstagramIcon, LinkedinIcon, LogIn, LogOut, MenuIcon, SparklesIcon, TwitchIcon, User2Icon, UserX2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthData, setAuthData } from "@/store/slice/AuthSlice";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@radix-ui/react-label";
import { useSetState } from "@/utils/function.utils";

const Header = () => {

  const dispatch = useDispatch();
  const tokens = useSelector((state) => state.auth.tokens);
  const groups = useSelector((state) => state.auth.groups);
  const username = useSelector((state) => state.auth.username)

  const [activeMenu, setActiveMenu] = useState(null);
  const [clickedMenu, setClickedMenu] = useState(null); // Track the clicked menu
  const [dialogOpen, setDialogOpen] = useState(false);
  const [group, setGroup] = useState(null);
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false); // Track if we're in the client

  const [state, setState] = useSetState({
    token: null,
    group: null,
    username: null
  })


  // Set `isClient` to true after the component mounts (only runs on the client)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch token and group from localStorage only on the client-side
  useEffect(() => {
    if (isClient) {
      const storedToken = localStorage.getItem("token");
      const storedGroup = localStorage.getItem("group");
      const StoredUsername = localStorage.getItem("username")

      if (storedToken && storedGroup && StoredUsername) {
        dispatch(setAuthData({ tokens: storedToken, groups: storedGroup, username: StoredUsername }));
      }
    }
  }, [isClient, dispatch]); // Only run when `isClient` is true

  // Logout function to remove token and navigate to login page
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("group");
    localStorage.removeItem("eventId")
    localStorage.removeItem("username")
    setDialogOpen(false);
    router.push("/login");
    dispatch(clearAuthData());
  };

  // Cancel function to close the dialog without performing any action
  const handleCancel = () => {
    setDialogOpen(false);
  };

  // Left side menus for Admin and Student
  const AdminLeftSideMenu = [
    {
      title: "Wellness Lounge",
      url: "#",
      items: [
        { title: "Lounge Session List", url: "/wellness-lounge-list" },
        { title: "Create Lounge Session", url: "/create-wellness-lounge" },
        { title: "Categories", url: "/categories-list" },
      ],
    },
    {
      title: "Orders",
      url: "#",
      items: [
        { title: "Orders List", url: "/order-list" },
        { title: "Create order", url: "/create-order" },
        { title: "Cancel Orders", url: "/cancel-order" },
      ],
    },
    {
      title: "Users",
      url: "#",
      items: [
        { title: "User List", url: "/user-list" },
        { title: "Create User", url: "/create-user" },
      ],
    },
    {
      title: "Payment Gateways",
      url: "#",
      items: [
        { title: "Payment Gateway List", url: "/payment-gateway-list" },
      ],
    },
    {
      title: "Coupons",
      url: "#",
      items: [
        { title: "Coupon List", url: "/coupon-list" },
        { title: "Create Coupon", url: "/create-coupon" },
      ],
    },
  ];

  const StudentLeftSideMenu = [
    {
      title: "The Program",
      url: "/calendar",
    },
    {
      title: "Order",
      url: "/student-order",
    },
    {
      title: "Profile",
      url: "/profile",
    },
  ];

  return (
    <>
      {isClient && ( // Ensure that the header only renders after the client-side component mounts
        <header className="bg-white shadow-md sticky top-0 z-[10]">
          {/* Top Header */}
          <div className="backcolor-purpole text-white py-2">
            <div className="container mx-auto flex  items-center justify-between px-5">
              <div className="flex items-center gap-4">
                <Link href="/student-registration" className="hover:underline border-r border-white pr-4">
                  Student Registration
                </Link>
                <Link href="/alumni-registration" className="hover:underline">
                  Alumni Registration
                </Link>
              </div>
              <div className="flex gap-2">
                <Link href="https://www.instagram.com/accounts/login/?next=%2Fzen_wellness_lounge%2F&source=omni_redirect" target="_blank" aria-label="Instagram">
                  <InstagramIcon className="w-4 h-4" />
                </Link>
                <Link href="https://www.linkedin.com/in/zen-wellness-lounge-a50670348/" target="_blank" aria-label="LinkedIn">
                  <LinkedinIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Header */}
          <div className="py-4 border-b border-gray-200">
            <div className="container mx-auto flex items-center justify-between gap-20 px-5">
              <div className="flex justify-center">
                <Link href="/">
                  <Image src="/assets/images/logo.png" alt="logo" width={200} height={80} />
                </Link>
              </div>

              {/* Left Menu (Admin/Student) */}
              <nav className="hidden lg:flex space-x-6">
                {tokens && groups && (
                  (groups === "Admin" ? AdminLeftSideMenu : StudentLeftSideMenu).map((menu) => (
                    <div
                      key={menu.title}
                      className="relative"
                      onMouseEnter={() => menu.items && setActiveMenu(menu.title)}
                      onMouseLeave={() => menu.items && setActiveMenu(null)}
                    >
                      <Link href={menu.url} className="hover:text-themePurple font-medium">
                        {menu.title}
                      </Link>

                      {/* Submenu */}
                      {(activeMenu === menu.title || clickedMenu === menu.title) && (
                        <div
                          className="absolute left-0 w-56 bg-white p-4 rounded-lg shadow-lg"
                          onMouseEnter={() => setActiveMenu(menu.title)}
                          onMouseLeave={() => setActiveMenu(null)}
                        >
                          {menu.items?.map((item) => (
                            <div key={item.title} className="mb-2">
                              <Link href={item.url} className="text-sm text-black hover:text-themePurple">
                                {item.title}
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </nav>

              {/* User Avatar Dropdown */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-10 w-10 rounded cursor-pointer">
                        <AvatarFallback><User2Icon /></AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-fuchsia-100 w-[220px] p-4 rounded-lg" side="bottom" align="end" sideOffset={4}>
                      <DropdownMenuLabel className="p-0 pb-2">
                        {
                          username && (
                            <div className="flex items-center gap-2 text-sm">
                              <Avatar className="h-8 w-8 rounded">
                                <AvatarFallback><User2Icon /></AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-semibold">{username}</span>
                                {/* <span className="text-xs">zenlounge@gmail.com</span> */}
                              </div>
                            </div>
                          )
                        }

                      </DropdownMenuLabel>
                      {
                        username && (<DropdownMenuSeparator />
                        )
                      }

                      {/* <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <SparklesIcon /> Upgrade to Pro
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <BadgeCheck /> Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard /> Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell /> Notifications
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator /> */}
                      {tokens ? (
                        <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                          <LogOut /> Logout
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => router.push("/login")}>
                          <LogIn /> Login
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="block lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <MenuIcon />
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle></SheetTitle>

                      </SheetHeader>
                      <div className="flex justify-center">
                        <Link href="/">
                          <Image src="/assets/images/logo.png" alt="logo" width={200} height={80} />
                        </Link>
                      </div>
                      <div className="mt-10">
                        {tokens && groups && (
                          (groups === "Admin" ? AdminLeftSideMenu : StudentLeftSideMenu).map((menu, index) => {
                            return (
                              <Accordion type="single" collapsible className="w-full" key={index}>
                                <AccordionItem value={`item-${index + 1}`}>
                                  <AccordionTrigger className="no-underline hover:no-underline text-lg">{menu.title}</AccordionTrigger>
                                  <AccordionContent>
                                    {menu.items ? (
                                      <ul className="pl-5">
                                        {menu.items.map((item, itemIndex) => (
                                          <li key={itemIndex} className="pb-2 text-lg">
                                            <a href={item.url}>
                                              {item.title}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p>
                                        <a href={menu.url}>
                                          {menu.title}
                                        </a>
                                      </p>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            );
                          })
                        )}
                      </div>
                      {/* <div className="mt-10 flex justify-center items-center gap-4">
                        <InstagramIcon />
                        <LinkedinIcon />
                      </div> */}
                    </SheetContent>
                  </Sheet>
                </div>

              </div>
              {/* Confirmation Dialog for Log out */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-white p-6 rounded-lg w-96">
                  <DialogTitle className="text-lg font-semibold">Confirm Logout</DialogTitle>
                  <div className="mb-4">Are you sure you want to log out?</div>
                  <div className="flex justify-end gap-4">
                    <Button onClick={handleCancel} className="px-4 py-2 border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen rounded text-sm">Cancel</Button>
                    <Button onClick={handleLogout} className="px-4 py-2 bg-themeGreen hover:bg-themeGreen text-white rounded text-sm">Confirm</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>
      )}
    </>
  );
};

export default Header;
