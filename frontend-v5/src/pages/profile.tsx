import { useEffect, useState } from "react";
import api from "@/utils/api";
import { getUserRole } from "@/utils/auth";

export default function Profile() {
  const [data, setData] = useState<any>(null);
  const role = getUserRole();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (role === "customer") {
          const res = await api.get("/customers/me/");
          setData(res.data);
        } else {
          const res = await api.get("/users/me/");
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    fetchProfile();
  }, [role]);

  if (!data) return <div>Loading profile...</div>;

  return (
    <div>
      <h1>My Profile</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
