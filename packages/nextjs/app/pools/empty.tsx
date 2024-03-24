import { InboxIcon } from "lucide-react";

export default function Empty() {
  return (
    <div className="flex flex-col items-center text-center font-mediuml">
      <InboxIcon className="w-12 h-12 mt-8 mb-4" />
      <div className="mb-8">您的流动性仓位将在此展示。</div>
    </div>
  )
}
