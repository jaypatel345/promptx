import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed h-screen">
      <ul className="  translate-y-[75%]  flex flex-col md:pl-6 gap-4 text-[14px] font-medium pl-3 bg-amber-800 w-fit  ">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/enhancer">Prompt Enhancer</Link>
        </li>
        <li>
          <Link href="/templates">Prompt Templates</Link>
        </li>
        <li>
          <Link href="/guides">Prompt Engineering Guides</Link>
        </li>
        <li>
          <Link href="/tools">AI Tools</Link>
        </li>
        <li>
          <Link href="/learn">Learn</Link>
        </li>
        <li>
          <Link href="/pricing">Pricing</Link>
        </li>
        <li>
          <Link href="/teams">For Teams</Link>
        </li>
      </ul>
    </nav>
  );
}
