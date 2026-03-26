import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useProfileFunctions from "@/hooks/useProfileFunctions";
import { useSession } from "next-auth/react";
import { ReactNode, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import FormError from "../Auth/FormError";

interface ChangeAvatarDialogProps {
  children: ReactNode;
}

const ChangeAvatarModal = ({ children }: ChangeAvatarDialogProps) => {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const { handleChangeAvatar } = useProfileFunctions();
  const { data: userData } = useSession();

  const handleConfirm = async () => {
    const result = await handleChangeAvatar(imageUrl || null);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setImageUrl("");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setImageUrl("");
    setError("");
  };

  const previewSrc = imageUrl || userData?.user?.image || undefined;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Profile Picture</AlertDialogTitle>
          <AlertDialogDescription>
            Paste a URL to use as your profile picture.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="m-auto flex w-[90%] flex-col space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0 border border-foreground/20">
              {previewSrc ? (
                <AvatarImage src={previewSrc} />
              ) : (
                <AvatarFallback>{userData?.user?.name?.slice(0, 2)}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex w-full flex-col gap-1.5">
              <Label className="text-base font-normal">Image URL:</Label>
              <Input
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setError("");
                }}
                placeholder="https://..."
                className="border-foreground"
              />
            </div>
          </div>
          <FormError message={error} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChangeAvatarModal;
