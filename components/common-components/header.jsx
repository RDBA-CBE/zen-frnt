"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Bell,
  InstagramIcon,
  LinkedinIcon,
  Loader,
  LogIn,
  LogOut,
  MenuIcon,
  User2Icon,
  UserIcon,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthData, setAuthData } from "@/store/slice/AuthSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { ROLES } from "@/utils/constant.utils";

const Header = () => {
  const dispatch = useDispatch();
  const tokens = useSelector((state) => state.auth.tokens);
  const groups = useSelector((state) => state.auth.groups);
  const username = useSelector((state) => state.auth.username);

  const [activeMenu, setActiveMenu] = useState(null); // Desktop hover menu
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false); // Mobile sidebar
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useSetState({
    token: null,
    group: null,
    username: null,
    logoutLoading: false,
    mentorCount: 0,
    conCount: 0,
    sessionCount: 0,
    ifNotify: false,
  });

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (isClient) {
      const storedToken = localStorage.getItem("zentoken");
      const storedGroup = localStorage.getItem("group");
      const storedUsername = localStorage.getItem("username");
      const conCount = localStorage.getItem("conCount");
      setState({ conCount });

      if (storedToken && storedGroup && storedUsername) {
        dispatch(
          setAuthData({
            tokens: storedToken,
            groups: storedGroup,
            username: storedUsername,
          })
        );
      }
    }
  }, [isClient, dispatch]);

  useEffect(() => {
    getApprovalCount();
  }, [router]);

  const getApprovalCount = async () => {
    try {
      const mentorApproval = {
        is_open_to_be_mentor: "Yes",
        group_name_exact: ROLES.ALUMNI,
      };
      const res = await Models.user.userList(1, mentorApproval);

      const conApproval = { is_active: "No" };
      const conApprovals = await Models.user.userList(1, conApproval);
      localStorage.setItem("conCount", conApprovals?.count);

      const session = {
        is_approved: "No",
      };
      const sessionApp = await Models.session.list(1, session);
      const ifNotify =
        conApprovals?.count > 0 || sessionApp?.count > 0 || res?.count > 0;

      setState({
        mentorCount: res?.count,
        conCount: conApprovals?.count,
        sessionCount: sessionApp?.count,
        ifNotify,
      });
    } catch (error) {
      console.log("Error in getApprovalCount --->", error);
    }
  };

  const handleLogout = async () => {
    try {
      setState({ logoutLoading: true });
      const refresh = localStorage.getItem("refreshToken");
      await Models.auth.logOut({ refresh });
      setState({ logoutLoading: false });
      localStorage.clear();
      setDialogOpen(false);
      dispatch(clearAuthData());
      router.push("/login");
      window.location.reload();
    } catch (error) {
      dispatch(clearAuthData());
      localStorage.clear();
      setState({ logoutLoading: false });
      console.log("Logout error --->", error);
    }
  };

  const handleCancel = () => setDialogOpen(false);

  // --- Menu definitions ---
  const AdminLeftSideMenu = [
    { title: "Dashboard", url: "/" },
    {
      title: "Wellness Lounge",
      url: "/wellness-lounge-list",
      items: [
        { title: "Lounge Session List", url: "/wellness-lounge-list" },
        { title: "Create Lounge Session", url: "/create-wellness-lounge" },
        { title: "Categories", url: "/categories-list" },
        { title: "Session Approval", url: "/session-approval" },
      ],
    },
    {
      title: "Sessions",
      url: "#",
      items: [
        { title: "Registered Users", url: "/order-list" },
        { title: "Add User", url: "/create-order" },
        { title: "Cancelled Users", url: "/cancel-order" },
        { title: "Booking List", url: "/booking_list" },
      ],
    },
    {
      title: "Users",
      url: "#",
      items: [
        { title: "User List", url: "/user-list" },
        { title: "Create User", url: "/create-user" },
        { title: "Counselor Approval", url: "/counselor-approval" },
        { title: "Mentor Approval", url: "/user-approval" },
      ],
    },
    { title: "Payment Gateways", url: "/payment-gateway-list" },
    {
      title: "Coupons",
      url: "#",
      items: [
        { title: "Coupon List", url: "/coupon-list" },
        { title: "Create Coupon", url: "/create-coupon" },
      ],
    },
    { title: "Reports", url: "/reports" },
  ];

  const MentorOrConLeftSideMenu = [
    { title: "Dashboard", url: "/" },
    {
      title: "Wellness Lounge",
      url: "/wellness-lounge-list",
      items: [
        { title: "Lounge Session List", url: "/wellness-lounge-list" },
        { title: "Create Lounge Session", url: "/create-wellness-lounge" },
      ],
    },
    {
      title: "Sessions",
      url: "#",
      items: [
        { title: "Registered Users", url: "/order-list" },
        { title: "Add User", url: "/create-order" },
        { title: "Cancelled Users", url: "/cancel-order" },
      ],
    },
    { title: "Profile", url: "/profile" },
  ];

  const StudentLeftSideMenu = [
    { title: "The Program", url: "/calendar" },
    { title: "Session", url: "/student-order" },
    { title: "Profile", url: "/profile" },
  ];

  const currentMenu =
    groups === ROLES.ADMIN
      ? AdminLeftSideMenu
      : groups === ROLES.MENTOR || groups === ROLES.COUNSELOR
      ? MentorOrConLeftSideMenu
      : StudentLeftSideMenu;

  return (
    <>
      {isClient && (
        <header className="bg-white shadow-md sticky top-0 z-[10]">
          {/* --- Top Header --- */}
          {!tokens && (
            <div className="backcolor-purpole text-white py-2">
              <div className="container mx-auto flex items-center justify-between px-5">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex items-center gap-1 md:pr-4 pr-2">
                    <UserIcon className=" md:w-5 md:h-5 w-3 h-3" />
                    <Link
                      href="/registration"
                      className="hover:underline md:text-[16px] text-[10px]"
                    >
                      SIGN UP
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserIcon className=" md:w-5 md:h-5 w-3 h-3" />
                    <Link
                      href="/"
                      className="hover:underline md:text-[16px] text-[10px]"
                    >
                      LOGIN
                    </Link>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="https://www.instagram.com/zen_wellness_lounge/"
                    target="_blank"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/zen-wellness-lounge-a50670348/"
                    target="_blank"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* --- Main Header --- */}
          <div className="py-4 border-b border-gray-200">
            <div className="container mx-auto flex items-center justify-between gap-20 px-5">
              {/* Logo */}
              <div className="flex justify-center">
                <Link href="https://zenwellnesslounge.com/" target="_blank">
                  <Image
                    src="/assets/images/logo.png"
                    alt="logo"
                    width={200}
                    height={80}
                  />
                </Link>
              </div>

              {/* --- Desktop Menu --- */}
              <nav className="hidden lg:flex space-x-6">
                {tokens &&
                  currentMenu.map((menu) => (
                    <div
                      key={menu.title}
                      className="relative"
                      onMouseEnter={() =>
                        menu.items && setActiveMenu(menu.title)
                      }
                      onMouseLeave={() => setActiveMenu(null)}
                    >
                      <Link
                        href={menu.url}
                        className="hover:text-themePurple text-[14px] font-[600] uppercase"
                      >
                        {menu.title}
                      </Link>

                      {menu.items && activeMenu === menu.title && (
                        <div className="absolute left-0 w-56 bg-white p-4 rounded-lg shadow-lg border-b-2 border-themePurple">
                          {menu.items.map((item) => (
                            <div key={item.title} className="mb-2">
                              <Link
                                href={item.url}
                                className="text-black font-[600] uppercase hover:text-themePurple text-[14px]"
                              >
                                {item.title}
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </nav>

              {/* --- User Avatar & Notifications --- */}
              <div className="flex items-center gap-3">
                {tokens && groups === ROLES.ADMIN && (
                  <DropdownMenu
                    onOpenChange={(isOpen) => isOpen && getApprovalCount()}
                  >
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-10 w-10 rounded cursor-pointer">
                        <AvatarFallback>
                          <Bell />
                          {/* {state.ifNotify ? <Home /> : <Bell className="text-red-500"/>} */}

                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="bg-fuchsia-100 w-[220px] p-4 rounded-lg"
                      side="bottom"
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="p-0 pb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">Notifications</span>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuItem
                        onClick={() => router.push("/user-approval")}
                      >
                        Mentor Approval ({state.mentorCount})
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push("/counselor-approval")}
                      >
                        Counselor Approval ({state.conCount})
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push("/session-approval")}
                      >
                        Session Approval ({state.sessionCount})
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 rounded cursor-pointer">
                      <AvatarFallback>
                        <User2Icon />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-fuchsia-100 w-[220px] p-4 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    {username && (
                      <DropdownMenuLabel className="p-0 pb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-8 w-8 rounded">
                            <AvatarFallback>
                              <User2Icon />
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">{username}</span>
                        </div>
                      </DropdownMenuLabel>
                    )}
                    {username && <DropdownMenuSeparator />}
                    {tokens && (
                      <>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("/change-password-confirm")
                          }
                        >
                          Change Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
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

                {/* --- Mobile Menu --- */}
                {tokens && groups && (
                  <div className="block lg:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                      <SheetTrigger asChild>
                        <MenuIcon className="cursor-pointer" />
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle></SheetTitle>
                        </SheetHeader>
                        <div className="flex justify-center">
                          <Link
                            href="https://zenwellnesslounge.com/"
                            target="_blank"
                          >
                            <Image
                              src="/assets/images/logo.png"
                              alt="logo"
                              width={200}
                              height={80}
                            />
                          </Link>
                        </div>

                        <div className="mt-10">
                          {currentMenu?.map((menu, index) => (
                            <Accordion
                              key={index}
                              type="single"
                              collapsible
                              className="w-full"
                            >
                              <AccordionItem value={`item-${index + 1}`}>
                                <AccordionTrigger
                                  className={`no-underline hover:no-underline uppercase text-sm ${
                                    menu.items?.length > 0
                                      ? ""
                                      : "[&>svg]:hidden"
                                  }`}
                                  onClick={() => {
                                    if (!menu.items?.length) {
                                      router.push(menu.url);
                                      setOpen(false);
                                    }
                                  }}
                                >
                                  {menu.title}
                                </AccordionTrigger>
                                {menu.items?.length > 0 && (
                                  <AccordionContent>
                                    <ul className="pl-5 uppercase">
                                      {menu.items.map((item, idx) => (
                                        <li key={idx} className="pb-2 text-sm">
                                          <Link
                                            href={item.url}
                                            onClick={() => setOpen(false)}
                                          >
                                            {item.title}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </AccordionContent>
                                )}
                              </AccordionItem>
                            </Accordion>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                )}
              </div>

              {/* --- Logout Dialog --- */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-white p-6 rounded-lg md:w-96 w-full">
                  <DialogTitle className="text-[20px] font-semibold">
                    Confirm Logout
                  </DialogTitle>
                  <div className="mb-4">Are you sure you want to log out?</div>
                  <div className="flex justify-end gap-4">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="px-4 py-2 border-themeGreen hover:border-themeGreen text-themeGreen bg-none rounded text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-themeGreen hover:bg-themeGreen text-white rounded text-sm"
                    >
                      {state.logoutLoading ? <Loader /> : "Confirm"}
                    </Button>
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
