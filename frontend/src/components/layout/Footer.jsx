import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, X } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openModal, setOpenModal] = useState(null);

  const footerData = {
    logo: {
      title: "Olimpiadas San Simón",
      description: "Olimpiadas en Ciencias y Tecnología San Simón - Ohi SanSi. Un espacio de competencia para estudiantes de educación regular en ocho áreas de competencia.",
      icon: (
        <img 
          src="/ohsansi.jpg" 
          alt="Logo Olimpiadas San Simón" 
          className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" 
        />
      )
    },
    contact: {
      title: "Contacto",
      items: [
        { icon: <MapPin className="h-5 w-5 text-red-600 dark:text-red-500"/>, text: "Universidad Mayor de San Simón, Cochabamba, Bolivia" },
        { icon: <Phone className="h-5 w-5 text-red-600 dark:text-red-500"/>, text: "+591 4 4525252" },
        { icon: <Mail className="h-5 w-5 text-red-600 dark:text-red-500"/>, text: "olimpiadas@umss.edu.bo" }
      ]
    },
    social: [
      { icon: <Facebook className="h-5 w-5"/>, label: "Facebook", url: "https://facebook.com" },
      { icon: <Twitter className="h-5 w-5"/>, label: "Twitter", url: "https://twitter.com" },
      { icon: <Instagram className="h-5 w-5"/>, label: "Instagram", url: "https://instagram.com" }
    ]
  };

  const modalContent = {
    privacy: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Políticas de Privacidad</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Respetamos tu privacidad. Los datos personales recopilados solo se usan para:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>Gestionar tu participación en las olimpiadas</li>
          <li>Enviar información relevante sobre el evento</li>
          <li>Mejorar nuestros servicios educativos</li>
        </ul>
      </div>
    ),
    terms: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Términos de Uso</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Al participar en las olimpiadas aceptas:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>Respetar el código de conducta académica</li>
          <li>No compartir material protegido por derechos de autor</li>
          <li>Cumplir con los plazos establecidos</li>
        </ul>
      </div>
    )
  };

  return (
  <footer 
  id="footer-contact-section" 
  className="...tus-clases..."
>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setOpenModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            {modalContent[openModal]}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpenModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setOpenModal(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Sección Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {footerData.logo.icon}
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{footerData.logo.title}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {footerData.logo.description}
            </p>
            
            <div className="flex gap-4 pt-2">
              {footerData.social.map((social, index) => (
                <a 
                  key={index} 
                  href={social.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Sección Contacto */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{footerData.contact.title}</h3>
            <ul className="space-y-3">
              {footerData.contact.items.map((item, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <span className="shrink-0 mt-0.5">{item.icon}</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sección Legal (placeholder) */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Información Legal</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setOpenModal('privacy')}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 text-sm transition-colors text-left"
                >
                  Políticas de Privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={() => setOpenModal('terms')}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 text-sm transition-colors text-left"
                >
                  Términos de Uso
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 dark:text-gray-400 text-xs text-center md:text-left">
            © {currentYear} Universidad Mayor de San Simón - Olimpiadas de Ciencia y Tecnología. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Desarrollado con ❤️ por WildFire
          </p>
        </div>
      </div>
    </footer>
  );
}