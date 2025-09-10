# Adding Test IDs to Components

This guide shows you how to add `data-testid` attributes to the existing components for E2E testing.

## Required Test IDs

Based on the E2E tests, you need to add the following `data-testid` attributes to your components:

### Search Components

**SearchBar.tsx** - Add to the main input element:

```tsx
<Input
  data-testid="search-input"
  type="text"
  placeholder={currentPlaceholder}
  // ... other props
/>
```

**SearchQueries.tsx** - Add to search results container:

```tsx
<motion.div
  data-testid="search-results"
  className="hide-scrollbars absolute z-50 h-60 w-full overflow-scroll..."
>
```

**SearchQueries.tsx** - Add to individual search result items:

```tsx
<motion.tr
  data-testid="search-result-item"
  whileHover={{...}}
  className="cursor-pointer"
  onClick={() => submitSearch(track.id, region, track.name, primaryArtist)}
  key={track.id}
>
```

**SearchSettings.tsx** - Add to settings popover trigger:

```tsx
<PopoverTrigger data-testid="search-settings-button">
  <motion.div>
    <Cog />
  </motion.div>
</PopoverTrigger>
```

**SearchTabButton.tsx** - Add to each tab button:

```tsx
// In the SearchTabButton component, add:
<motion.div
  data-testid={`search-tab-${searchTab}`}
  className="..."
  onClick={handleClick}
>
```

**SearchTabContent.tsx** - Add to tab content containers:

```tsx
<motion.div data-testid={`${activeSearchTab}-content`} className="...">
  {activeSearchTab === "trending" && <TrendingTable />}
  {activeSearchTab === "spotify" && <SpotifyTable />}
  {activeSearchTab === "history" && <HistoryTable />}
  {activeSearchTab === "wishlist" && <WishlistTable />}
</motion.div>
```

### Authentication Components

**Layout or Auth components** - Add login/logout buttons:

```tsx
// Login button (when not authenticated)
<Button data-testid="login-button" onClick={handleLogin}>
  Login
</Button>

// User menu (when authenticated)
<div data-testid="user-menu" onClick={toggleMenu}>
  <Avatar>...</Avatar>
</div>

// Logout button (in user menu)
<Button data-testid="logout-button" onClick={handleLogout}>
  Logout
</Button>
```

### Spotify Integration Components

**SpotifyTable.tsx** - Add to Spotify content:

```tsx
<div data-testid="spotify-content">
  {/* Spotify content */}
</div>

// For sub-tabs:
<button data-testid="spotify-subtab-recently_played">Recently Played</button>
<button data-testid="spotify-subtab-most_played">Top Tracks</button>
<button data-testid="spotify-subtab-queue">Queue</button>

// For recently played section:
<div data-testid="recently-played">
  {/* recently played tracks */}
</div>

// For refresh button:
<IconButton
  data-testid="spotify-refresh-button"
  icon="refresh"
  onClick={refetchData}
/>
```

**SpotifyPlayIcon.tsx** - Add to play/pause buttons:

```tsx
// Play button
<button data-testid="spotify-play-button" onClick={handlePlay}>
  <Play />
</button>

// Pause button (when playing)
<button data-testid="spotify-pause-button" onClick={handlePause}>
  <Pause />
</button>
```

**ProfileMenu.tsx** - Add Spotify connection elements:

```tsx
// Spotify connect button (when not connected)
<IconButton
  data-testid="spotify-connect-button"
  icon="spotify"
  text="Connect"
  onClick={handleLinkSpotify}
/>

// Spotify connected indicator (when connected)
<div data-testid="spotify-connected">
  <span>Connected: {spotifyUserData?.profileData?.display_name}</span>
</div>

// Spotify disconnect button
<button data-testid="spotify-disconnect-button" onClick={handleUnlinkSpotify}>
  Disconnect
</button>
```

### User Profile Components

**ProfileMenu.tsx** - Add profile elements:

