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
import { MouseEventHandler, ReactNode } from "react";

interface ConfirmationPromptProps {
  children: ReactNode;
  dialogTitle: string;
  dialogText: string;
  dialogAction: MouseEventHandler<HTMLButtonElement>;
  dialogActionText?: string;
}

const ConfirmationModal = ({
  dialogTitle,
  dialogText,
  dialogAction,
  dialogActionText = "Continue",
  children,
}: ConfirmationPromptProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="md:w-full" asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogText}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={dialogAction}>{dialogActionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;
