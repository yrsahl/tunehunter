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
import { ReactNode } from "react";

interface ChangeAvatarDialogProps {
  children: ReactNode;
}

const ChangeAvatarModal = ({ children }: ChangeAvatarDialogProps) => {
  const { handleChangeAvatar } = useProfileFunctions();

  return (
    <AlertDialog>
      <AlertDialogTrigger className="w-full" asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>dialogTitle</AlertDialogTitle>
          <AlertDialogDescription>dialogText</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleChangeAvatar}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChangeAvatarModal;
