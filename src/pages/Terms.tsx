import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 pt-32 pb-20">
        <h1 className="text-4xl font-heading font-bold mb-2">Términos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: abril de 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Aceptación de los términos</h2>
            <p>
              Al acceder o usar Orion Builder, aceptas quedar vinculado por estos Términos de Uso. Si no
              estás de acuerdo con alguna parte de los términos, no podrás acceder al servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Uso del servicio</h2>
            <p>Orion Builder te otorga una licencia limitada, no exclusiva e intransferible para usar la plataforma.
              Te comprometes a no:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Usar el servicio para actividades ilegales o no autorizadas.</li>
              <li>Intentar acceder a sistemas o datos que no te corresponden.</li>
              <li>Distribuir malware, spam o contenido dañino.</li>
              <li>Revender o sublicenciar el acceso a la plataforma sin autorización expresa.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Cuentas de usuario</h2>
            <p>
              Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades
              realizadas bajo tu cuenta. Notifícanos de inmediato ante cualquier uso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Propiedad intelectual</h2>
            <p>
              El código, diseño y contenido generado por ti mediante la plataforma es de tu propiedad.
              Orion Builder retiene todos los derechos sobre la plataforma en sí, incluyendo su interfaz,
              motor de IA y tecnología subyacente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Limitación de responsabilidad</h2>
            <p>
              Orion Builder se proporciona "tal cual". No garantizamos disponibilidad ininterrumpida ni
              ausencia de errores. En ningún caso seremos responsables por daños indirectos, incidentales
              o consecuentes derivados del uso del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Terminación</h2>
            <p>
              Podemos suspender o cancelar tu acceso al servicio en cualquier momento si incumples estos
              términos. Tú puedes cancelar tu cuenta en cualquier momento desde la configuración.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Cambios a los términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
              entrarán en vigor al publicarse en la plataforma. Tu uso continuado constituye aceptación.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
