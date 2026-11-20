import Link from "next/link";
import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import { LazyScene } from "@/components/three/lazy-scene";

export function AuthShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="on-dark grain relative isolate hidden overflow-hidden bg-forest-950 p-12 text-sand-50 lg:flex lg:flex-col">
        <LazyScene variant="field" className="absolute inset-0 -z-10" />
        <Link href="/" className="flex items-center gap-3">
          <span className="relative size-11 overflow-hidden rounded-full bg-white"><Image src="/images/logo.png" alt="" fill sizes="44px" className="object-contain p-0.5" /></span>
          <span className="font-display text-xl">WOPCAA</span>
        </Link>
        <p className="display mt-auto max-w-lg text-[3.4rem]">A safe place to be <em>heard</em>, and a team ready to help.</p>
        <p className="kicker mt-8 text-sand-300/60">Women · Peace · Climate · Justice</p>
      </div>
      <div className="flex flex-col bg-sand-50 px-6 py-10 md:px-16">
        <Link href="/" className="kicker text-ink-500 hover:text-ink-900">← Back to the website</Link>
        <div className="mx-auto my-auto w-full max-w-md py-12">
          <h1 className="display text-[2.8rem]">{title}</h1>
          <p className="mt-3 text-ink-500">{intro}</p>
          <div className="mt-10">
            <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-sand-100" />}>{children}</Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
