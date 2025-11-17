import React from "react";
import { useSelector } from "react-redux";
import classes from "./About.module.css";
import translate from "../components/translate";
import SEO from "../components/seo/SEO";
import { OrganizationStructuredData } from "../components/seo/StructuredData";

const About = () => {
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);
  const lang = currentLang === 'EN' ? 'EN' : 'KA';

  return (
    <div className={classes.aboutPage}>
      <SEO 
        title={translate('about.hero.title')}
        description={lang === 'EN'
          ? 'Learn about Makers Hub - your trusted 3D printing partner in Georgia. Discover our story, values, and commitment to quality.'
          : 'გაეცანით Makers Hub-ს - თქვენს საიმედო 3D ბეჭდვის პარტნიორს საქართველოში. გაიგეთ ჩვენი ისტორია, ღირებულებები და ხარისხისადმი მოთხოვნილება.'
        }
        keywords={lang === 'EN'
          ? 'about us, 3D printing company, Georgia, our story, values'
          : 'ჩვენს შესახებ, 3D ბეჭდვის კომპანია, საქართველო, ჩვენი ისტორია, ღირებულებები'
        }
      />
      <OrganizationStructuredData />
      {/* Hero Section */}
      <section className={classes.hero}>
        <div className={classes.heroContent}>
          <h1 className={classes.heroTitle}>{translate("about.hero.title")}</h1>
          <p className={classes.heroSubtitle}>{translate("about.hero.subtitle")}</p>
        </div>
      </section>

      {/* Story Section */}
      <section className={classes.section}>
        <div className={classes.container}>
          <div className={classes.contentWrapper}>
            <div className={classes.textContent}>
              <h2 className={classes.sectionTitle}>{translate("about.story.title")}</h2>
              <p className={classes.paragraph}>{translate("about.story.paragraph1")}</p>
              <p className={classes.paragraph}>{translate("about.story.paragraph2")}</p>
            </div>
            <div className={classes.imagePlaceholder}>
              <div className={classes.iconWrapper}>🏭</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={`${classes.section} ${classes.sectionAlt}`}>
        <div className={classes.container}>
          <h2 className={classes.sectionTitle}>{translate("about.mission.title")}</h2>
          <div className={classes.missionGrid}>
            <div className={classes.missionCard}>
              <div className={classes.cardIcon}>🤝</div>
              <h3 className={classes.cardTitle}>{translate("about.mission.collaboration.title")}</h3>
              <p className={classes.cardText}>{translate("about.mission.collaboration.text")}</p>
            </div>
            <div className={classes.missionCard}>
              <div className={classes.cardIcon}>🏠</div>
              <h3 className={classes.cardTitle}>{translate("about.mission.local.title")}</h3>
              <p className={classes.cardText}>{translate("about.mission.local.text")}</p>
            </div>
            <div className={classes.missionCard}>
              <div className={classes.cardIcon}>⚡</div>
              <h3 className={classes.cardTitle}>{translate("about.mission.easy.title")}</h3>
              <p className={classes.cardText}>{translate("about.mission.easy.text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={classes.section}>
        <div className={classes.container}>
          <h2 className={classes.sectionTitle}>{translate("about.values.title")}</h2>
          <div className={classes.valuesGrid}>
            <div className={classes.valueCard}>
              <div className={classes.valueIcon}>🌱</div>
              <h3 className={classes.valueTitle}>{translate("about.values.eco.title")}</h3>
              <p className={classes.valueText}>{translate("about.values.eco.text")}</p>
            </div>
            <div className={classes.valueCard}>
              <div className={classes.valueIcon}>💡</div>
              <h3 className={classes.valueTitle}>{translate("about.values.innovation.title")}</h3>
              <p className={classes.valueText}>{translate("about.values.innovation.text")}</p>
            </div>
            <div className={classes.valueCard}>
              <div className={classes.valueIcon}>❤️</div>
              <h3 className={classes.valueTitle}>{translate("about.values.quality.title")}</h3>
              <p className={classes.valueText}>{translate("about.values.quality.text")}</p>
            </div>
            <div className={classes.valueCard}>
              <div className={classes.valueIcon}>🌍</div>
              <h3 className={classes.valueTitle}>{translate("about.values.community.title")}</h3>
              <p className={classes.valueText}>{translate("about.values.community.text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className={`${classes.section} ${classes.sectionAlt}`}>
        <div className={classes.container}>
          <h2 className={classes.sectionTitle}>{translate("about.impact.title")}</h2>
          <div className={classes.impactList}>
            <div className={classes.impactItem}>
              <div className={classes.impactNumber}>01</div>
              <div className={classes.impactContent}>
                <h3 className={classes.impactTitle}>{translate("about.impact.daily.title")}</h3>
                <p className={classes.impactText}>{translate("about.impact.daily.text")}</p>
              </div>
            </div>
            <div className={classes.impactItem}>
              <div className={classes.impactNumber}>02</div>
              <div className={classes.impactContent}>
                <h3 className={classes.impactTitle}>{translate("about.impact.customization.title")}</h3>
                <p className={classes.impactText}>{translate("about.impact.customization.text")}</p>
              </div>
            </div>
            <div className={classes.impactItem}>
              <div className={classes.impactNumber}>03</div>
              <div className={classes.impactContent}>
                <h3 className={classes.impactTitle}>{translate("about.impact.accessibility.title")}</h3>
                <p className={classes.impactText}>{translate("about.impact.accessibility.text")}</p>
              </div>
            </div>
            <div className={classes.impactItem}>
              <div className={classes.impactNumber}>04</div>
              <div className={classes.impactContent}>
                <h3 className={classes.impactTitle}>{translate("about.impact.sustainability.title")}</h3>
                <p className={classes.impactText}>{translate("about.impact.sustainability.text")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={classes.ctaSection}>
        <div className={classes.container}>
          <h2 className={classes.ctaTitle}>{translate("about.cta.title")}</h2>
          <p className={classes.ctaText}>{translate("about.cta.text")}</p>
        </div>
      </section>
    </div>
  );
};

export default About;
