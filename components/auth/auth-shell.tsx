import Link from "next/link";
import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import { Motif } from "@/components/motifs/motifs";

export function AuthShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col overflow-hidden bg-leaf-soft p-12 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative size-11 overflow-hidden rounded-full bg-white"><Image src="/images/logo.png" alt="" fill sizes="44px" className="object-contain p-0.5" /></span>
          <span className="text-lg font-semibold">WOPCAA</span>
        </Link>
        <div className="relative mt-10 flex-1"><Motif kind="peace" className="absolute inset-0 size-full" /></div>
        <p className="t-h2 max-w-[18ch]">A safe place to be heard, and a team ready to help.</p>
      </div>
      <div className="flex flex-col bg-mist px-6 py-10 md:px-16">
        <Link href="/" className="link w-fit text-sm">Back to the website</Link>
        <div className="mx-auto my-auto w-full max-w-md py-12">
          <h1 className="t-h1">{title}</h1>
          <p className="mt-3 text-slate">{intro}</p>
          <div className="mt-10">
            <Suspense fallback={<div className="h-80 animate-pulse rounded-[20px] bg-mist-deep" />}>{children}</Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
