import { Button, CopyToClipboard } from "@repo/ui/components";
import { CopyIcon } from "@repo/ui/icons";
import { Image } from "components/image";
import { Asset } from "earn/generated/gql/graphql";

export const AssetRow = ({ asset }: { asset?: Asset }) => {
  return (
    <div className="flex items-center space-x-2 overflow-hidden">
      <Image
        src={asset?.logoURI}
        alt={asset?.symbol}
        width={16}
        height={16}
        className="rounded-full"
      />
      <span className="truncate">{asset?.symbol ?? "-"}</span>
      <CopyToClipboard content="Copy Address" value={asset?.symbol ?? ""}>
        <Button
          variant="ghost"
          size="sm"
          className="text-icon-subdued h-auto py-0"
        >
          <CopyIcon className="w-4 h-4 shrink-0" />
        </Button>
      </CopyToClipboard>
    </div>
  );
};
