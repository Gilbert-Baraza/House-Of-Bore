import React from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import policyStyles from "./PolicyPage.module.css";

const PolicyPage = ({ title, intro, sections }) => (
  <section className={policyStyles.policyWrapper}>
    <Container>
      <div className={policyStyles.policyCard}>
        <div className={policyStyles.breadcrumbs}>
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{title}</span>
        </div>
        <span className={policyStyles.eyebrow}>Store Policy</span>
        <h1 className={policyStyles.title}>{title}</h1>
        <p className={policyStyles.intro}>{intro}</p>

        <div className={policyStyles.sectionList}>
          {sections.map((section) => (
            <section key={section.heading} className={policyStyles.sectionCard}>
              <h2>{section.heading}</h2>
              <div className={policyStyles.ruleList}>
                {section.points.map((point) => (
                  <p key={point}>{point}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  </section>
);

export default PolicyPage;
