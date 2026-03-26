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
import useProfileFunctions from "@/hooks/useProfileFunctions";
import { useSession } from "next-auth/react";
import { type ChangeEvent, type ReactNode, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import IconButton from "../../IconButton";
import FormError from "../Auth/FormError";

interface ChangeAvatarDialogProps {
  children: ReactNode;
}

const ChangeAvatarModal = ({ children }: ChangeAvatarDialogProps) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const { handleChangeAvatar } = useProfileFunctions();
  const { data: userData } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setError("");
  };

  const handleConfirm = async () => {
    if (!file) return;
    setIsUploading(true);
    const result = await handleChangeAvatar(file);
    setIsUploading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setFile(null);
    setPreviewUrl(null);
    setError("");
  };

  const displaySrc = previewUrl ?? userData?.user?.image ?? undefined;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Profile Picture</AlertDialogTitle>
          <AlertDialogDescription>Upload a new profile picture.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="m-auto flex w-[90%] flex-col space-y-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="group relative shrink-0 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-16 w-16 border border-foreground/20">
                {displaySrc ? (
                  <AvatarImage src={displaySrc} />
                ) : (
                  <AvatarFallback>{userData?.user?.name?.slice(0, 2)}</AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <IconButton icon="upload" size="icon" iconSize="18px" className="pointer-events-none" />
              </div>
            </button>
            <div className="flex flex-col gap-1">
              <p className="font-thin md:text-base">{file ? file.name : "No file chosen"}</p>
              <IconButton
                icon="upload"
                text="Choose file"
                variant="outlinePrimary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <FormError message={error} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Save"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChangeAvatarModal;
