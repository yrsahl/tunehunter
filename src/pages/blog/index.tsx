import { blogPosts } from "@/data/blog";
import { BookOpen } from "lucide-react";
import { type NextPage } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const BlogIndex: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Blog – TuneHunter"
        description="Guides and comparisons for music buyers and DJs. Find the cheapest store for any track, learn about FLAC formats, and get more from your music budget."
        canonical="https://tunehunter.app/blog"
        openGraph={{
          url: "https://tunehunter.app/blog",
          title: "Blog – TuneHunter",
          description:
            "Guides and comparisons for music buyers and DJs. Find the cheapest store for any track, learn about FLAC formats, and get more from your music budget.",
        }}
      />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-4 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-wide md:text-3xl">Blog</h1>
          </div>
          <p className="text-sm text-foreground/60 md:text-base">
            Guides and comparisons for DJs and music buyers.
          </p>
        </div>

        {/* Post list */}
        <div className="flex flex-col gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 rounded-lg border border-foreground/10 p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <h2 className="text-base font-bold leading-snug group-hover:text-primary md:text-lg">
                {post.title}
              </h2>
              <p className="text-sm text-foreground/60 md:text-base">{post.description}</p>
              <div className="flex items-center gap-3 text-xs text-foreground/40">
                <span>{formatDate(post.publishedAt)}</span>
                <span>·</span>
                <span>{post.readingTimeMinutes} min read</span>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-4 self-start text-sm text-primary underline underline-offset-4 md:text-base"
        >
          ← Back to TuneHunter
        </Link>
      </div>
    </>
  );
};

export default BlogIndex;
