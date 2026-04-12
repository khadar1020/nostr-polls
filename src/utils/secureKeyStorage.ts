// utils/secureKeyStorage.ts
import { Preferences } from "@capacitor/preferences";

const NSEC_KEY = "nostr_nsec";

export async function saveNsec(nsec: string) {
  await Preferences.set({
    key: NSEC_KEY,
    value: nsec,
  });
}

export async function getNsec(): Promise<string | null> {
  const { value } = await Preferences.get({ key: NSEC_KEY });
  return value;
}

export async function removeNsec() {
  await Preferences.remove({ key: NSEC_KEY });
}

const NIP55_PACKAGE_KEY = "nip55_package_name";
const NIP55_PUBKEY_KEY = "nip55_pubkey";

export async function saveNip55Credentials(packageName: string, pubkey: string) {
  await Preferences.set({ key: NIP55_PACKAGE_KEY, value: packageName });
  await Preferences.set({ key: NIP55_PUBKEY_KEY, value: pubkey });
}

export async function getNip55Credentials(): Promise<{ packageName: string; pubkey: string } | null> {
  const { value: packageName } = await Preferences.get({ key: NIP55_PACKAGE_KEY });
  const { value: pubkey } = await Preferences.get({ key: NIP55_PUBKEY_KEY });

  if (packageName && pubkey) {
    return { packageName, pubkey };
  }
  return null;
}

export async function removeNip55Credentials() {
  await Preferences.remove({ key: NIP55_PACKAGE_KEY });
  await Preferences.remove({ key: NIP55_PUBKEY_KEY });
}

// ---------------------------------------------------------------------------
// Per-account secure storage (multi-account support)
// Keys are namespaced by pubkey so multiple accounts can coexist.
// ---------------------------------------------------------------------------

export async function saveNsecForAccount(pubkey: string, nsec: string) {
  await Preferences.set({ key: `nostr_nsec_${pubkey}`, value: nsec });
}

export async function getNsecForAccount(pubkey: string): Promise<string | null> {
  const { value } = await Preferences.get({ key: `nostr_nsec_${pubkey}` });
  return value;
}

export async function removeNsecForAccount(pubkey: string) {
  await Preferences.remove({ key: `nostr_nsec_${pubkey}` });
}

export async function saveNip55PkgForAccount(pubkey: string, packageName: string) {
  await Preferences.set({ key: `nip55_pkg_${pubkey}`, value: packageName });
}

export async function getNip55PkgForAccount(pubkey: string): Promise<string | null> {
  const { value } = await Preferences.get({ key: `nip55_pkg_${pubkey}` });
  return value;
}

export async function removeNip55PkgForAccount(pubkey: string) {
  await Preferences.remove({ key: `nip55_pkg_${pubkey}` });
}
