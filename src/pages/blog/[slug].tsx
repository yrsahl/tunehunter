import { blogPosts, getBlogPost } from "@/data/blog";
import { type ContentBlock } from "@/data/blog/types";
import { type GetStaticPaths, type GetStaticProps, type NextPage } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";

interface Props {
  post: {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    readingTimeMinutes: number;
    content: ContentBlock[];
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={index}
          className="text-base font-bold uppercase tracking-widest text-primary md:text-lg"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="text-sm font-bold text-foreground/80 md:text-base">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p
          key={index}
          className="text-sm leading-relaxed text-foreground/70 md:text-base"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    case "ul":
      return (
        <ul key={index} className="flex flex-col gap-2 pl-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/70 md:text-base">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary md:mt-[9px]" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div key={index} className="overflow-x-auto rounded-lg border border-foreground/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10 bg-foreground/5">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-foreground/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-foreground/5 last:border-0 odd:bg-foreground/[0.02]"
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-foreground/70">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <div
          key={index}
          className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground/80 md:text-base"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    case "cta":
      return (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/10 px-5 py-4"
        >
          <p className="text-sm text-foreground/70 md:text-base">{block.text}</p>
          <Link
            href={block.linkHref}
            className="self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {block.linkText} →
          </Link>
        </div>
      );
  }
}

const BlogPost: NextPage<Props> = ({ post }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "TuneHunter",
      url: "https://tunehunter.app",
    },
  };

  return (
    <>
      <NextSeo
        title={`${post.title} – TuneHunter`}
        description={post.description}
        canonical={`https://tunehunter.app/blog/${post.slug}`}
        openGraph={{
          url: `https://tunehunter.app/blog/${post.slug}`,
          title: `${post.title} – TuneHunter`,
          description: post.description,
          type: "article",
          article: {
            publishedTime: post.publishedAt,
          },
        }}
      />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-4 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Article header */}
        <div className="flex flex-col gap-3">
          <Link
            href="/blog"
            className="self-start text-xs text-foreground/40 underline underline-offset-4 hover:text-foreground/60"
          >
            ← Blog
          </Link>
          <h1 className="text-xl font-bold leading-snug tracking-wide md:text-2xl">{post.title}</h1>
          <div className="flex items-center gap-3 text-xs text-foreground/40">
            <span>{formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{post.readingTimeMinutes} min read</span>
          </div>
        </div>

        {/* Article body */}
        <div className="flex flex-col gap-5">
          {post.content.map((block, i) => renderBlock(block, i))}
        </div>

        {/* Footer nav */}
        <div className="flex flex-col gap-2 border-t border-foreground/10 pt-6">
          <Link
            href="/blog"
            className="self-start text-sm text-primary underline underline-offset-4 md:text-base"
          >
            ← Back to Blog
          </Link>
          <Link
            href="/"
            className="self-start text-sm text-foreground/40 underline underline-offset-4 hover:text-foreground/60 md:text-base"
          >
            Back to TuneHunter
          </Link>
        </div>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: blogPosts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const slug = params?.slug as string;
  const post = getBlogPost(slug);
  if (!post) return { notFound: true };
  return { props: { post } };
};

export default BlogPost;
