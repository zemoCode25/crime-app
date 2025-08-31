import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import React from "react";

export default function Accounts() {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <Input
          placeholder="Search person..."
          className="w-full sm:max-w-[20rem]"
        />
        <Button className="w-fit bg-orange-600">Create Account</Button>
      </div>
      <div className="mt-4 flex flex-col gap-8">
        <div className="rounded-lg border p-4">
          <h2 className="text-base font-bold">Current Accounts</h2>
          <Table className="rounded-lg">
            <TableHeader>
              <TableRow>
                <TableCell className="text-neutral-700">User</TableCell>
                <TableCell className="text-neutral-700">Role</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i} className="pl-40 hover:bg-neutral-200">
                  <TableCell className="flex items-center gap-4">
                    <img
                      src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`}
                      alt="User"
                      className="h-12 w-12 rounded-full border-2 border-orange-600"
                    />
                    <div>
                      <div className="font-semibold">John Doe {i}</div>
                      <div className="text-sm text-gray-500">
                        john{i}@example.com
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>Sub Admin</p>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="hover:bg-red-500 hover:text-white">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">Pending account requests</h2>
          <Card>
            <Table>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-4">
                      <img
                        src={`https://randomuser.me/api/portraits/women/${i + 20}.jpg`}
                        alt="User"
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <div className="font-semibold">Jane Smith {i}</div>
                        <div className="text-sm text-gray-500">
                          jane{i}@example.com
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
