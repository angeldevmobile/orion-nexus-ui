import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 pt-32 pb-20">
        <h1 className="text-4xl font-heading font-bold mb-2">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: abril de 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Información que recopilamos</h2>
            <p>
              Recopilamos información que nos proporcionas directamente al crear una cuenta, usar nuestros servicios
              o comunicarte con nosotros. Esto incluye: nombre de usuario, dirección de correo electrónico,
              contraseña (cifrada), y cualquier contenido que generes o subas en la plataforma.
            </p>
            <p className="mt-2">
              También recopilamos automáticamente ciertos datos técnicos como dirección IP, tipo de navegador,
              páginas visitadas y duración de la sesión, con el fin de mejorar el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Cómo usamos tu información</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Proporcionar, operar y mantener la plataforma Orion Builder.</li>
              <li>Personalizar tu experiencia y mejorar nuestros servicios.</li>
              <li>Enviarte comunicaciones relacionadas con tu cuenta (no spam).</li>
              <li>Detectar y prevenir fraudes o usos no autorizados.</li>
              <li>Cumplir con obligaciones legales aplicables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Compartición de datos</h2>
            <p>
              No vendemos tu información personal a terceros. Podemos compartir datos con proveedores de servicios
              de confianza que nos asisten en la operación de la plataforma (por ejemplo, infraestructura cloud),
              siempre bajo acuerdos de confidencialidad estrictos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y organizativas para proteger tu información, incluyendo cifrado en
              tránsito (TLS) y en reposo. Ningún sistema es 100% seguro, pero trabajamos continuamente para
              mantener los más altos estándares de protección.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Tus derechos</h2>
            <p>
              Tienes derecho a acceder, corregir o eliminar tus datos personales en cualquier momento desde
              la configuración de tu cuenta. Para solicitudes adicionales o dudas, contáctanos en{" "}
              <span className="text-primary">privacidad@orionbuilder.app</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política periódicamente. Te notificaremos de cambios significativos
              por correo electrónico o mediante un aviso en la plataforma. El uso continuado del servicio
              tras los cambios implica tu aceptación.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
