import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export default function Loading() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <div className="skeleton h-3 w-32 rounded" />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="flex flex-col gap-3">
            <div className="skeleton aspect-[16/10] w-full rounded-2xl" />
            <div className="flex gap-2">
              <div className="skeleton h-16 w-24 rounded-md" />
              <div className="skeleton h-16 w-24 rounded-md" />
              <div className="skeleton h-16 w-24 rounded-md" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-8 w-8 rounded-full" />
              </div>
              <div className="skeleton h-9 w-3/4 rounded" />
              <div className="mt-4 flex gap-5">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>

            <div className="skeleton h-12 w-full rounded-md" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
