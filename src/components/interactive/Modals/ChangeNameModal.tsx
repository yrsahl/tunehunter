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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useProfileFunctions from "@/hooks/useProfileFunctions";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FormError from "../Auth/FormError";

const ChangeNameSchema = z.object({
  name: z.string().min(3, "Minimum 3 characters required"),
});

interface ChangeNameModalProps {
  children: ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ChangeNameModal = ({ children, open, setOpen }: ChangeNameModalProps) => {
  const [error, setError] = useState<string | undefined>("");
  const { handleChangeName } = useProfileFunctions();
  const form = useForm<z.infer<typeof ChangeNameSchema>>({
    resolver: zodResolver(ChangeNameSchema),
  });
  const name = form.watch("name", "");

  const handleCancel = () => {
    setOpen(false);
    setError("");
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof ChangeNameSchema>) => {
    setError("");
    const result = await handleChangeName(values.name);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      form.reset();
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger className="w-full" asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change your Username</AlertDialogTitle>
          <AlertDialogDescription>Enter a new username.</AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="m-auto flex w-[90%] flex-col space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal">New username:</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-foreground"
                      onKeyDown={(key) => {
                        setError("");
                        if (key.key === "Enter") form.handleSubmit(onSubmit)();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
          </form>
        </Form>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={form.handleSubmit(onSubmit)}
            disabled={!name || name.length < 3}
          >
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChangeNameModal;
