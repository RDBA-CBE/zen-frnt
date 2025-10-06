"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setAuthData } from "@/store/slice/AuthSlice";
import { useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { ROLES } from "@/utils/constant.utils";

const Header = () => {
  const dispatch = useDispatch();
 
  const [isClient, setIsClient] = useState(false); // Track if we're in the client


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedToken = localStorage.getItem("zentoken");
      const storedGroup = localStorage.getItem("group");
      const StoredUsername = localStorage.getItem("username");
      

      
    }
  }, [isClient, dispatch]);



  return (
    <>
      {isClient && ( // Ensure that the header only renders after the client-side component mounts
        <header className="bg-white shadow-md sticky top-0 z-[10]">
          <div className="py-4 border-b border-gray-200">
            <div className="container mx-auto flex items-center justify-between gap-20 px-5">
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
            </div>
          </div>
        </header>
      )}
    </>
  );
};

export default Header;
