"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Menu, X } from "lucide-react"

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navRef = useRef(null)

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }

    // Cerrar al hacer scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      setActiveDropdown(null)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu)
  }

  const menuItems = [
    { name: "Inicio", hasDropdown: false, link: "#" },
    {
      name: "Inscripción",
      hasDropdown: true,
      dropdownItems: ["Individual", "Grupal", "Institucional"],
    },
    {
      name: "Pagos",
      hasDropdown: true,
      dropdownItems: ["Verificar Pago", "Historial", "Métodos"],
    },
    {
      name: "Reportes",
      hasDropdown: true,
      dropdownItems: ["Resultados", "Estadísticas", "Certificados"],
    },
    { name: "Contacto", hasDropdown: false, link: "#" },
  ]

  return (
    <div ref={navRef}>
      {/* Navbar Desktop */}
      <nav className={`hidden md:block bg-white border-b border-gray-200 sticky top-16 z-40 transition-all ${isScrolled ? 'shadow-sm' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(index)}
                      onMouseEnter={() => setActiveDropdown(index)}
                      className={`px-5 py-4 flex items-center font-medium hover:text-red-600 transition-colors ${
                        activeDropdown === index ? 'text-red-600' : 'text-gray-800'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                        activeDropdown === index ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {activeDropdown === index && (
                      <div 
                        className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-56 bg-white shadow-lg rounded-b-md z-50 border border-gray-100"
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {item.dropdownItems.map((dropdownItem, dropIndex) => (
                          <a
                            key={dropIndex}
                            href="#"
                            className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {dropdownItem}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.link}
                    className="px-5 py-4 flex items-center font-medium text-gray-800 hover:text-red-600 transition-colors"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-16 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-4 w-full flex justify-between items-center"
        >
          <span className="font-medium text-gray-800">Menú</span>
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-500" />
          ) : (
            <Menu className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {isMobileMenuOpen && (
          <div className="container mx-auto px-4">
            {menuItems.map((item, index) => (
              <div key={index} className="border-t border-gray-100">
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={`w-full px-4 py-3 flex justify-between items-center ${
                        activeDropdown === index ? 'text-red-600' : 'text-gray-800'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          activeDropdown === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {activeDropdown === index && (
                      <div className="pl-6 pb-2">
                        {item.dropdownItems.map((dropdownItem, dropIndex) => (
                          <a
                            key={dropIndex}
                            href="#"
                            className="block px-4 py-2 text-gray-600 hover:text-red-600"
                            onClick={() => {
                              setActiveDropdown(null)
                              setIsMobileMenuOpen(false)
                            }}
                          >
                            {dropdownItem}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={item.link}
                    className="block px-4 py-3 text-gray-800 hover:text-red-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}