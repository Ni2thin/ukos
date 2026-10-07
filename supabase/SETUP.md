# Activate private cloud sync

Backup export, restore, restore undo and deleted-entry recovery already work locally. Cloud sign-in and sync require your own Supabase project. No service-role key is needed by this application.

1. Create a Supabase project. In its SQL Editor, run `migrations/202610070001_private_snapshots.sql` once. This creates a new private snapshot table, owner-only row-level-security policies, and an atomic revision-checked save function. It leaves legacy tables untouched.
2. In Authentication, enable Email/password sign-in. Keep email confirmation enabled. Set the Site URL to `http://localhost:3000` for development and add `http://localhost:3000/` and `http://localhost:3000/settings` to allowed redirect URLs. Add your actual production HTTPS URLs when deploying.
3. In your project’s API settings, copy the project URL and public publishable key (or legacy anon key). Create an ignored `.env.local` in the project root:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
   ```

   Never use a secret or service-role key in a `NEXT_PUBLIC_` variable. Restart `npm run dev` after configuring these values.
4. Open the **UK101 welcome page**, create an account using an email address as the username and a password, confirm its email, then sign in. A new account starts empty; local demo/personal records are not uploaded automatically. Before configuring Supabase, use **Open this device’s local workspace**, then **Backup & Sync** to export any existing records. Once Supabase is configured, signed-out visitors see the welcome page on every dashboard route. Sign in, choose your exported backup in **Backup & Sync**, review it, and restore it. This uploads the selected identity, health and document records to your Supabase account.
5. Verify with two accounts that each account sees only its own records. Test a signed-in offline edit, reload while offline, reconnect, and confirm that the sidebar changes from pending/error to synced. Test two-device conflicting edits; neither version should be silently discarded. Export both versions before applying a conflict choice.

## Database verification

The pgTAP test at `tests/private_snapshots.test.sql` covers owner-only reads/writes, anonymous denial, revision conflicts and idempotent retries. With Supabase CLI and Docker installed, start the local Supabase stack and run:

```sh
supabase init
supabase start
supabase db reset
supabase test db
```

The migration and pgTAP suite have **not** been executed against a live Supabase database in this workspace; a project has not been configured. The application’s mocked sync and backup tests run with `npm test`.

## Storage and recovery behavior

- All collections and deleted-entry recovery records are stored as one atomic local snapshot. Signed-in snapshots include a durable pending-upload marker. A failed save leaves the prior snapshot intact; the UI does not claim cloud success.
- Guest and individual account snapshots use separate browser-storage namespaces. Signing out hides the account workspace but retains its local cache and pending changes for the next sign-in. On shared devices, browser storage remains readable to someone with access to that browser profile; these caches and exported JSON files are not encrypted.
- Cloud snapshots use the current authenticated user as owner. Writes compare revisions and use mutation IDs to avoid duplicate uploads after a lost acknowledgement. The queue retries automatically with backoff and on network reconnection.
- Sync is snapshot-based. Edits to the same account from different devices can require choosing a whole snapshot. Export both versions before resolving. The prior local snapshot is retained for review/restore.
- Restore validates every collection, record type, enum, numeric field and duplicate ID before changing data. It saves a pre-restore snapshot locally. Storage must have room for both snapshots; if space is insufficient, restore fails without discarding the existing workspace.
- Deleted list entries are retained in recovery. Recovering a loan transaction also restores the recorded repayment total. There is no permanent-delete control in this release.
- Uploaded files are included in snapshots/backups as Base64 data. Large document collections can exceed browser-storage capacity; this release is not a replacement for dedicated encrypted document storage.
- Supabase Auth, project region, backup retention and account administration are managed in your Supabase dashboard. Review existing legacy tables separately: this new migration does not change their older permissions or migrate their contents.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase authentication](https://supabase.com/docs/guides/auth).

## UK101 welcome page

Email addresses are the login usernames. Sign-up requires password confirmation and at least eight characters; Supabase manages credential verification and email confirmation. Passwords are never written to application storage. New authenticated accounts use the existing per-user empty workspace and RLS-protected snapshot store. Sign out is available in the sidebar and in Backup & Sync.

Without Supabase configured, credential fields and submission are disabled. The local-workspace link is explicitly a shared browser mode, not an authenticated account; it must be selected again after a full reload. The link is not offered when Supabase is configured. Existing local backup formats and storage keys retain their UKOS identifiers for compatibility.
