"use client"
import { Success, Failure, Info, ToastContainer } from "@/components/common-components/toast";
import { Button } from "@/components/ui/button";

export default function SonnerDemo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Button variant="outline" onClick={() => Success("Event Created Successfully!")}>
        Show Success
      </Button>

      <Button variant="outline" className="mt-4" onClick={() => Failure("Something Missing!")}>
        Show Error
      </Button>

      <Button variant="outline" className="mt-4" onClick={() => Info("This is an Info Message!")}>
        Show Info
      </Button>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}
