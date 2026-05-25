"use client"

import { Loader } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <Loader className="h-10 w-10 animate-spin text-gray-400" />
    </div>
  )
}