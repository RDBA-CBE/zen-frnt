'use client';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Edit, Eye, MoreHorizontal, Trash, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { welness_data } from "@/utils/constant.utils"


const App = () => {


  // Example handlers for actions
  const handleEdit = (item) => {
    console.log("Editing:", item);
  };

  const handleView = (item) => {
    console.log("Viewing:", item);
  };

  const handleDelete = (item) => {
    console.log("Deleting:", item);
  };


  const columns = [
    {
      Header: "Image",
      accessor: "img",
      Cell: ({ value }) => <img src={value} alt="Thumbnail" className="w-10 h-10 rounded-lg" />,
    },
    {
      Header: "Title",
      accessor: "title",
    },
    {
      Header: "Price",
      accessor: "price",
    },
    {
      Header: "duration",
      accessor: "duration"
    },
    {
      Header: "Lounch Type",
      accessor: "lounge_type",
    },
    {
      Header: "Opening Date",
      accessor: "opening_date",
    },
    {
      Header: "Closing Date",
      accessor: "closing_date"
    },
    {
      Header: "Status",
      accessor: "status"
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md hover:bg-gray-200">
              <MoreHorizontal size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleView(row.original)}>
              <Eye size={16} className="mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-500">
              <Trash size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }
  ];



  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min items-center gap-4 grid-cols-2">
        <div >
          <h2 className="md:text-lg text-md font-bold">Wellness Lounge List</h2>
        </div>
        <div className="text-end">
          <Button>Create</Button>
        </div>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div >
          <Input placeholder="Search Title" />
        </div>
        <div >
          <Select>
            <SelectTrigger className="w-[100%]">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20000">20,000</SelectItem>
              <SelectItem value="40000">40,000</SelectItem>
              <SelectItem value="50000">50,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select>
            <SelectTrigger className="w-[100%]">
              <SelectValue placeholder="Lounge Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2" >
        <p className="text-[14px]">Selected Filters:</p>
        <p className="text-[14px] bg-red-300 text-white px-2 flex items-center gap-1">Online <X className="w-4 h-4 cursor-pointer" /> </p>
        <p className="text-[14px] bg-red-300 text-white px-2 flex items-center gap-1">20,000 <X className="w-4 h-4 cursor-pointer" /> </p>
      </div>

      <div className="rounded-lg border mt-2">
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={welness_data} />
        </div>
      </div>

    </div>
  );
};

export default App;
