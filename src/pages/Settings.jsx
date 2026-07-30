import { useEffect, useState } from "react";
import { auth } from "@/api/firebaseClient";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, Check } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => logout(true);

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-medium">Profile</h2>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Email
          </Label>
          <Input value={user.email || ""} disabled />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : saved ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Saved
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-medium">Account</h2>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </section>
    </div>
  );
}
