import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 pt-32 pb-20">
        <h1 className="text-4xl font-heading font-bold mb-2">Política de Cookies</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: abril de 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas
              un sitio web. Se utilizan ampliamente para que los sitios funcionen correctamente, de manera
              más eficiente, y para proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Cookies que usamos</h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground mb-1">Esenciales</h3>
                <p className="text-sm">
                  Necesarias para el funcionamiento básico de la plataforma: gestión de sesión,
                  autenticación y seguridad. No pueden desactivarse.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground mb-1">Funcionales</h3>
                <p className="text-sm">
                  Recuerdan tus preferencias como el tema de color, idioma y configuración del editor,
                  para ofrecerte una experiencia personalizada.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground mb-1">Analíticas</h3>
                <p className="text-sm">
                  Nos ayudan a entender cómo los usuarios interactúan con la plataforma para mejorar
                  nuestros servicios. Los datos se recopilan de forma anónima y agregada.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Control de cookies</h2>
            <p>
              Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando
              se envíe una cookie. Ten en cuenta que algunas funciones de la plataforma pueden no
              funcionar correctamente si deshabilitas las cookies esenciales.
            </p>
            <p className="mt-2">
              La mayoría de los navegadores permiten gestionar las cookies desde sus ajustes de privacidad
              o seguridad. Consulta la documentación de tu navegador para más información.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Cookies de terceros</h2>
            <p>
              Algunos de nuestros proveedores de servicios pueden establecer sus propias cookies en tu
              dispositivo. No controlamos estas cookies y te recomendamos revisar las políticas de
              privacidad de dichos terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contacto</h2>
            <p>
              Si tienes preguntas sobre nuestra política de cookies, escríbenos a{" "}
              <span className="text-primary">privacidad@orionbuilder.app</span>.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;
