import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerData = {
    logo: {
      title: "Olimpiadas San Simón",
      description: "Olimpiadas en Ciencias y Tecnología San Simón - Ohi SanSi. Un espacio de competencia para estudiantes de educación regular en ocho áreas de competencia.",
      icon: (
        <img src="/ohsansi.jpg" alt="Logo Olimpiadas San Simón" className="h-10 w-10" />
      )
    },
    links: [
      {
        title: "Enlaces Rápidos",
        items: ["Inicio", "Inscripción", "Pagos", "Reportes", "Contacto"]
      },
      {
        title: "Áreas de Competencia",
        items: ["Matemática", "Física", "Química", "Informática", "Biología"]
      }
    ],
    contact: {
      title: "Contacto",
      items: [
        { icon: <MapPin className="h-5 w-5"/>, text: "Universidad Mayor de San Simón, Cochabamba, Bolivia" },
        { icon: <Phone className="h-5 w-5"/>, text: "+591 4 4525252" },
        { icon: <Mail className="h-5 w-5"/>, text: "olimpiadas@umss.edu.bo" }
      ]
    },
    social: [
      { icon: <Facebook className="h-5 w-5"/>, label: "Facebook", url: "#" },
      { icon: <Twitter className="h-5 w-5"/>, label: "Twitter", url: "#" },
      { icon: <Instagram className="h-5 w-5"/>, label: "Instagram", url: "#" }
    ]
  }

  return (
    <footer id="footer-contact-section" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div>
                {footerData.logo.icon}
              </div>
              <h2 className="text-xl font-bold dark:text-white">{footerData.logo.title}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{footerData.logo.description}</p>
            
            {/* Redes sociales */}
            <div className="flex gap-4 pt-2">
              {footerData.social.map((social, index) => (
                <a 
                  key={index} 
                  href={social.url} 
                  aria-label={social.label}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columnas de enlaces */}
          {footerData.links.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg dark:text-white">{footerData.contact.title}</h3>
            <ul className="space-y-3">
              {footerData.contact.items.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-red-600 dark:text-red-500 mt-0.5">{item.icon}</span>
                  <span className="text-gray-600 dark:text-gray-300">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
            © {currentYear} Universidad Mayor de San Simón - Olimpiadas de Ciencia y Tecnología. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-red-600 text-sm transition-colors">
              Políticas de Privacidad
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-red-600 text-sm transition-colors">
              Términos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}