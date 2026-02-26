import Link from "next/link"
import Head from "next/head"

export default function DisclaimerPage() {
  return (
    <>
      <Head>
        <title>Medical Disclaimer &amp; Terms of Service | SafePlate AI</title>
        <meta
          name="description"
          content="Medical disclaimer, terms of service, and liability information for SafePlate AI nutrition and dietary recommendation app."
        />
      </Head>

      <main className="container page-shell legal-page">
        <h1>Medical Disclaimer &amp; Terms of Service</h1>
        <p className="text-muted">Effective date: February 26, 2026</p>

        {/* ── 1. Not Medical Advice ── */}
        <section className="glass-card legal-section">
          <h2>1. Not a Substitute for Professional Medical Advice</h2>
          <p>
            SafePlate AI is a nutrition information and dietary convenience tool.
            It is <strong>not</strong> a medical device, diagnostic service, or
            substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <ul>
            <li>
              The dietary scores, ingredient analyses, allergen flags,
              medication-interaction alerts, and health-condition labels
              (including hypertension-friendly, diabetes-friendly, and
              weight-loss focused indicators) provided by SafePlate AI are
              generated through automated analysis and artificial intelligence.
              They are intended for <strong>general informational purposes
              only</strong>.
            </li>
            <li>
              No information presented in the app should be interpreted as a
              medical recommendation, prescription, or clinical guidance.
            </li>
            <li>
              If you have a medical condition, food allergy, or are taking
              medication, always rely on the guidance of your physician,
              allergist, or other qualified healthcare provider rather than
              information in this app.
            </li>
          </ul>
        </section>

        {/* ── 2. Consult Healthcare Providers ── */}
        <section className="glass-card legal-section">
          <h2>2. Consult Your Healthcare Provider</h2>
          <p>
            You should consult a qualified healthcare provider or registered
            dietitian before:
          </p>
          <ul>
            <li>Making significant changes to your diet or nutrition plan.</li>
            <li>
              Relying on any allergen, ingredient, or nutrition information from
              this app to manage a medical condition such as diabetes,
              hypertension, celiac disease, or food allergies.
            </li>
            <li>
              Using the app&rsquo;s medication-interaction alerts as a basis for
              changing, stopping, or starting any medication or supplement.
            </li>
            <li>
              Adopting restrictive dietary patterns (e.g., low carb, low sugar,
              gluten free) without professional supervision.
            </li>
          </ul>
          <p>
            <strong>In a medical emergency, call your local emergency services
            immediately.</strong> Do not rely on this app for emergency guidance.
          </p>
        </section>

        {/* ── 3. Individual Health Variations ── */}
        <section className="glass-card legal-section">
          <h2>3. Limitations &mdash; Individual Health Variations</h2>
          <p>
            Every person&rsquo;s body, health history, genetics, and nutritional
            needs are unique. SafePlate AI cannot account for all individual
            health variations, including but not limited to:
          </p>
          <ul>
            <li>
              Rare or uncommon allergies and intolerances not covered by our
              standard categories (peanuts, dairy, shellfish, soy, sesame, tree
              nuts, eggs, fish, wheat/gluten, and sulfites).
            </li>
            <li>
              Cross-contamination risks during food manufacturing, preparation,
              or serving.
            </li>
            <li>
              Individual metabolic responses, drug-nutrient interactions, or
              cumulative dietary effects.
            </li>
            <li>
              Variations in product formulations, regional ingredient
              differences, or unlisted sub-ingredients.
            </li>
            <li>
              Pregnancy, breastfeeding, pediatric, or geriatric nutritional
              requirements that demand specialized professional oversight.
            </li>
          </ul>
        </section>

        {/* ── 4. User Responsibility ── */}
        <section className="glass-card legal-section">
          <h2>4. User Responsibility &mdash; Verify Information</h2>
          <p>
            While SafePlate AI strives for accuracy, <strong>you are ultimately
            responsible for verifying</strong> all ingredient information,
            allergen details, nutrition facts, and dietary suitability before
            consuming any food product. Specifically:
          </p>
          <ul>
            <li>
              Always read the physical product label and packaging for the most
              current and complete ingredient and allergen information.
            </li>
            <li>
              Confirm dietary compliance (Halal, Vegetarian, Pescatarian, etc.)
              with the food manufacturer or establishment directly when accuracy
              is critical.
            </li>
            <li>
              Do not assume that a product flagged as &ldquo;safe&rdquo; by the
              app is free from all allergens or suitable for your specific health
              condition.
            </li>
            <li>
              High-risk warnings (high sodium, high sugar, medication
              interactions, and ingredient cautions) are automated alerts and may
              not capture every risk relevant to your situation.
            </li>
          </ul>
        </section>

        {/* ── 5. Health Data Privacy ── */}
        <section className="glass-card legal-section">
          <h2>5. Health Data Privacy &amp; Protection</h2>
          <p>
            We understand that your dietary restrictions, allergy profiles,
            health condition preferences, and scan history constitute sensitive
            personal health information. We are committed to protecting this
            data:
          </p>
          <ul>
            <li>
              <strong>Encryption:</strong> All health and dietary data is
              transmitted over encrypted connections (TLS/SSL) and stored using
              industry-standard encryption at rest.
            </li>
            <li>
              <strong>Access controls:</strong> Your health profile data is
              accessible only to you through your authenticated account. Our
              internal teams access aggregated, anonymized data solely for
              service improvement.
            </li>
            <li>
              <strong>No sale of health data:</strong> We do not sell, rent, or
              trade your personal health information, allergy profiles, or
              dietary preferences to third parties.
            </li>
            <li>
              <strong>Third-party processors:</strong> Where we use service
              providers (hosting, authentication, AI processing), they are
              contractually bound to protect your data and use it only to
              provide our services.
            </li>
            <li>
              <strong>Data deletion:</strong> You may request deletion of your
              account and all associated health data at any time. See
              our{" "}
              <Link href="/account-deletion">Account Deletion</Link> page or
              contact <strong>support@safe-plate.ai</strong>.
            </li>
          </ul>
          <p>
            For full details on data collection and usage, see
            our <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
            <Link href="/data-safety">Data Safety</Link> pages.
          </p>
        </section>

        {/* ── 6. Limitation of Liability ── */}
        <section className="glass-card legal-section">
          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law:
          </p>
          <ul>
            <li>
              SafePlate AI and its operators, affiliates, employees, and
              licensors shall <strong>not be liable</strong> for any direct,
              indirect, incidental, special, consequential, or punitive damages
              arising from your use of or inability to use the app, including
              but not limited to adverse health reactions, allergic events,
              dietary harm, or reliance on any information provided by the
              service.
            </li>
            <li>
              The app is provided on an <strong>&ldquo;as is&rdquo;</strong> and{" "}
              <strong>&ldquo;as available&rdquo;</strong> basis without
              warranties of any kind, whether express or implied, including
              implied warranties of merchantability, fitness for a particular
              purpose, or non-infringement.
            </li>
            <li>
              We do not warrant that the app will be uninterrupted,
              error-free, or that ingredient databases, allergen information,
              or AI-generated analyses will be complete, accurate, or current
              at all times.
            </li>
          </ul>
        </section>

        {/* ── 7. AI-Generated Content ── */}
        <section className="glass-card legal-section">
          <h2>7. AI-Generated Content Disclaimer</h2>
          <p>
            SafePlate AI uses artificial intelligence and machine learning to
            analyze food products, score nutritional value, detect allergens, and
            generate dietary recommendations. AI-generated content:
          </p>
          <ul>
            <li>
              May contain inaccuracies, omissions, or misinterpretations of
              product labels and ingredient lists.
            </li>
            <li>
              Is based on data available at the time of analysis and may not
              reflect recent product reformulations or recalls.
            </li>
            <li>
              Should be treated as a <strong>starting point for your own
              research</strong>, not as a definitive or authoritative source.
            </li>
          </ul>
        </section>

        {/* ── 8. Indemnification ── */}
        <section className="glass-card legal-section">
          <h2>8. Indemnification</h2>
          <p>
            By using SafePlate AI, you agree to indemnify, defend, and hold
            harmless SafePlate AI, its operators, officers, directors, employees,
            and agents from and against any claims, liabilities, damages, losses,
            or expenses (including reasonable legal fees) arising out of or
            related to your use of the service, your violation of these terms, or
            your reliance on information provided by the app.
          </p>
        </section>

        {/* ── 9. Changes to Terms ── */}
        <section className="glass-card legal-section">
          <h2>9. Changes to These Terms</h2>
          <p>
            We may update this disclaimer and terms of service from time to time.
            When we make material changes, we will update the effective date at
            the top of this page and, where appropriate, notify you through the
            app or by email. Your continued use of SafePlate AI after changes
            take effect constitutes acceptance of the updated terms.
          </p>
        </section>

        {/* ── 10. Governing Law ── */}
        <section className="glass-card legal-section">
          <h2>10. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with
            applicable law, without regard to conflict-of-law principles. Any
            disputes arising from or related to these terms or your use of
            SafePlate AI shall be resolved through binding arbitration or in the
            courts of competent jurisdiction.
          </p>
        </section>

        {/* ── 11. Contact ── */}
        <section className="glass-card legal-section">
          <h2>11. Contact Us</h2>
          <p>
            If you have questions about this disclaimer, our terms of service, or
            how your health data is handled, please contact us:
          </p>
          <ul>
            <li>
              <strong>Email:</strong> support@safe-plate.ai
            </li>
          </ul>
        </section>

        <section className="glass-card legal-section">
          <p className="text-muted" style={{ marginBottom: 0 }}>
            By using SafePlate AI, you acknowledge that you have read,
            understood, and agree to be bound by this Medical Disclaimer &amp;
            Terms of Service.
          </p>
        </section>
      </main>
    </>
  )
}
