#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Mapping of old imports to new imports
const importMappings = {
  // Formatters
  "@/helpers/format-date": "@/lib/formatters",
  "@/helpers/format-duration": "@/lib/formatters",
  "@/helpers/currency": "@/lib/formatters",

  // Validators & Constants
  "@/helpers/region": "@/lib/validators",
  "@/helpers/lang": "@/lib/validators",
  "@/helpers/storenames": "@/lib/constants",

  // Browser utilities
  "@/helpers/user-location": "@/lib/browser",

  // Generators
  "@/helpers/random-generators": "@/lib/generators",
  "@/helpers/verification-token": "@/lib/generators",

  // Animations
  "@/helpers/animations": "@/styles/animations",

  // Icons
  "@/helpers/custom-icons": "@/components/icons",

  // Spotify services
  "@/helpers/spotify/fetch-spotify-tokens": "@/services/spotify",
  "@/helpers/spotify/fetch-spotify-data": "@/services/spotify",
  "@/helpers/spotify/amend-artist-data": "@/services/spotify",

  // Vendor services
  "@/helpers/vendor-data/fetch-vendor-data": "@/services/vendors",
  "@/helpers/vendor-data/format-vendor-data": "@/services/vendors",

  // Email services
  "@/helpers/mail": "@/services/email",

  // Utils
  "@/helpers/filter-queries": "@/utils/filters",
  "@/helpers/wait": "@/utils/async",
  "@/helpers/sign-in": "@/utils/auth",
  "@/helpers/nextauth-errors": "@/utils/auth",
  "@/helpers/trpc-errors": "@/utils/auth",
  "@/helpers/play-jingle": "@/utils/browser",

  // Event emitter - special case for relative import
  "../helpers/event-emitter": "@/hooks/shared",
};

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let updated = false;

  Object.entries(importMappings).forEach(([oldImport, newImport]) => {
    // Handle both single and multiple imports
    const patterns = [
      // Regular imports
      new RegExp(`from\\s+["']${oldImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "g"),
      // Import with destructuring
      new RegExp(
        `import\\s+\\{[^}]*\\}\\s+from\\s+["']${oldImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
        "g",
      ),
      // Default imports
      new RegExp(
        `import\\s+\\w+\\s+from\\s+["']${oldImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
        "g",
      ),
      // Mixed imports
      new RegExp(
        `import\\s+\\w+,\\s*\\{[^}]*\\}\\s+from\\s+["']${oldImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
        "g",
      ),
    ];

    patterns.forEach((pattern) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          return match.replace(oldImport, newImport);
        });
        updated = true;
      }
    });
  });

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

// Files to update based on grep results
const filesToUpdate = [
  "src/components/interactive/SongListings/SongListingRowSkeleton.tsx",
  "src/pages/auth_callback/index.tsx",
  "src/components/interactive/SongListings/SongPreview.tsx",
  "src/components/IconButton.tsx",
  "src/components/CustomIcon.tsx",
  "src/components/interactive/SongListings/SongListingRow.tsx",
  "src/components/interactive/SongListings/SongListings.tsx",
  "src/components/interactive/SongListings/VendorLogo.tsx",
  "src/components/interactive/SongListings/SongListingRowMessage.tsx",
  "src/components/interactive/SongListings/SongListingsContainer.tsx",
  "src/components/interactive/Search/SearchBar.tsx",
  "src/components/interactive/Search/SearchQueries.tsx",
  "src/components/interactive/Modals/ChangeMailModal.tsx",
  "src/components/interactive/Search/SearchTabContent/TrendingTable.tsx",
  "src/components/interactive/Search/SearchTabContent/WishlistTable.tsx",
  "src/components/interactive/Search/SearchTabs/SearchTabContent.tsx",
  "src/components/interactive/Search/SearchSettings.tsx",
  "src/components/interactive/Search/SearchTabContent/TableRow.tsx",
  "src/components/interactive/Search/SearchTabContent/HistoryTable.tsx",
  "src/components/interactive/Search/SearchTabContent/SpotifyTable.tsx",
  "src/components/interactive/Auth/SignInForm.tsx",
  "src/components/interactive/Auth/RegisterForm.tsx",
  "src/components/interactive/Auth/ProfileMenu.tsx",
  "src/components/interactive/Footer/InfoButton.tsx",
  "src/hooks/useEventEmitter.ts",
  "src/hooks/useSearch.ts",
  "src/hooks/stores/useSearchStore.ts",
  "src/hooks/settings/useLanguageSettings.ts",
  "src/hooks/useProfileFunctions.ts",
  "src/hooks/settings/useUserSettings.ts",
  "src/hooks/settings/useRegionSettings.ts",
  "src/hooks/settings/useThemeSettings.ts",
  "src/hooks/useAuthErrors.ts",
  "src/server/auth.ts",
  "src/contexts/SpotifyUserDataContext.tsx",
  "src/contexts/SongListingContext.tsx",
  "src/contexts/QueryDataContext.tsx",
  "src/server/api/routers/client-credentials-router.ts",
  "src/server/api/routers/song-listings-router.ts",
  "src/server/api/routers/user-router.ts",
  "src/server/api/routers/account-router.ts",
  "src/server/api/routers/song-router.ts",
];

console.log("Updating import paths...\n");

filesToUpdate.forEach((file) => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    updateFile(fullPath);
  } else {
    console.log(`Warning: File not found: ${fullPath}`);
  }
});

console.log("\nImport path updates completed!");
