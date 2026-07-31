import { GitFork } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Built for better questions, not certain answers. ©{" "}
        {new Date().getFullYear()}
      </p>
      <Link
        href="https://github.com/qbzenker/startupequitycalculator"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitFork aria-hidden="true" />
        View the model on GitHub
      </Link>
    </footer>
  );
}
