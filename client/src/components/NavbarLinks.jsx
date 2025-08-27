import { Link, useLocation } from "react-router-dom"

const NavbarLinks = () => {
  const location = useLocation()
  const currentPath = location.pathname

  const links = [
    { name: "Home", path: "/" },
    { name: "Agents", path: "/agents" },
    { name: "Projects", path: "/projects" },
  ]

  return (
    <div className="flex flex-row gap-8">
      {links.map((link) => {
        const isActive = currentPath === link.path
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`relative font-semibold text-gray-700 transition-colors 
              hover:text-primary
              ${isActive ? "text-primary" : ""}`}
          >
            {link.name}
            {isActive && (
              <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-primary rounded-full"></span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default NavbarLinks
