import { fireEvent, render, screen } from "@/test/utils";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfileMenu from "../ProfileMenu";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className }: { children?: ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
}));

const mockHandleDeleteAccount = vi.fn();
const mockHandleLinkSpotify = vi.fn();
const mockHandleSignOut = vi.fn();
const mockHandleUnlinkSpotify = vi.fn();

const mockChangeRegion = vi.fn();
const mockSetRegionByLocation = vi.fn();
const mockChangeAutoThemePreference = vi.fn();
const mockChangeParticlePreference = vi.fn();

type SessionData = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

type SpotifyAccountData = {
  data: {
    providerAccountId: string;
  };
};

let mockSessionData: SessionData | null = {
  user: {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    image: null,
  },
};

let mockSpotifyAccountData: SpotifyAccountData | null = null;
let mockParticlePreference: boolean | undefined = undefined;

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: mockSessionData,
    status: mockSessionData ? "authenticated" : "unauthenticated",
  }),
}));

vi.mock("@/hooks/useProfileFunctions", () => ({
  default: () => ({
    handleDeleteAccount: mockHandleDeleteAccount,
    handleLinkSpotify: mockHandleLinkSpotify,
    handleSignOut: mockHandleSignOut,
    handleUnlinkSpotify: mockHandleUnlinkSpotify,
  }),
}));

vi.mock("@/hooks/settings/useRegionSettings", () => ({
  default: () => ({
    region: "de",
    changeRegion: mockChangeRegion,
    createRegionName: (region: string) => region,
    setRegionByLocation: mockSetRegionByLocation,
    sortedRegions: { priority: ["DE", "US"], rest: [] },
  }),
}));

vi.mock("@/hooks/settings/useThemeSettings", () => ({
  default: () => ({
    particlePreference: mockParticlePreference,
    preferredTheme: "auto",
    changeAutoThemePreference: mockChangeAutoThemePreference,
    changeParticlePreference: mockChangeParticlePreference,
  }),
  AutoThemePreferences: ["auto", "manual"],
}));

vi.mock("@/hooks/settings/useRoleSettings", () => ({
  default: () => ({
    role: "music_lover",
    changeRole: vi.fn(),
  }),
  userRoles: ["music_lover", "dj", "audiophile"],
  userRoleLabels: { music_lover: "Music Lover", dj: "DJ", audiophile: "Audiophile" },
}));

vi.mock("@/contexts/SpotifyUserDataContext", () => ({
  useSpotifyUserDataContext: () => ({
    spotifyUserData: {
      profileData: {
        display_name: "Spotify User",
      },
    },
  }),
}));

vi.mock("@/hooks/useAuthErrors", () => ({
  default: () => null,
}));

vi.mock("@/lib/api", () => ({
  api: {
    account: {
      getSpotifyAccountById: {
        useQuery: () => ({ data: mockSpotifyAccountData }),
      },
    },
  },
}));

vi.mock("@/components/IconButton", () => ({
  default: ({ onClick, text, icon, "data-testid": dataTestId }: IconButtonMockProps) => (
    <button
      type="button"
      onClick={onClick}
      data-testid={dataTestId ?? `icon-button-${icon ?? text ?? "default"}`}
    >
      {text ?? icon ?? "button"}
    </button>
  ),
}));

vi.mock("@/components/interactive/Modals/ChangeAvatarModal", () => ({
  default: ({ children }: ChildrenProps) => <div>{children}</div>,
}));

vi.mock("@/components/interactive/Modals/ChangeMailModal", () => ({
  default: ({ children }: ChildrenProps) => <div>{children}</div>,
}));

vi.mock("@/components/interactive/Modals/ConfirmationModal", () => ({
  default: ({ children, dialogAction, dialogTitle }: ConfirmationModalProps) => (
    <div>
      <button
        type="button"
        data-testid={dialogTitle.includes("Unlink") ? "confirm-unlink" : "confirm-delete"}
        onClick={() => {
          void dialogAction();
        }}
      >
        confirm
      </button>
      {children}
    </div>
  ),
}));

vi.mock("@/components/interactive/Auth/AuthCard", () => ({
  default: ({ children }: ChildrenProps) => <div>{children}</div>,
}));

vi.mock("../../ui/avatar", () => ({
  Avatar: ({ children }: ChildrenProps) => <div>{children}</div>,
  AvatarFallback: ({ children }: ChildrenProps) => <div>{children}</div>,
  AvatarImage: () => <div data-testid="avatar-image" />,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: ChildrenProps) => <div>{children}</div>,
  SelectTrigger: ({ children, id, "data-testid": dataTestId }: SelectTriggerProps) => (
    <button id={id} data-testid={dataTestId}>
      {children}
    </button>
  ),
  SelectValue: () => <span>value</span>,
  SelectContent: ({ children }: ChildrenProps) => <div>{children}</div>,
  SelectItem: ({ children, "data-testid": dataTestId }: SelectItemProps) => (
    <div data-testid={dataTestId}>{children}</div>
  ),
  SelectSeparator: () => <hr />,
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange, "data-testid": dataTestId, id }: SwitchProps) => (
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid={dataTestId}
      id={id}
    />
  ),
}));

interface ChildrenProps {
  children: ReactNode;
}

interface IconButtonMockProps {
  onClick?: () => void;
  text?: string;
  icon?: string;
  "data-testid"?: string;
}

interface ConfirmationModalProps {
  children: ReactNode;
  dialogAction: () => void | Promise<void>;
  dialogTitle: string;
}

interface SelectTriggerProps {
  children: ReactNode;
  id?: string;
  "data-testid"?: string;
}

interface SelectItemProps {
  children: ReactNode;
  "data-testid"?: string;
}

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  "data-testid"?: string;
  id?: string;
}

describe("ProfileMenu", () => {
  beforeEach(() => {
    mockSessionData = {
      user: {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        image: null,
      },
    };
    mockSpotifyAccountData = null;
    mockParticlePreference = undefined;

    mockHandleDeleteAccount.mockReset();
    mockHandleLinkSpotify.mockReset();
    mockHandleSignOut.mockReset();
    mockHandleUnlinkSpotify.mockReset();
    mockChangeRegion.mockReset();
    mockSetRegionByLocation.mockReset();
    mockChangeAutoThemePreference.mockReset();
    mockChangeParticlePreference.mockReset();
  });

  it("calls sign out when unauthenticated fallback logout button is clicked", () => {
    mockSessionData = null;

    render(<ProfileMenu />);

    const logoutButton = screen.getByText("Log out");
    fireEvent.click(logoutButton);

    expect(mockHandleSignOut).toHaveBeenCalledTimes(1);
  });

  it("calls delete account with user id from confirm action", () => {
    render(<ProfileMenu />);

    fireEvent.click(screen.getByTestId("confirm-delete"));

    expect(mockHandleDeleteAccount).toHaveBeenCalledWith("user-123");
  });


});
