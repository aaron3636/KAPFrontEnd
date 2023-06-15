import React, { useState, useEffect } from "react";
import { fhirR4 } from "@smile-cdr/fhirts";

// Assuming you have defined appropriate types for Identifier, HumanName, Address, and Contact

interface BundleEntry {
  resource: fhirR4.Patient;
  // Define other properties of the Bundle entry if needed ---> Extensions if needed
}

interface Patient extends fhirR4.Patient {
  identifier?: fhirR4.Identifier[];
  name?: fhirR4.HumanName[];
  birthDate?: string;
}

const PatientList: React.FC = () => {
  // State variables
  const [patients, setPatients] = useState<fhirR4.Patient[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterAttribute, setFilterAttribute] = useState("");
  const [sortAttribute, setSortAttribute] = useState("");

  // Fetch patients when the component mounts
  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch patients from the Server
  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:8080/fhir/Patient"); // Replace with your API endpoint
      const data = await response.json();

      // Extract the resource property from the Bundle entry
      const patientsData = data.entry.map(
        (entry: BundleEntry) => entry.resource
      );
      // Store the extracted patients in state
      setPatients(patientsData);
      //console.log(patientsData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  // Filter patients based on the selected attribute and search text
  const filterPatients = () => {
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
  const sortPatients = (patients: Patient[], sortAttribute: string) => {
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

  const filterAndSortPatients = () => {
    const filteredPatients = filterPatients();
    const sortedPatients = sortPatients(filteredPatients, sortAttribute);
    return sortedPatients;
  };

  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };
  // Handle attributes selection change
  const handleFilterAttributeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterAttribute(event.target.value);
  };
  const handleSortAttributeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSortAttribute(event.target.value);
  };

  // Refresh the patient data by fetching patients again
  const handleRefresh = () => {
    fetchPatients(); // Fetch patients again to refresh the data
  };

  /**
   * Renders the patient photos.
   *
   * @param {fhirR4.Patient} patient - The patient object containing photo information.
   * @returns {JSX.Element[]} - An array of JSX elements representing the patient photos.
   */
  const renderPatientPhotos = (patient: fhirR4.Patient) => {
    if (!patient.photo || patient.photo.length === 0) {
      return <td>No attachment available</td>;
    }
    return patient.photo.map((photo) => {
      const imgSrc = getCachedPhotoUrl(photo);
      return <img key={photo.id} src={imgSrc} alt="Patient Photo" />;
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

  // Generate the patient address based on the address data
  const generatePatientAddress = (patient: fhirR4.Patient) => {
    if (patient.address && patient.address.length > 0) {
      const firstAddress = patient.address[0];
      if (firstAddress.text) {
        // Address is stored as a single text value
        return <td>{firstAddress.text}</td>;
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
        return <td>{addressString}</td>;
      }
    }
    return <td>No address available</td>;
  };

  return (
    <div>
      <div className="flex justify-center p-10 bg-sky-800 text-4xl text-white mb-10">
        What are you looking for?
      </div>
      <div className="flex items-center mb-4 font-mono md:font-mono text-lg/5 md:text-lg/5 justify-center">
        <select
          className="rounded border-b-2 mr-2 font-mono md:font-mono text-lg/5 md:text-lg/5"
          value={filterAttribute}
          onChange={handleFilterAttributeChange}
        >
          <option value="">Search by</option>
          <option value="name">Name</option>
          <option value="family">Family Name</option>
          <option value="birthDate">Birth Date</option>
          <option value="identifier">Identifier</option>
          {/* Add options for other attributes */}
        </select>
        <select
          className="rounded border-b-2 mr-2 font-mono md:font-mono text-lg/5 md:text-lg/5"
          value={sortAttribute}
          onChange={handleSortAttributeChange}
        >
          <option value="">Sort by</option>
          <option value="name">Name</option>
          <option value="family">Family Name</option>
          <option value="birthDate">Birth Date</option>
          {/* Add options for other attributes */}
        </select>
        <input
          className="rounded border-b-2 mr-2"
          type="text"
          value={searchText}
          onChange={handleSearch}
          placeholder="Search"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Identifier
            </th>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Active
            </th>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Vorname
            </th>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Nachname
            </th>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Gender
            </th>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Birthday
            </th>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Phone
            </th>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Email
            </th>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Adresse
            </th>
            <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
              Attachement
            </th>
          </tr>
        </thead>
        <tbody>
          {filterAndSortPatients().map((patient) => (
            <tr key={patient.id}>
              <td className="p-4 font-mono md:font-mono text-lg/2 md:text-lg/2 whitespace-nowrap">
                {patient.identifier?.[0]?.value === undefined ? (
                  <div className="flex items-center justify-center h-full">
                    Nun
                  </div>
                ) : (
                  patient.identifier?.[0]?.value
                )}
              </td>
              <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                {patient.active ? "aktiv" : "inaktiv"}
              </td>
              <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                {patient.name?.[0]?.given}
              </td>
              <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                {patient.name?.[0]?.family}
              </td>
              <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                {patient.gender}
              </td>
              <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                {patient.birthDate}
              </td>
              {/* Phone */}
              <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                {patient.telecom?.[0]?.value === undefined ? (
                  <div className="flex items-center justify-center h-full">
                    Nun
                  </div>
                ) : (
                  patient.telecom?.[0]?.value
                )}
              </td>
              {/* Mail */}
              <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                {patient.telecom?.[1]?.value === undefined ? (
                  <div className="flex items-center justify-center h-full">
                    Nun
                  </div>
                ) : (
                  patient.telecom?.[1]?.value
                )}
              </td>
              <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                {generatePatientAddress(patient)}
              </td>
              <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5 h-auto max-w-sm hover:shadow-lg dark:shadow-black/30">
                {renderPatientPhotos(patient)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;
