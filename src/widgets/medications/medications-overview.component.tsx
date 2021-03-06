import React from "react";
import SummaryCard from "../../ui-components/cards/summary-card.component";
import { fetchPatientMedications } from "./medications.resource";
import styles from "./medications-overview.css";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../../ui-components/cards/summary-card-footer.component";
import { useTranslation } from "react-i18next";
import { getDosage } from "./medication-orders-utils";
import { Link } from "react-router-dom";
import MedicationOrderBasket from "./medication-order-basket.component";
import { MedicationButton } from "./medication-button.component";

export default function MedicationsOverview(props: MedicationsOverviewProps) {
  const [patientMedications, setPatientMedications] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  const { t } = useTranslation();

  React.useEffect(() => {
    if (patientUuid) {
      const subscription = fetchPatientMedications(patientUuid).subscribe(
        Medications => setPatientMedications(Medications),
        createErrorHandler()
      );
      return () => subscription.unsubscribe();
    }
  }, [patientUuid]);

  return (
    <SummaryCard
      name={t("Active Medications", "Active Medications")}
      styles={{ width: "100%" }}
      link={`/patient/${patientUuid}/chart/Medications`}
    >
      <table className={styles.medicationsTable}>
        <tbody>{patientMedications && parseRestWsMeds()}</tbody>
      </table>
      <SummaryCardFooter linkTo={`/patient/${patientUuid}/chart/Medications`} />
    </SummaryCard>
  );

  function parseFhirMeds() {
    patientMedications.map((medication, index) => {
      return (
        <React.Fragment key={medication.id}>
          {medication.status === "active" && (
            <tr>
              <td>
                <span
                  style={{
                    fontWeight: 500,
                    color: "var(--omrs-color-ink-high-contrast)"
                  }}
                >
                  {medication.medicationReference.display}
                </span>
                {" \u2014 "} {medication.dosageInstruction[0].route.text}{" "}
                {" \u2014 "}
                {medication.dosageInstruction[0].doseQuantity.unit} {" \u2014 "}
                DOSE{" "}
                <span
                  style={{
                    fontWeight: 500,
                    color: "var(--omrs-color-ink-high-contrast)"
                  }}
                >
                  {medication.dosageInstruction[0].doseQuantity.value}{" "}
                  {medication.dosageInstruction[0].doseQuantity.unit}{" "}
                  {medication.dosageInstruction[0].timing.code.text}
                </span>
              </td>
              <td style={{ textAlign: "end" }}>
                <Link to={`/patient/${patientUuid}/chart/medications`}>
                  <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                    <use xlinkHref="#omrs-icon-chevron-right" />
                  </svg>
                </Link>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    });
  }

  function parseRestWsMeds() {
    return patientMedications.map((medication, index) => {
      return (
        <React.Fragment key={medication.uuid}>
          <tr>
            <td>
              <span
                style={{
                  fontWeight: 500,
                  color: "var(--omrs-color-ink-high-contrast)"
                }}
              >
                {medication.drug.name}
              </span>
              {" \u2014 "}&nbsp;
              <span className={styles.medicationStatement}>
                {medication.doseUnits.display}
              </span>
              &nbsp;
              {" \u2014 "}
              <span className={styles.medicationStatement}>
                {medication.route.display}&nbsp;
              </span>
              <span style={{ color: "var(--omrs-color-ink-medium-contrast)" }}>
                {" "}
                DOSE
              </span>
              &nbsp;&nbsp;&nbsp;
              <span
                style={{
                  fontWeight: 500,
                  color: "var(--omrs-color-ink-high-contrast)"
                }}
                className={styles.medicationStatement}
              >
                {getDosage(medication.drug.strength, medication.dose)}
              </span>
              <span
                style={{
                  fontWeight: 400,
                  color: "var(--omrs-color-ink-high-contrast)"
                }}
              >
                {" \u2014 "}
                {medication.frequency.display}
              </span>
            </td>
            <td>
              <MedicationButton
                component={MedicationOrderBasket}
                name={"Medication Order Basket"}
                label={"REVISE"}
                orderUuid={medication.uuid}
                drugName={medication.drug.name}
                action={"REVISE"}
                inProgress={true}
              />
              <MedicationButton
                component={MedicationOrderBasket}
                name={"Medication Order Basket"}
                label={"DISCONTINUE"}
                orderUuid={medication.uuid}
                drugName={null}
                action={"DISCONTINUE"}
                inProgress={true}
              />
            </td>
            <td style={{ textAlign: "end" }}>
              <Link to={`/patient/${patientUuid}/chart/medications`}>
                <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                  <use xlinkHref="#omrs-icon-chevron-right" />
                </svg>
              </Link>
            </td>
          </tr>
        </React.Fragment>
      );
    });
  }
}

type MedicationsOverviewProps = {};
