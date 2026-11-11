import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-[80svh] max-w-[96rem] flex-col justify-center px-5 pt-28 sm:px-8 lg:px-12">
      <p className="type-label text-haze">404</p>
      <h1 className="type-headline mt-6 max-w-3xl text-ink">
        This pathway <span className="text-jade">doesn&rsquo;t connect.</span>
      </h1>
      <p className="type-lede mt-6 max-w-xl text-mist">The page you were looking for has moved or never existed.</p>
      <div className="mt-10">
        <Link href="/" className="btn btn-ghost">
          Return home
        </Link>
      </div>
    </main>
  );
}
