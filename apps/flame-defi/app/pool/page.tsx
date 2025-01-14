import { ActionButton } from "@repo/ui/components";
import { InboxIcon, PlusIcon } from "@repo/ui/icons";
import type React from "react";

export default function PoolPage(): React.ReactElement {

	return (
		<section className="min-h-[calc(100vh-85px-96px)] flex flex-col mt-[100px]">
			<div className="max-w-[800px] w-full mx-auto rounded-2xl p-4 sm:p-4 md:p-8 lg:p-12 border border-solid border-transparent bg-radial-dark shadow-[inset_1px_1px_1px_-1px_hsla(0,0%,100%,0.5)]">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Pools</h2>
					<ActionButton buttonText="New Position" className="mt-0" PrefixIcon={PlusIcon}></ActionButton>
				</div>
				<div className="flex flex-col bg-grey-dark w-full rounded-2xl h-[250px]">
					<div className="flex flex-col items-center justify-center h-full">
						<InboxIcon size={50} className="mb-2"/>
						<p className="mb-10">Your active V3 liquidity positions will appear here.</p>
						<ActionButton buttonText="Connect Wallet" className="mt-0"/>
					</div>
				</div>
			</div>
		</section>
	);
}
