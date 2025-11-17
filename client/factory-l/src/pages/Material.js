import React from "react";
import { useSelector } from "react-redux";
import classes from "./Material.module.css";
import translate from "../components/translate";
import SEO from "../components/seo/SEO";

const Material = () => {
  const currentLang = useSelector((state) => state.lang.lang);
  const lang = currentLang === 'EN' ? 'EN' : 'KA';

  return (
    <div className={classes.materialsPage}>
      <SEO 
        title={translate('materials.hero.title')}
        description={lang === 'EN'
          ? 'Compare 3D printing materials: PLA, ABS, PETG, TPU, and more. Learn about properties, applications, and choose the right material for your project.'
          : 'შეადარეთ 3D ბეჭდვის მასალები: PLA, ABS, PETG, TPU და სხვა. გაეცანით თვისებებს, გამოყენებას და აირჩიეთ სწორი მასალა თქვენი პროექტისთვის.'
        }
        keywords={lang === 'EN'
          ? '3D printing materials, PLA, ABS, PETG, TPU, material comparison, filament guide'
          : '3D ბეჭდვის მასალები, PLA, ABS, PETG, TPU, მასალების შედარება, ფილამენტის გზამკვლევი'
        }
      />
      {/* Hero Section */}
      <section className={classes.hero}>
        <div className={classes.heroContainer}>
          <h1 className={classes.heroTitle}>{translate("materials.hero.title")}</h1>
          <p className={classes.heroDescription}>{translate("materials.hero.subtitle")}</p>
        </div>
      </section>

      {/* Introduction */}
      <section className={classes.introSection}>
        <div className={classes.container}>
          <h2 className={classes.sectionTitle}>{translate("materials.intro.title")}</h2>
          <p className={classes.introText}>{translate("materials.intro.text")}</p>
        </div>
      </section>

      {/* Materials Grid */}
      <section className={classes.materialsSection}>
        <div className={classes.container}>
          <h2 className={classes.sectionTitle}>{translate("materials.types.title")}</h2>
          
          <div className={classes.materialsGrid}>
            {/* PLA */}
            <div className={classes.materialCard}>
              <div className={`${classes.materialBadge} ${classes.badgePla}`}>PLA</div>
              <h3 className={classes.materialName}>{translate("materials.types.pla.title")}</h3>
              <p className={classes.materialDescription}>{translate("materials.types.pla.description")}</p>
              <div className={classes.materialSpecs}>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.temp")}</span>
                  <span className={classes.specValue}>190-220°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.bed")}</span>
                  <span className={classes.specValue}>50-60°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.difficulty")}</span>
                  <span className={classes.specValue}>{translate("materials.specs.easy")}</span>
                </div>
              </div>
            </div>

            {/* ABS */}
            <div className={classes.materialCard}>
              <div className={`${classes.materialBadge} ${classes.badgeAbs}`}>ABS</div>
              <h3 className={classes.materialName}>{translate("materials.types.abs.title")}</h3>
              <p className={classes.materialDescription}>{translate("materials.types.abs.description")}</p>
              <div className={classes.materialSpecs}>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.temp")}</span>
                  <span className={classes.specValue}>220-250°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.bed")}</span>
                  <span className={classes.specValue}>80-100°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.difficulty")}</span>
                  <span className={classes.specValue}>{translate("materials.specs.medium")}</span>
                </div>
              </div>
            </div>

            {/* PETG */}
            <div className={classes.materialCard}>
              <div className={`${classes.materialBadge} ${classes.badgePetg}`}>PETG</div>
              <h3 className={classes.materialName}>{translate("materials.types.petg.title")}</h3>
              <p className={classes.materialDescription}>{translate("materials.types.petg.description")}</p>
              <div className={classes.materialSpecs}>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.temp")}</span>
                  <span className={classes.specValue}>220-250°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.bed")}</span>
                  <span className={classes.specValue}>70-80°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.difficulty")}</span>
                  <span className={classes.specValue}>{translate("materials.specs.medium")}</span>
                </div>
              </div>
            </div>

            {/* TPU */}
            <div className={classes.materialCard}>
              <div className={`${classes.materialBadge} ${classes.badgeTpu}`}>TPU</div>
              <h3 className={classes.materialName}>{translate("materials.types.tpu.title")}</h3>
              <p className={classes.materialDescription}>{translate("materials.types.tpu.description")}</p>
              <div className={classes.materialSpecs}>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.temp")}</span>
                  <span className={classes.specValue}>210-230°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.bed")}</span>
                  <span className={classes.specValue}>40-60°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.difficulty")}</span>
                  <span className={classes.specValue}>{translate("materials.specs.hard")}</span>
                </div>
              </div>
            </div>

            {/* Nylon */}
            <div className={classes.materialCard}>
              <div className={`${classes.materialBadge} ${classes.badgeNylon}`}>Nylon</div>
              <h3 className={classes.materialName}>{translate("materials.types.nylon.title")}</h3>
              <p className={classes.materialDescription}>{translate("materials.types.nylon.description")}</p>
              <div className={classes.materialSpecs}>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.temp")}</span>
                  <span className={classes.specValue}>240-260°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.bed")}</span>
                  <span className={classes.specValue}>70-100°C</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.difficulty")}</span>
                  <span className={classes.specValue}>{translate("materials.specs.hard")}</span>
                </div>
              </div>
            </div>

            {/* Specialty */}
            <div className={classes.materialCard}>
              <div className={`${classes.materialBadge} ${classes.badgeSpecialty}`}>Specialty</div>
              <h3 className={classes.materialName}>{translate("materials.types.specialty.title")}</h3>
              <p className={classes.materialDescription}>{translate("materials.types.specialty.description")}</p>
              <div className={classes.materialSpecs}>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.temp")}</span>
                  <span className={classes.specValue}>Varies</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.bed")}</span>
                  <span className={classes.specValue}>Varies</span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>{translate("materials.specs.difficulty")}</span>
                  <span className={classes.specValue}>{translate("materials.specs.advanced")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className={classes.comparisonSection}>
        <div className={classes.container}>
          <h2 className={classes.sectionTitle}>{translate("materials.comparison.title")}</h2>
          <div className={classes.comparisonTable}>
            <div className={classes.tableHeader}>
              <div className={classes.tableCell}>{translate("materials.comparison.material")}</div>
              <div className={classes.tableCell}>{translate("materials.comparison.strength")}</div>
              <div className={classes.tableCell}>{translate("materials.comparison.flexibility")}</div>
              <div className={classes.tableCell}>{translate("materials.comparison.temp")}</div>
              <div className={classes.tableCell}>{translate("materials.comparison.best")}</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}><strong>PLA</strong></div>
              <div className={classes.tableCell}>⭐⭐⭐</div>
              <div className={classes.tableCell}>⭐</div>
              <div className={classes.tableCell}>⭐⭐</div>
              <div className={classes.tableCell}>{translate("materials.comparison.pla")}</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}><strong>ABS</strong></div>
              <div className={classes.tableCell}>⭐⭐⭐⭐</div>
              <div className={classes.tableCell}>⭐⭐</div>
              <div className={classes.tableCell}>⭐⭐⭐⭐</div>
              <div className={classes.tableCell}>{translate("materials.comparison.abs")}</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}><strong>PETG</strong></div>
              <div className={classes.tableCell}>⭐⭐⭐⭐</div>
              <div className={classes.tableCell}>⭐⭐</div>
              <div className={classes.tableCell}>⭐⭐⭐⭐</div>
              <div className={classes.tableCell}>{translate("materials.comparison.petg")}</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}><strong>TPU</strong></div>
              <div className={classes.tableCell}>⭐⭐</div>
              <div className={classes.tableCell}>⭐⭐⭐⭐⭐</div>
              <div className={classes.tableCell}>⭐⭐</div>
              <div className={classes.tableCell}>{translate("materials.comparison.tpu")}</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}><strong>Nylon</strong></div>
              <div className={classes.tableCell}>⭐⭐⭐⭐⭐</div>
              <div className={classes.tableCell}>⭐⭐⭐</div>
              <div className={classes.tableCell}>⭐⭐⭐⭐⭐</div>
              <div className={classes.tableCell}>{translate("materials.comparison.nylon")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className={classes.tipsSection}>
        <div className={classes.container}>
          <h2 className={classes.sectionTitle}>{translate("materials.tips.title")}</h2>
          <div className={classes.tipsGrid}>
            <div className={classes.tipCard}>
              <div className={classes.tipIcon}>🌡️</div>
              <h3 className={classes.tipTitle}>{translate("materials.tips.temp.title")}</h3>
              <p className={classes.tipText}>{translate("materials.tips.temp.text")}</p>
            </div>
            <div className={classes.tipCard}>
              <div className={classes.tipIcon}>💧</div>
              <h3 className={classes.tipTitle}>{translate("materials.tips.moisture.title")}</h3>
              <p className={classes.tipText}>{translate("materials.tips.moisture.text")}</p>
            </div>
            <div className={classes.tipCard}>
              <div className={classes.tipIcon}>📏</div>
              <h3 className={classes.tipTitle}>{translate("materials.tips.layer.title")}</h3>
              <p className={classes.tipText}>{translate("materials.tips.layer.text")}</p>
            </div>
            <div className={classes.tipCard}>
              <div className={classes.tipIcon}>🎯</div>
              <h3 className={classes.tipTitle}>{translate("materials.tips.speed.title")}</h3>
              <p className={classes.tipText}>{translate("materials.tips.speed.text")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Material;
