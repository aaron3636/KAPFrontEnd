import { fhirR4 } from "@smile-cdr/fhirts";
import Patient from "./Patient";

export const filterPatients = (
  patients: Patient[],
  filterAttribute: string,
  searchText: string
) => {
  const filteredPatients = patients.filter((patient) => {
    if (filterAttribute === "name") {
      return patient.name?.[0]?.given?.[0]
        .toLowerCase()
        .includes(searchText.toLowerCase());
    } else if (filterAttribute === "family") {
      return patient.name?.[0].family
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
    } else if (filterAttribute === "birthDate") {
      return patient.birthDate
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
    } else if (filterAttribute === "identifier") {
      return patient.identifier?.[0].value
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase());
    } else {
      // Add conditions for other attributes you want to filter by
    }
  });
  return filteredPatients;
};

/**
 * Sorts an array of patients based on the specified sort attribute.
 * @param patients - The array of patients to be sorted.
 * @param sortAttribute - The attribute to sort the patients by ("name", "birthDate", "family", etc.).
 * @returns The sorted array of patients.
 */
export const sortPatients = (patients: Patient[], sortAttribute: string) => {
  /**
   * Gets the value of the specified attribute for a given patient.
   * @param patient - The patient object.
   * @returns The value of the attribute or undefined if not found.
   */
  const getValue = (patient: Patient) => {
    switch (sortAttribute) {
      case "name":
        return patient.name?.[0]?.given?.[0];
      case "birthDate":
        return patient.birthDate;
      case "family":
        return patient.name?.[0]?.family;
      // Add cases for other attributes you want to sort by
      default:
        return undefined;
    }
  };

  return patients.sort((patientOne: Patient, patientTwo: Patient) => {
    const patientOneValue = getValue(patientOne);
    const patientTwoValue = getValue(patientTwo);

    if (patientOneValue === undefined || patientTwoValue === undefined) {
      return 0;
    }

    return patientOneValue.localeCompare(patientTwoValue);
  });
};

/**
 * Renders the patient photos.
 *
 * @param {fhirR4.Patient} patient - The patient object containing photo information.
 * @returns {JSX.Element[]} - An array of JSX elements representing the patient photos.
 */

export const renderPatientPhotos = (patient: fhirR4.Patient) => {
  if (!patient.photo || patient.photo.length === 0) {
    return "No attachment available";
  }
  return patient.photo.map((photo) => {
    const imgSrc = getCachedPhotoUrl(photo);
    return <img key={photo.id} src={imgSrc} alt="Patient Attachement" />;
  });
};

/**
 * Gets the cached photo URL or creates a new cache entry.
 *
 * @param {fhirR4.Attachment} photo - The photo object containing data and content type.
 * @returns {string} - The URL of the cached photo or an empty string if not available.
 */

const getCachedPhotoUrl = (photo: fhirR4.Attachment) => {
  if (!photo || !photo.data) return "";

  const cacheKey = `${photo.id}-${photo.data}`;
  const cachedImage = localStorage.getItem(cacheKey);

  if (cachedImage) {
    return cachedImage;
  } else {
    const image = `data:${photo.contentType};base64,${photo.data}`;
    localStorage.setItem(cacheKey, image);
    return image;
  }
};

/**
 * Generates the patient address element based on the address data.
 *
 * @param patient - The FHIR R4 Patient resource.
 * @returns The address element in a table cell (<td>) format.
 */
export const generatePatientAddress = (patient: fhirR4.Patient) => {
  if (patient.address && patient.address.length > 0) {
    const firstAddress = patient.address[0];
    if (firstAddress.text) {
      // Address is stored as a single text value
      return firstAddress.text;
    } else if (
      firstAddress.line &&
      firstAddress.city &&
      firstAddress.state &&
      firstAddress.postalCode
    ) {
      // Address is stored separately with line, city, state, and postalCode properties
      const { line, city, state, postalCode } = firstAddress;
      const addressString = `${line.join(
        ", "
      )} ${city}, ${state} ${postalCode}`;
      return addressString;
    }
  }
  return "No address available";
};
