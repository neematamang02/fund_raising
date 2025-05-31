import React, { useContext } from "react";
import { UserRoleContext } from "@/context/UserRoleContext";
import { Toggle } from "@/components/ui/toggle";

export default function ToggleRole({ mobile = false }) {
  const { role, setRole } = useContext(UserRoleContext);
  return (
    <div className={mobile ? "px-4 py-2" : "px-3 py-2"}>
      <Toggle
        pressed={role === "organizer"}
        onPressedChange={(pressed) => setRole(pressed ? "organizer" : "donor")}
        aria-label="Toggle between donor and organizer"
      >
        {role === "organizer" ? "Organizer" : "Donor"}
      </Toggle>
    </div>
  );
}
