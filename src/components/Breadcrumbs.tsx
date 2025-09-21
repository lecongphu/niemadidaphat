import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {item.href ? (
              <Link className="hover:underline" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800">{item.label}</span>
            )}
            {i < items.length - 1 && <span className="text-gray-400">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}


