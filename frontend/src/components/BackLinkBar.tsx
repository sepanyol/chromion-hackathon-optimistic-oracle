import { ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import Link from "next/link";

type BackLinkBarProps = { href: string };

export const BackLinkBar = ({ href }: BackLinkBarProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-start py-4">
      <span>
        <Link href={href}>
          <Button className="flex gap-2 from-gray-200! to-gray-200! hover:from-gray-300! hover:to-gray-300! border border-gray-300 text-gray-500! cursor-pointer">
            <ArrowLeft className="size-4" /> <span>Back</span>
          </Button>
        </Link>
      </span>
    </div>
  );
};
