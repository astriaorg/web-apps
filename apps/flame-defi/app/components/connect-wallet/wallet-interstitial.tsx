"use client";

import { useLoginWithEmail, useLoginWithSms } from "@privy-io/react-auth";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@repo/ui/components";
import { WalletIcon } from "@repo/ui/icons/monochrome";
import { AstriaIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { useEvmWallet } from "features/evm-wallet";
import { usePrivyWallet } from "features/privy";

/**
 * Wallet interstitial dialog that provides options to:
 * 1. Connect EVM wallets
 * 2. Login with email or phone
 */
export const WalletInterstitial = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | null>(null);

  const { sendCode: sendEmailCode, loginWithCode: loginWithEmailCode } =
    useLoginWithEmail();
  const { sendCode: sendPhoneCode, loginWithCode: loginWithPhoneCode } =
    useLoginWithSms();

  const { evmAccountAddress, connectEvmWallet } = useEvmWallet();
  const { privyAccountAddress, privyIsConnected, connectPrivyWallet } =
    usePrivyWallet();

  const account = useAccount();
  const walletConnected =
    !!account.address || !!evmAccountAddress || privyIsConnected;

  const buttonLabel = useMemo(() => {
    if (account.address) {
      return shortenAddress(account.address);
    }
    if (evmAccountAddress) {
      return shortenAddress(evmAccountAddress);
    }
    if (privyAccountAddress) {
      return shortenAddress(privyAccountAddress);
    }
    return "Connect Wallet";
  }, [account.address, evmAccountAddress, privyAccountAddress]);

  // If wallet is already connected, just show the button with address
  if (walletConnected) {
    return <Button size="sm">{buttonLabel}</Button>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!showCodeInput) {
      // Send verification code
      if (email && !phone) {
        await sendEmailCode({ email });
        setAuthMethod("email");
        setShowCodeInput(true);
      } else if (phone && !email) {
        // Ensure phone number has proper format with country code
        const formattedPhone = phone.startsWith("+")
          ? phone
          : `+1${phone.replace(/\D/g, "")}`;
        await sendPhoneCode({ phoneNumber: formattedPhone });
        setAuthMethod("phone");
        setShowCodeInput(true);
      } else if (email && phone) {
        // Use email if both are provided
        await sendEmailCode({ email });
        setAuthMethod("email");
        setShowCodeInput(true);
      }
    } else {
      // Verify the code
      if (authMethod === "email") {
        await loginWithEmailCode({ code: verificationCode });
      } else if (authMethod === "phone") {
        await loginWithPhoneCode({ code: verificationCode });
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Wallet connection option */}
          <div>
            <Button
              onClick={connectEvmWallet}
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <WalletIcon className="h-5 w-5" />
              <span>Connect EVM Wallet</span>
            </Button>
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-border-default"></div>
            <span className="mx-2 text-xs text-typography-subdued">OR</span>
            <div className="flex-grow border-t border-border-default"></div>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!showCodeInput ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-1.5">Email</p>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium mb-1.5">Phone Number</p>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 5551234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!email && !phone}
                >
                  Send Verification Code
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-1.5">
                    Verification Code{" "}
                    {authMethod === "email"
                      ? `(sent to ${email})`
                      : `(sent to ${phone})`}
                  </p>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowCodeInput(false);
                      setVerificationCode("");
                      setAuthMethod(null);
                    }}
                  >
                    Back
                  </Button>

                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!verificationCode}
                  >
                    Verify
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
