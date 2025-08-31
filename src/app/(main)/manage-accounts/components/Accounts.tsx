import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React from "react";

export default function Accounts() {
  return (
    <div className="flex flex-col">
      <Button className="ml-auto w-fit bg-orange-600">Create Account</Button>
      <div className="flex justify-between gap-8 md:flex-row">
        <div className="w-full">
          <h2 className="mb-2 text-lg font-bold">Current Accounts</h2>
          <ul className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <li className="!gap flex items-center rounded bg-white px-4">
                  <img
                    src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`}
                    alt="User"
                    className="mr-4 h-12 w-12 rounded-full border-2 border-orange-600"
                  />
                  <div>
                    <div className="font-semibold">John Doe {i}</div>
                    <div className="text-sm text-gray-500">
                      john{i}@example.com
                    </div>
                  </div>
                </li>
              </Card>
            ))}
          </ul>
        </div>
        <div className="w-full">
          <h2 className="mb-2 text-lg font-bold">Pending account requests</h2>
          <ul className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <li className="flex items-center rounded px-4">
                  <img
                    src={`https://randomuser.me/api/portraits/women/${i + 20}.jpg`}
                    alt="User"
                    className="mr-4 h-12 w-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">Jane Smith {i}</div>
                    <div className="text-sm text-gray-500">
                      jane{i}@example.com
                    </div>
                  </div>
                </li>
              </Card>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
