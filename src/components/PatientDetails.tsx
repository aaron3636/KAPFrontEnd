import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fhirR4 } from "@smile-cdr/fhirts";
import { renderPatientPhotos, generatePatientAddress } from "./utils";
import HomeButton from "./HomeButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<fhirR4.Patient | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState(patient);
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
      console.log(data);
      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };

  // Function to handle the edit button click
  const handleEdit = () => {
    setIsEditMode(true);
  };

  // TODO: Function to handle the save button click when editing patient data
  const handleSave = () => {
    // Perform the save operation on the server
    // Update the patient data using an API call
    // Assuming the save operation is successful, update the patient state
    setPatient(editedPatient);
    setIsEditMode(false);
  };

  // TODO: Function to handle the delete button click
  const handleDelete = () => {
    // Perform the delete operation on the server
    // Delete the patient data using an API call or other method
    // Assuming the delete operation is successful, navigate back to the patient List.
    navigate(`/patient`);
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
        <div className="flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 items-center"
            onClick={handleEdit}
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit
          </button>
        </div>
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
