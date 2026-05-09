import { Zap, Phone, Mail, MapPin, Github, GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              QuickSeva
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's trusted local service marketplace. Find verified providers near you — fast, easy, reliable.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/login", label: "Login" },
                { href: "/signup", label: "Sign Up" },
                { href: "/provider-signup", label: "Register as Provider" },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-white transition-colors hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2026 QuickSeva. Built with ❤️ in India.</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>Developed by <span className="text-blue-400 font-medium">Misha Kumari</span>, CSE 3rd Year</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
