import { parseDescription } from "@/lib/description";
import { CheckIcon } from "./icons";

export function DescriptionSections({ description }: { description: string | null }) {
  const sections = parseDescription(description);
  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, index) => (
        <div key={index}>
          <h3 className="mb-3 font-display text-lg font-semibold text-site-ink">
            {section.heading ?? "Sobre esta propiedad"}
          </h3>
          <div className="flex flex-col gap-2">
            {section.blocks.map((block, blockIndex) =>
              block.kind === "p" ? (
                <p key={blockIndex} className="max-w-prose text-sm leading-relaxed text-stone-700">
                  {block.text}
                </p>
              ) : (
                <ul key={blockIndex} className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-relaxed text-stone-700"
                    >
                      <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-site-terracotta" />
                      {item}
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
