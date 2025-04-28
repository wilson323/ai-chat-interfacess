"use client";
import React, { useState } from "react";
import { SettingsDialog } from "../../../components/settings-dialog";

export default function UserSettingsPage() {
  const [open, setOpen] = useState(true);
  return <SettingsDialog open={open} onOpenChange={setOpen} />;
} 