```tsx
// Theme select
<Select data-testid="theme-select" value={theme} onValueChange={setTheme}>
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>
    <SelectItem data-testid="theme-option-light" value="light">Light</SelectItem>
    <SelectItem data-testid="theme-option-dark" value="dark">Dark</SelectItem>
    <SelectItem data-testid="theme-option-auto" value="auto">Auto</SelectItem>
  </SelectContent>
</Select>

// Region select
<Select data-testid="region-select" value={region} onValueChange={changeRegion}>
  <SelectContent>
    <SelectItem data-testid="region-option-us" value="us">United States</SelectItem>
    {/* other regions */}
  </SelectContent>
</Select>

// Auto-detect region button
<IconButton
  data-testid="auto-detect-region-button"
  icon="mapPin"
  onClick={setRegionByLocation}
/>

// Current region display
<span data-testid="current-region">{region}</span>

// Profile buttons
<button data-testid="change-avatar-button">Change Avatar</button>
<button data-testid="change-email-button">Change Email</button>
<button data-testid="delete-account-button">Delete Account</button>

// Particles toggle
<Switch data-testid="particles-toggle" checked={particles} onCheckedChange={setParticles} />
```

### Wishlist Components

**TableRow.tsx** or wishlist components - Add wishlist buttons:

```tsx
// Add to wishlist button (when not in wishlist)
<IconButton
  data-testid="wishlist-button"
  icon="heart"
  onClick={addToWishlist}
/>

// Remove from wishlist button (when in wishlist)
<IconButton
  data-testid="wishlist-remove-button"
  icon="heart-filled"
  onClick={removeFromWishlist}
/>

// Wishlist link in navigation
<Link data-testid="wishlist-link" href="/wishlist">
  Wishlist
</Link>

// Wishlist count indicator
<span data-testid="wishlist-count">{wishlistCount}</span>

// Wishlist filter input
<Input data-testid="wishlist-filter" placeholder="Filter wishlist..." />

// Wishlist sort select
<Select data-testid="wishlist-sort">
  <SelectItem data-testid="sort-by-artist" value="artist">Sort by Artist</SelectItem>
</Select>
```

### Error and Loading States

Add these where appropriate:

```tsx
// Loading indicators
<div data-testid="search-loading">Loading...</div>
<div data-testid="spotify-loading">Loading Spotify data...</div>

// Error messages
<div data-testid="search-error">Search failed</div>
<div data-testid="spotify-error">Spotify error</div>
<div data-testid="wishlist-error">Wishlist error</div>
<div data-testid="error-message">Generic error</div>

// No data messages
<div data-testid="no-results">No search results found</div>
<div data-testid="no-spotify-data">No Spotify data available</div>
```

### Table and List Components

**TableRow.tsx** - Add to track items:

```tsx
<tr data-testid="track-item">{/* track content */}</tr>
```

### Modal and Dialog Components

Add to confirmation dialogs and modals:

```tsx
// Avatar change dialog
<Dialog data-testid="avatar-dialog">...</Dialog>

// Email change dialog
<Dialog data-testid="email-dialog">
  <Input data-testid="new-email-input" />
  <Button data-testid="email-submit-button">Submit</Button>
</Dialog>

// Delete confirmation dialog
<Dialog data-testid="delete-confirmation-dialog">
  <Button data-testid="confirm-delete-button">Confirm Delete</Button>
</Dialog>
```

### Navigation and Layout

**Layout components** - Add navigation elements:

```tsx
// Mobile navigation
<nav data-testid="mobile-nav">...</nav>

// Theme toggle button
<button data-testid="theme-toggle" onClick={toggleTheme}>
  <Sun />
</button>
```

## Implementation Tips

1. **Add test IDs incrementally**: Start with the most important user flows (search, authentication) and add test IDs as you go.

2. **Use descriptive names**: Make test IDs clear about what they represent:

   - `search-input` instead of `input`
   - `spotify-play-button` instead of `button`

3. **Keep them consistent**: Use kebab-case and follow a naming pattern:

   - `component-action` (e.g., `wishlist-button`)
   - `section-content` (e.g., `spotify-content`)

4. **Add to conditional elements**: Make sure elements that appear/disappear based on state have test IDs:

   ```tsx
   {
     isLoggedIn ? (
       <div data-testid="user-menu">...</div>
     ) : (
       <button data-testid="login-button">...</button>
     );
   }
   ```

5. **Don't forget loading and error states**: These are crucial for E2E testing:
   ```tsx
   {
     isLoading && <div data-testid="loading-spinner">...</div>;
   }
   {
     error && <div data-testid="error-message">{error}</div>;
   }
   ```

## Running Tests After Adding IDs

After adding test IDs to your components:

1. **Run specific tests** to see which ones pass:

   ```bash
   bunx playwright test home.spec.ts
   ```

2. **Run in headed mode** to see what's happening:

   ```bash
   bunx playwright test --headed
   ```

3. **Use debug mode** to step through tests:
   ```bash
   bunx playwright test --debug
   ```

The tests will become more reliable as you add the required test IDs to your components.
