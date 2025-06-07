import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openModal, setOpenModal] = useState(null);
  const [heartClicked, setHeartClicked] = useState(0);
  const [showCredits, setShowCredits] = useState(false);

  // Cargar Anime.js desde CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
    script.onload = () => console.log('Anime.js loaded');
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Animación cuando se muestra el modal de créditos
  useEffect(() => {
    if (showCredits && window.anime) {
      anime({
        targets: '.credit-item',
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 1000,
        delay: anime.stagger(200),
        easing: 'spring(1, 80, 10, 0)'
      });
    }
  }, [showCredits]);

  const handleHeartClick = () => {
    setHeartClicked(prev => prev + 1);
    
    if (heartClicked >= 4) { // 5 clicks para activar (0-4)
      setShowCredits(true);
      setHeartClicked(0);
      
      // Animación del corazón
      if (window.anime) {
        anime({
          targets: '#secret-heart',
          scale: [1, 1.5, 1],
          rotate: ['0deg', '360deg'],
          duration: 1000,
          easing: 'easeInOutQuad'
        });
      }
    } else if (window.anime) {
      // Pequeña animación con cada click
      anime({
        targets: '#secret-heart',
        scale: [1, 1.3, 1],
        duration: 300,
        easing: 'easeInOutQuad'
      });
    }
  };

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
    ),
    credits: (
    <div className="space-y-6 text-center">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
        Equipo de Desarrollo
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Un esfuerzo colaborativo para crear la mejor experiencia
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="credit-item bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="text-red-500 font-medium">Aiza Arce Jhoel Gustavo</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Diseño de interfaz y experiencia de usuario
          </div>
          <div className="text-xs text-yellow-500 mt-2">
            ★★★★☆ Frontend y UI/UX
          </div>
        </div>
        
        <div className="credit-item bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="text-blue-500 font-medium">Adhemar</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Estructura de datos y modelado de información
          </div>
          <div className="text-xs text-yellow-500 mt-2">
            ★★★★☆ Base de datos
          </div>
        </div>
        
        <div className="credit-item bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="text-green-500 font-medium">Fernando</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Implementación y despliegue en producción
          </div>
          <div className="text-xs text-yellow-500 mt-2">
            ★★★★☆ Deployment
          </div>
        </div>
        
        <div className="credit-item bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="text-yellow-500 font-medium">Daniel</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Lógica del sistema y desarrollo backend
          </div>
          <div className="text-xs text-yellow-500 mt-2">
            ★★★★☆ Backend
          </div>
        </div>
        
        <div className="credit-item bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="text-purple-500 font-medium">Butron</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Control de calidad y testing
          </div>
          <div className="text-xs text-yellow-500 mt-2">
            ★★★★☆ QA
          </div>
        </div>
        
        <div className="credit-item bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="text-pink-500 font-medium">Juan Pablo</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Soporte en pruebas y documentación
          </div>
          <div className="text-xs text-yellow-500 mt-2">
            ★★★☆☆ QA Support
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mt-4 animate-pulse">
        Gracias por descubrir nuestro equipo - WildFire
      </div>
    </div>
  )
};

  return (
    <footer id="footer-contact-section" className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 transition-colors duration-300">
      {/* Modal de políticas y términos */}
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

      {/* Modal de créditos */}
      {showCredits && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            {/* Efecto de partículas */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-red-500 opacity-20"
                  style={{
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`
                  }}
                />
              ))}
            </div>
            
            <button 
              onClick={() => setShowCredits(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            
            {modalContent.credits}
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

          {/* Sección Legal */}
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

        {/* Copyright con Easter Egg */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 dark:text-gray-400 text-xs text-center md:text-left">
            © {currentYear} Universidad Mayor de San Simón - Olimpiadas de Ciencia y Tecnología. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs flex items-center">
            Desarrollado con 
            <span 
              id="secret-heart"
              onClick={handleHeartClick}
              className="mx-1 cursor-pointer transition-all duration-300 hover:scale-125"
              style={{ 
                display: 'inline-block',
                transform: heartClicked > 0 ? 'rotate(10deg)' : 'none' 
              }}
            >
              {heartClicked > 2 ? '💥' : heartClicked > 1 ? '💝' : '❤️'}
            </span> 
            por WildFire
          </p>
        </div>
      </div>

      {/* Estilos para las animaciones */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </footer>
  );
}