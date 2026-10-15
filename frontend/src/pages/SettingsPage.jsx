import React, { useEffect, useState } from "react";
import { Avatar, Card, CardContent, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import { getAdminProfile, updateAdminProfile } from "../api/authApi";
import { getCurrentUser, updateUserProfile } from "../api/userApi";

export default function SettingsPage({notify,toggleTheme, isAdmin = false}) {
  const [name,setName]=useState(localStorage.getItem("fullName")||"");
  const [email,setEmail]=useState("");
  const [mobile,setMobile]=useState("");
  const [password,setPassword]=useState("");
  const [logo,setLogo]=useState(localStorage.getItem("profileLogo") || "");
  const [saving,setSaving]=useState(false);

  useEffect(() => {
    const loadProfile = isAdmin ? getAdminProfile : getCurrentUser;
    loadProfile().then((profile) => {
      setName(profile.fullName || "");
      setEmail(profile.email || "");
      setMobile(profile.mobile || "");
      setLogo(profile.profileLogo || "");
      localStorage.setItem("fullName", profile.fullName || "");
      localStorage.setItem("profileLogo", profile.profileLogo || "");
    }).catch(() => notify("Unable to load profile.", "error"));
  }, [isAdmin, notify]);

  const save=async()=>{
    setSaving(true);
    try {
      const profile = isAdmin
        ? await updateAdminProfile({ fullName:name, email, mobile, password, profileLogo:logo })
        : await updateUserProfile({ fullName:name, email, mobile, password, profileLogo:logo });
      localStorage.setItem("fullName",profile.fullName || name);
      localStorage.setItem("profileLogo",profile.profileLogo || "");
      setPassword("");
      notify("Profile settings saved.");
    } catch (error) {
      notify(error.response?.data?.message || "Unable to save profile settings.", "error");
    } finally { setSaving(false); }
  };

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Please choose an image file.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify("Logo must be smaller than 2 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <Stack spacing={3}>
      <PageHeader title="Settings" subtitle="Manage profile, appearance and application preferences."/>
      <Card><CardContent><Stack spacing={2}>
        <Typography variant="h6" fontWeight={800}>Profile</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={logo || undefined} sx={{ width: 64, height: 64 }}>{name?.[0] || "A"}</Avatar>
          <label className="native-secondary-button" style={{ width: "fit-content", cursor: "pointer" }}>
            Choose profile logo
            <input type="file" accept="image/*" hidden onChange={handleLogo}/>
          </label>
        </Stack>
        <TextField label="Display Name" value={name} onChange={e=>setName(e.target.value)}/>
        <TextField label="Username" value={localStorage.getItem("username")||""} disabled/>
        <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <TextField label="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)}/>
        <TextField label="New Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} helperText="Leave blank to keep the current password."/>
        <button className="native-primary-button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
      </Stack></CardContent></Card>
      <Card><CardContent><Stack spacing={1}>
        <Typography variant="h6" fontWeight={800}>Appearance</Typography>
        <FormControlLabel control={<Switch onChange={toggleTheme} defaultChecked={localStorage.getItem("theme")==="dark"}/>} label="Dark mode"/>
      </Stack></CardContent></Card>
    </Stack>
  );
}