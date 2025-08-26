import { Link, useLocation } from "react-router-dom"

const NavbarLinks = () => {
  const location = useLocation()
  const currentPath = location.pathname

  const links = [
    { name: "Homes", path: "/" },
    { name: "Agents", path: "/agents" },
    { name: "Projects", path: "/projects" },
  ]

  return (
<div className="hidden md:flex flex-row mb-5 gap-15">
        {links.map((link) => {
              const isActive = currentPath === link.path
              return (
             <Link
        key={link.path}
        to={link.path}
        className={`relative text-gray-700 transition-colors 
          hover:text-black ${isActive ? "text-black" : ""}`}
      >
        <span className="inline-block px-1">{link.name}</span>
        {isActive && (
          <span className="absolute left-[-6px] -bottom-1 w-[calc(100%+15px)] h-[3px] bg-black rounded-full"></span>
        )}
      </Link>
        )
      })}
    </div>
  )
}

export default NavbarLinks
