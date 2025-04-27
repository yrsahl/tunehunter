import { Button } from "@/components/ui/button";
import { type FC } from "react";
import IconButton from "../../IconButton";
import AuthCard from "./AuthCard";
import { MenuState } from "./AuthMenu";

interface IProps {
  email: string;
  setMenuState: (menuState: MenuState) => void;
}

const MagicLinkForm: FC<IProps> = ({ email, setMenuState }) => {
  return (
    <AuthCard
      description={`We sent a mail to ${email}! If you can't find it, please also have a look in your spam folder.`}
      size="small"
    >
      <div className="mt-3 flex w-full flex-col items-center gap-1">
        <a href="mailto:" className="w-4/5">
          <IconButton text="Open mails" icon="mailOpen" size={"lg"} variant="primary" />
        </a>
        <Button variant="link" onClick={() => setMenuState(MenuState.SignIn)}>
          Go Back
        </Button>
      </div>
    </AuthCard>
  );
};

export default MagicLinkForm;

{
  /* <Form {...form}>
<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-6">
  <div className="space-y-4">
    <FormField
      control={form.control}
      name="token"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <InputOTP maxLength={6} {...field} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="border-foreground" />
                <InputOTPSlot index={1} className="border-foreground" />
                <InputOTPSlot index={2} className="border-foreground" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="border-foreground" />
                <InputOTPSlot index={4} className="border-foreground" />
                <InputOTPSlot index={5} className="border-foreground" />
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
  <FormError message={error} />
  <FormSuccess message={success} />
  <div className="flex flex-col items-center gap-2">
    <Button type="submit" className="w-full" variant="primary" disabled={isPending}>
      {confirmTokenText}
    </Button>
    <Button variant="link" onClick={() => setMenuState(MenuState.SignIn)}>
      {returnText}
    </Button>
  </div>
</form>
</Form> */
}
