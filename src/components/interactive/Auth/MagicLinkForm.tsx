import { Button } from "@/components/ui/button";
import { type FC } from "react";
import IconButton from "../../IconButton";
import AuthCard from "./AuthCard";
import { MenuState } from "./AuthMenu";

interface IProps {
  email: string;
  returnTo: MenuState;
  setMenuState: (menuState: MenuState) => void;
}

interface MailProvider {
  label: string;
  url: string;
}

const MAIL_PROVIDERS: Record<string, MailProvider> = {
  "gmail.com": { label: "Open Gmail", url: "https://mail.google.com" },
  "googlemail.com": { label: "Open Gmail", url: "https://mail.google.com" },
  "outlook.com": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "outlook.de": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "outlook.co.uk": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "outlook.com.au": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "outlook.fr": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "outlook.es": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "outlook.it": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "hotmail.com": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "hotmail.de": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "hotmail.co.uk": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "hotmail.fr": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "live.com": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "live.de": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "live.co.uk": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "live.fr": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "msn.com": { label: "Open Outlook", url: "https://outlook.live.com/mail/inbox" },
  "yahoo.com": { label: "Open Yahoo Mail", url: "https://mail.yahoo.com" },
  "yahoo.de": { label: "Open Yahoo Mail", url: "https://mail.yahoo.com" },
  "icloud.com": { label: "Open iCloud Mail", url: "https://www.icloud.com/mail" },
  "me.com": { label: "Open iCloud Mail", url: "https://www.icloud.com/mail" },
  "mac.com": { label: "Open iCloud Mail", url: "https://www.icloud.com/mail" },
  "proton.me": { label: "Open Proton Mail", url: "https://mail.proton.me" },
  "protonmail.com": { label: "Open Proton Mail", url: "https://mail.proton.me" },
  "protonmail.ch": { label: "Open Proton Mail", url: "https://mail.proton.me" },
  "pm.me": { label: "Open Proton Mail", url: "https://mail.proton.me" },
};

function getMailProvider(email: string): MailProvider | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  return MAIL_PROVIDERS[domain] ?? null;
}

const MagicLinkForm: FC<IProps> = ({ email, returnTo, setMenuState }) => {
  const provider = getMailProvider(email);

  return (
    <AuthCard title="Check your inbox" size="default">
      <div className="flex flex-col gap-7">
        <div className="flex w-full flex-col gap-1 text-balance ">
          <p>
            We sent a sign-in link to <span className="font-semibold">{email}</span>.
          </p>
          <p className="text-sm text-foreground/50">Can&apos;t find it? Check your spam folder.</p>
        </div>
        <div className="flex w-full flex-col items-center gap-1">
          {provider && (
            <a href={provider.url} target="_blank" rel="noopener noreferrer" className="w-auto">
              <IconButton text={provider.label} icon="mailOpen" size="lg" variant="primary" />
            </a>
          )}
          <Button
            variant="link"
            onClick={() => setMenuState(returnTo)}
            className="border-0 font-thin uppercase text-foreground"
          >
            Back
          </Button>
        </div>
      </div>
    </AuthCard>
  );
};

export default MagicLinkForm;
