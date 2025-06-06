import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ onOpenComprobantePago }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay un usuario logueado al cargar
    checkAuthStatus();
    
    // Escuchar cambios en el estado de autenticación
    window.addEventListener('user-change', checkAuthStatus);

    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      setActiveDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('user-change', checkAuthStatus);
    };
  }, []);

  const checkAuthStatus = () => {
    const user = localStorage.getItem("user");
    setIsAdmin(!!user); // Convierte a booleano
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const scrollToFooterContact = () => {
    const footerElement = document.getElementById('footer-contact-section');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  // Menú base para todos los usuarios
  const baseMenuItems = [
    { name: "Inicio", hasDropdown: false, link: "/" },
    {
      name: "Inscripción",
      hasDropdown: true,
      dropdownItems: [
        { name: "Individual", link: "/student-registration" },
        { name: "Grupal", link: "/group-registration" }
      ],
    },
    {
      name: "Contacto",
      hasDropdown: false,
      action: scrollToFooterContact
    },
  ];

  // Menú solo para administradores
  const adminMenuItems = [
    {
      name: "Gestión de Áreas",
      hasDropdown: true,
      dropdownItems: [
        { name: "Registrar nueva área", link: "/register" },
        { name: "Ver listado de áreas", link: "/areas" },
        { name: "Editar área de prueba", link: "/editar-area/1" },
      ],
    },
    {
      name: "Pagos",
      hasDropdown: true,
      dropdownItems: [
        {
          name: "Subir comprobante",
          action: () => {
            if (onOpenComprobantePago) {
              onOpenComprobantePago();
            }
            setActiveDropdown(null);
          }
        },
      ],
    },
    {
      name: "Reportes",
      hasDropdown: true,
      dropdownItems: [
        { name: "Postulaciones", link: "/student-applications" },
        {
          name: "Reportes Varios",
          action: () => handleNavigation("/reportes")
        },
      ],
    },
  ];

  // Combinar menús según el estado de autenticación
  const menuItems = isAdmin ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems;

  return (
    <div ref={navRef}>
      {/* Navbar Desktop */}
      <nav
        className={`hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40 transition-all ${isScrolled ? "shadow-sm dark:shadow-gray-900" : ""}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            {menuItems.map((item, index) => (
              <div key={index} className="relative">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={`px-5 py-4 flex items-center font-medium hover:text-red-600 dark:hover:text-red-500 transition-colors ${activeDropdown === index ? "text-red-600 dark:text-red-500" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      {item.name}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === index ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === index && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-56 bg-white dark:bg-gray-700 shadow-lg rounded-b-md z-50 border border-gray-100 dark:border-gray-600">
                        {item.dropdownItems.map((dropdownItem, dropIndex) => (
                          dropdownItem.link ? (
                            <Link
                              key={dropIndex}
                              to={dropdownItem.link}
                              className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-600 hover:text-red-600 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {dropdownItem.name}
                            </Link>
                          ) : (
                            <button
                              key={dropIndex}
                              onClick={dropdownItem.action}
                              className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-600 hover:text-red-600 transition-colors"
                            >
                              {dropdownItem.name}
                            </button>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  item.link ? (
                    <Link
                      to={item.link}
                      className="px-5 py-4 flex items-center font-medium text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="px-5 py-4 flex items-center font-medium text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                    >
                      {item.name}
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-4 w-full flex justify-between items-center"
        >
          <span className="font-medium text-gray-800 dark:text-gray-200">Menú</span>
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {isMobileMenuOpen && (
          <div className="container mx-auto px-4">
            {menuItems.map((item, index) => (
              <div key={index} className="border-t border-gray-100 dark:border-gray-700">
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={`w-full px-4 py-3 flex justify-between items-center ${activeDropdown === index ? "text-red-600 dark:text-red-500" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === index ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === index && (
                      <div className="pl-6 pb-2">
                        {item.dropdownItems.map((dropdownItem, dropIndex) => (
                          dropdownItem.link ? (
                            <Link
                              key={dropIndex}
                              to={dropdownItem.link}
                              className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600"
                              onClick={() => {
                                setActiveDropdown(null);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              {dropdownItem.name}
                            </Link>
                          ) : (
                            <button
                              key={dropIndex}
                              onClick={() => {
                                dropdownItem.action();
                                setIsMobileMenuOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600"
                            >
                              {dropdownItem.name}
                            </button>
                          )
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  item.link ? (
                    <Link
                      to={item.link}
                      className="block px-4 py-3 text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        if (item.action) item.action();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-500"
                    >
                      {item.name}
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}