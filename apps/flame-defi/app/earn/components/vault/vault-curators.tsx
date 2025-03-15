import { Badge, BadgeProps } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { Image } from "components/image";
import { VaultMetadataCurator } from "earn/generated/gql/graphql";

interface VaultCuratorsProps extends BadgeProps {
  curators?: Pick<VaultMetadataCurator, "name" | "image">[];
}

export const VaultCurators = ({
  curators,
  className,
  ...props
}: VaultCuratorsProps) => {
  return curators?.map((it, index) => (
    <Badge
      key={`curator_${index}`}
      variant="secondary"
      className={cn("flex items-center space-x-2", className)}
      {...props}
    >
      <Image
        src={it.image}
        alt={it.name}
        width={16}
        height={16}
        className="rounded-full"
      />
      <span>{it.name}</span>
    </Badge>
  ));
};
