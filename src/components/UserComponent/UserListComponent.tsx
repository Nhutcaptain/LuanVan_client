"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Lỗi khi lấy danh sách user:", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Danh sách người dùng</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user._id} className="border p-2 rounded">
            <strong>{user.name}</strong> - {user.email} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
}
