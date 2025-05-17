import * as DialogPrimitive from "@radix-ui/react-dialog";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLoginWithEmail, useLoginWithSms } from "@privy-io/react-auth";

import type { FlameNetwork } from "@repo/flame-types";
import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle, Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components";
import { CheckIcon, ChevronDownIcon, CloseIcon } from "@repo/ui/icons";
import { InfoIcon, WalletIcon } from "@repo/ui/icons/monochrome";
import { AstriaIcon } from "@repo/ui/icons/polychrome";
import { AstriaLogo } from "@repo/ui/logos";
import { cn, shortenAddress } from "@repo/ui/utils";
import { ConnectWalletContent } from "components/connect-wallet";
import { LINKS } from "components/footer/links";
import { useAstriaChainData, useConfig } from "config";
import { useAstriaWallet, useEvmWallet } from "features/evm-wallet";
import { usePrivyWallet } from "features/privy";

import { MobileNavigationMenuLink } from "./mobile-navigation-menu-link";
import { NavigationMenuButton } from "./navigation-menu-button";
import { NetworkIcon } from "./network-icon";

export const MobileNavigationMenu = () => {
  const pathname = usePathname();
  const account = useAccount();
  const {
    brandURL,
    featureFlags,
    networksList,
    selectedFlameNetwork,
    selectFlameNetwork,
  } = useConfig();
  const { chain } = useAstriaChainData();
  const {
    connectWallet,
    disconnectWallet,
    nativeTokenBalance,
    isLoadingNativeTokenBalance,
    usdcToNativeQuote,
    quoteLoading,
  } = useAstriaWallet();
  const { evmAccountAddress, connectEvmWallet } = useEvmWallet();
  const { 
    privyAccountAddress, 
    privyIsConnected,
    connectPrivyWallet 
  } = usePrivyWallet();
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | null>(null);
  
  const { sendCode: sendEmailCode, loginWithCode: loginWithEmailCode } = useLoginWithEmail();
  const { sendCode: sendPhoneCode, loginWithCode: loginWithPhoneCode } = useLoginWithSms();

  const [isOpen, setIsOpen] = useState(false);
  const [isNetworkSelectOpen, setIsNetworkSelectOpen] = useState(false);
  const [isConnectWalletOpen, setIsConnectWalletOpen] = useState(false);

  const isConnected = !!account.address || !!evmAccountAddress || privyIsConnected;

  const handleNetworkSelect = useCallback(
    (network: FlameNetwork) => {
      selectFlameNetwork(network);
      setIsNetworkSelectOpen(false);
    },
    [selectFlameNetwork],
  );

  const handleOnNetworkSelectOpen = useCallback(() => {
    setIsNetworkSelectOpen(true);
    setIsOpen(false);
  }, []);

  const handleOnConnectWalletOpen = useCallback(() => {
    if (!isConnected) {
      connectWallet();
    } else {
      setIsConnectWalletOpen(true);
    }
    setIsOpen(false);
  }, [isConnected, connectWallet]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="p-0 [&_svg]:size-5 hover:text-initial"
          >
            <NavigationMenuButton size={20} isOpen={isOpen} />
          </Button>
        </DialogTrigger>
        {/* Use primitive Dialog.Content so we can customize overlay and close button. */}
        <DialogPortal>
          <DialogOverlay className="bg-background-default" />
          <DialogPrimitive.Content
            className={cn(
              "fixed z-50 top-0 left-0 w-screen h-screen bg-background-default duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              // Fix layout shift when page has scrollbar. This is due to the `react-remove-scroll` library that Radix UI uses under the hood.
              "w-[calc(100vw-var(--removed-body-scroll-bar-size,0px))]",
            )}
          >
            <DialogTitle className="sr-only"></DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
            <div className="flex flex-col px-6 pb-8 h-full">
              <div className="flex items-center justify-between w-full h-14 shrink-0">
                {/* Align with the logo and button in the navigation menu for seamless transitions. */}
                <a
                  target="_blank"
                  href={brandURL}
                  className="flex items-center h-5 -ml-2"
                  rel="noreferrer"
                  aria-label="Astria Logo"
                >
                  <AstriaLogo />
                </a>
                <DialogClose className="absolute right-4 top-4.5">
                  <NavigationMenuButton size={20} isOpen={isOpen} />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </div>

              <div className="flex-1" />
              <div className="flex flex-col items-center py-8 space-y-8">
                <MobileNavigationMenuLink
                  href={LINKS.BRIDGE}
                  isActive={pathname.startsWith(LINKS.BRIDGE)}
                >
                  Bridge
                </MobileNavigationMenuLink>
                <MobileNavigationMenuLink
                  href={LINKS.SWAP}
                  isActive={pathname.startsWith(LINKS.SWAP)}
                >
                  Swap
                </MobileNavigationMenuLink>
                {featureFlags.poolEnabled && (
                  <MobileNavigationMenuLink
                    href={LINKS.POOL}
                    isActive={pathname.startsWith(LINKS.POOL)}
                  >
                    Pool
                  </MobileNavigationMenuLink>
                )}
                {featureFlags.earnEnabled && (
                  <>
                    <MobileNavigationMenuLink
                      href={LINKS.EARN}
                      isActive={pathname.startsWith(LINKS.EARN)}
                    >
                      Earn
                    </MobileNavigationMenuLink>
                    <MobileNavigationMenuLink
                      href={LINKS.BORROW}
                      isActive={pathname.startsWith(LINKS.BORROW)}
                    >
                      Borrow
                    </MobileNavigationMenuLink>
                  </>
                )}
              </div>
              <div className="flex-1" />
              <div className="flex flex-col space-y-2">
                <Button
                  variant="secondary"
                  onClick={() => handleOnNetworkSelectOpen()}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <NetworkIcon network={selectedFlameNetwork} size={16} />
                    <span className="capitalize">{selectedFlameNetwork}</span>
                  </div>
                  <ChevronDownIcon />
                </Button>
                <Button
                  variant={isConnected ? "secondary" : "default"}
                  onClick={() => handleOnConnectWalletOpen()}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {isConnected
                      ? shortenAddress(account.address as string)
                      : "Connect Wallet"}
                  </div>
                  <ChevronDownIcon />
                </Button>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      <Drawer open={isNetworkSelectOpen} onOpenChange={setIsNetworkSelectOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between px-6 py-0">
            <DrawerTitle>Network</DrawerTitle>
            <DrawerClose>
              <CloseIcon size={20} className="text-icon-subdued" />
            </DrawerClose>
          </DrawerHeader>
          <div className="flex flex-col p-6">
            {networksList.map((network) => (
              <div
                key={network}
                className="flex select-none items-center gap-2 text-sm rounded-md px-6 py-3 hover:bg-surface-3"
                onClick={() => handleNetworkSelect(network)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <NetworkIcon network={network} size={16} />
                  <span className="capitalize">{network}</span>
                </div>
                {network === selectedFlameNetwork && (
                  <div>
                    <CheckIcon className="h-3 w-3 text-icon-subdued" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={isConnectWalletOpen} onOpenChange={setIsConnectWalletOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between px-6 py-0">
            <DrawerTitle>Connect Wallet</DrawerTitle>
            <DrawerClose>
              <CloseIcon size={20} className="text-icon-subdued" />
            </DrawerClose>
          </DrawerHeader>
          {isConnected ? (
            <div className="flex flex-col p-6">
              <ConnectWalletContent
                isConnected={true}
                isLoading={
                  (isLoadingNativeTokenBalance && !nativeTokenBalance) ||
                  quoteLoading
                }
                account={account}
                balance={nativeTokenBalance ?? undefined}
                fiat={usdcToNativeQuote}
                explorer={{
                  url: `${chain.blockExplorerUrl}/address/${account.address || evmAccountAddress || privyAccountAddress}`,
                }}
                label={shortenAddress(account.address || evmAccountAddress || privyAccountAddress || "")}
                icon={<AstriaIcon />}
                onConnectWallet={connectWallet}
                onDisconnectWallet={() => {
                  setIsConnectWalletOpen(false);
                  disconnectWallet();
                }}
                isCollapsible={false}
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-col gap-6">
                {/* Wallet connection option */}
                <div>
                  <Button 
                    onClick={() => {
                      connectEvmWallet();
                      setIsConnectWalletOpen(false);
                    }}
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
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    
                    if (!showCodeInput) {
                      // Send verification code
                      if (email && !phone) {
                        await sendEmailCode({ email });
                        setAuthMethod("email");
                        setShowCodeInput(true);
                      } else if (phone && !email) {
                        // Ensure phone number has proper format with country code
                        const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
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
                      setIsConnectWalletOpen(false);
                    }
                  }} 
                  className="space-y-4"
                >
                  {!showCodeInput ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm font-medium mb-1.5">Email</p>
                        <Input
                          id="mobile-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium mb-1.5">Phone Number</p>
                        <Input
                          id="mobile-phone"
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
                          Verification Code {authMethod === "email" ? `(sent to ${email})` : `(sent to ${phone})`}
                        </p>
                        <Input
                          id="mobile-verification-code"
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
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};
