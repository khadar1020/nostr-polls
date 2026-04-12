import { createContext, ReactNode, useEffect, useState } from "react";
import { LoginModal } from "../components/Login/LoginModal";
import { signerManager } from "../singletons/Signer/SignerManager";
import { StoredAccount } from "../utils/localStorage";

export type User = {
  name?: string;
  picture?: string;
  pubkey: string;
  privateKey?: string;
  follows?: string[];
  webOfTrust?: Set<string>;
  about?: string;
};

interface UserContextInterface {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  requestLogin: () => void;
  accounts: StoredAccount[];
  switchAccount: (pubkey: string) => Promise<void>;
  removeAccount: (pubkey: string) => Promise<void>;
}

export const ANONYMOUS_USER_NAME = "Anon...";

export const UserContext = createContext<UserContextInterface | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => signerManager.getUser());
  const [accounts, setAccounts] = useState<StoredAccount[]>(() => signerManager.getAccounts());
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    signerManager.registerLoginModal(() => {
      return new Promise<void>((resolve) => {
        setLoginModalOpen(true);
      });
    });
    signerManager.onChange(() => {
      setUser((prev) => {
        const next = signerManager.getUser();
        if (next?.pubkey && next.pubkey === prev?.pubkey) return prev;
        return next;
      });
      setAccounts([...signerManager.getAccounts()]);
    });
  }, []);

  const requestLogin = () => setLoginModalOpen(true);

  const switchAccount = async (pubkey: string) => {
    await signerManager.switchAccount(pubkey);
  };

  const removeAccount = async (pubkey: string) => {
    await signerManager.removeAccount(pubkey);
  };

  return (
    <UserContext.Provider value={{ user, setUser, requestLogin, accounts, switchAccount, removeAccount }}>
      {children}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </UserContext.Provider>
  );
}
