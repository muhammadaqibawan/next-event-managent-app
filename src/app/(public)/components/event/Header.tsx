import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function Header() {
  return (
    <header className="mb-12 text-center max-w-3xl">
      <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-4">
        Discover <span className="text-yellow-300">Awesome</span> Events
      </h1>
      <p className="text-lg text-purple-100 mb-6">
        Join the community and explore what’s happening near you.
      </p>

      <Link
        href={ROUTES.LOGIN}
        className="inline-block bg-white/20 backdrop-blur-md rounded-full px-6 py-3 shadow-lg hover:bg-white/30 transition duration-500 text-white text-lg font-semibold relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
        aria-label="Login to manage your own events"
      >
        Login to manage your own events
        <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-yellow-300 absolute bottom-0 left-0" />
      </Link>
    </header>
  );
}
