import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getMyProfile, updateDisplayName } from "@/lib/game.functions";

export function AppHeader({ onSignOut }: { onSignOut: () => void }) {
  const queryClient = useQueryClient();
  const getProfile = useServerFn(getMyProfile);
  const saveName = useServerFn(updateDisplayName);

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getProfile,
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  useEffect(() => {
    if (open) setName(profile?.display_name ?? "");
  }, [open, profile?.display_name]);

  const saveMutation = useMutation({
    mutationFn: saveName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      setOpen(false);
      toast.success("Name updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link to="/play" className="font-display text-xl font-bold tracking-tight">
          Inkling<span className="text-primary">.</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/play"
            className="rounded-sm px-3 py-1.5 font-medium hover:bg-secondary"
            activeProps={{ className: "bg-secondary" }}
          >
            Play
          </Link>
          <Link
            to="/leaderboard"
            className="rounded-sm px-3 py-1.5 font-medium hover:bg-secondary"
            activeProps={{ className: "bg-secondary" }}
          >
            Leaderboard
          </Link>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 px-2.5">
                <UserRound className="h-4 w-4" />
                <span className="hidden max-w-32 truncate sm:inline">
                  {profile?.display_name ?? "Profile"}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Your player name</DialogTitle>
                <DialogDescription>
                  This is the name shown on the leaderboard.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={name}
                maxLength={30}
                onChange={(e) => setName(e.target.value)}
                placeholder="Player name"
              />
              <DialogFooter>
                <Button
                  disabled={!name.trim() || saveMutation.isPending}
                  onClick={() => saveMutation.mutate({ data: { displayName: name.trim() } })}
                >
                  {saveMutation.isPending ? "Saving…" : "Save name"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 px-2.5"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
