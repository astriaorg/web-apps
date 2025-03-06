import { Badge } from "@repo/ui/components";
import { Image } from "components/image";
import { VaultMetadataCurator } from "earn/gql/graphql";

interface VaultCuratorsProps {
  curators?: Pick<VaultMetadataCurator, "name" | "image">[];
}

export const VaultCurators = ({ curators }: VaultCuratorsProps) => {
  return curators?.map((it, index) => (
    <Badge
      key={`curator_${index}`}
      variant="secondary"
      className="flex items-center space-x-2"
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
