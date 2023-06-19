import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fhirR4 } from "@smile-cdr/fhirts";
import { renderPatientPhotos, generatePatientAddress } from "./utils";
import HomeButton from "./HomeButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<fhirR4.Patient | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState<fhirR4.Patient | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/fhir/Patient/${patientId}`
      );
      const data = await response.json();
      //console.log(data);
      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };

  // Function to handle the edit button click
  const handleEdit = () => {
    setIsEditMode(true);
    setEditedPatient(patient);
  };

  // Function to handle the SAVE
  /*
   * (This do nothings till now as the edit capabilty is not yet implemented!).
   * PLEASE DON´T TOUCH THE SAVE ICON :) .
   */
  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/fhir/Patient/${patientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedPatient),
        }
      );
      if (response.ok) {
        // Save operation successful
        setPatient(editedPatient);
        setIsEditMode(false);
      } else {
        // Save operation failed
        console.error("Failed to save patient data");
      }
    } catch (error) {
      console.error("Error saving patient data:", error);
    }
  };

  // Function to handle DELETE
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/fhir/Patient/${patientId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log(response);
        // Delete operation successful
        navigate(`/patient`);
      } else {
        // Delete operation failed
        console.error("Failed to delete patient");
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  // Render patient details
  const renderPatientDetails = () => {
    if (!patient) {
      return <p className="text-gray-500 text-lg">Loading...</p>;
    }

    return (
      <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Patient Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm mb-2">
              <span className="font-semibold">ID:</span> {patient.id}
            </p>
            <p className="text-sm mb-2">
              <span className="font-semibold">Name:</span>{" "}
              {patient.name?.[0]?.given}
            </p>
            <p className="text-sm mb-2">
              <span className="font-semibold">Family Name:</span>{" "}
              {patient.name?.[0]?.family}
            </p>
            <p className="text-sm mb-2">
              <span className="font-semibold">Gender:</span> {patient.gender}
            </p>
            <p className="text-sm mb-2">
              <span className="font-semibold">Birthdate:</span>{" "}
              {patient.birthDate}
            </p>
          </div>
          <div>
            <p className="text-sm mb-2">
              <span className="font-semibold">Phone:</span>{" "}
              {patient.telecom?.[0]?.value === undefined ? (
                <span className="text-gray-400">None</span>
              ) : (
                patient.telecom?.[0]?.value
              )}
            </p>
            <p className="text-sm mb-2">
              <span className="font-semibold">E-mail:</span>{" "}
              {patient.telecom?.[1]?.value === undefined ? (
                <span className="text-gray-400">None</span>
              ) : (
                patient.telecom?.[1]?.value
              )}
            </p>
            <p className="text-sm mb-2">
              <span className="font-semibold">Address:</span>{" "}
              {generatePatientAddress(patient)}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <span className="font-semibold">Attachments:</span>{" "}
          {renderPatientPhotos(patient)}
        </div>
        {isEditMode ? (
          <div className="flex justify-center mt-4">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={handleSave}
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Save
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleDelete}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Delete
            </button>
          </div>
        ) : (
          <div className="flex justify-center mt-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleEdit}
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit
            </button>
          </div>
        )}
        {/* Render other patient details */}
      </div>
    );
  };

  return (
    <div>
      <div>
        <HomeButton />
      </div>
      <div className="flex justify-center h-auto p-10 bg-sky-800 text-4xl text-white mb-10 overflow-x-auto">
        <div className="max-w-full md:max-w-[80%] lg:max-w-[70%]">
          {patient?.name?.[0]?.given + " " + patient?.name?.[0]?.family}
        </div>
      </div>
      <div className="flex items-center justify-center min-h-screen">
        {renderPatientDetails()}
      </div>
    </div>
  );
};

export default PatientDetails;
