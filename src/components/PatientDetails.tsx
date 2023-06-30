import { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { fhirR4 } from "@smile-cdr/fhirts";
import { renderPatientPhotos, generatePatientAddress } from "./utils";
import HomeButton from "./HomeButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import EditPatientForm from "./EditPatientForm";
import BundleEntry from "./BundleEntry";
import {
  filterMedia,
  sortMedia,
} from "./utils";

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<fhirR4.Patient | null>(null);
  const [media, setMedia] = useState<fhirR4.Media[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterAttribute, setFilterAttribute] = useState("identifier");
  const [sortAttribute, setSortAttribute] = useState("");
  const [mediaPerPage, setMediaPerPage] = useState(20);
  const [offsetMediaPerPage, setoffsetMediaPerPage] = useState(0);
  const [editedPatient, setEditedPatient] = useState<fhirR4.Patient>(
    {} as fhirR4.Patient
  );

  const navigate = useNavigate();

  useEffect(() => {
    fetchPatient();
    fetchMedia();
}, [patientId, mediaPerPage, offsetMediaPerPage]);

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

  const fetchMedia = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/fhir/Media?subject=${patientId}&_count=${mediaPerPage}&_offset=${offsetMediaPerPage}`
      );
      const data = await response.json();
      const patientsData = data.entry.map(
        (entry: BundleEntry) => entry.resource
      );

      console.log(patientsData);
      setMedia(patientsData);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };

  // Function to handle the edit button click
  const handleEdit = () => {
    setIsEditMode(true);
    if (patient) {
      setEditedPatient(patient);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // Function to handle the SAVE
  /*
   * (This do nothings till now as the edit capabilty is not yet implemented!).
   * PLEASE DON´T TOUCH THE SAVE ICON :) .
   */
  const handleSave = async (
    event: FormEvent,
    editedPatient: fhirR4.Patient
  ) => {
    event.preventDefault();
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
        setPatient(editedPatient);
        setIsEditMode(false);
      } else {
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
        navigate(`/patient`);
      } else {
        console.error("Failed to delete patient");
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };


  const handleClick = async (patientId: string | undefined) => {
    
    if (patientId) {
      // Navigate to the patient detail page with the patientId as a parameter
      navigate(`/AddMedia/${patientId}`);
    }

  }

  const filterAndSortMedia = () => {
    const filteredPatients = filterMedia(
      media,
      filterAttribute,
      searchText
    );
    const sortedPatients = sortMedia(filteredPatients, sortAttribute);
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
    fetchMedia(); // Fetch patients again to refresh the data
  };



  // Render patient details
  const renderPatientDetails = () => {
    if (!patient) {
      return <p className="text-gray-500 text-lg">Loading...</p>;
    }
    if (isEditMode) {
      return (
        <EditPatientForm
          patient={patient}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      );
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
              onClick={(event) => handleSave(event, editedPatient)}
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Save
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
            <button
              className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleDelete}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Delete
            </button>
          </div>
        )}
        {/* Render other patient details */}
      </div>
  
    );
  };


  const handleMediaPerPageChange = (value: string) => {
    const parsedValue = parseInt(value, 10);
    setMediaPerPage(parsedValue);
  };

  const handleOffsetMediaPerPageChange = (value: number) => {
    if (value < 0) {
      value = 0;
    }
    console.log(value);
    setoffsetMediaPerPage(value);
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
      <div className="flex justify-center">
        {renderPatientDetails()} 
      </div>
      <div className="flex justify-center">
        
      </div>

      <div className="flex justify-center">
        <h1 className="text-2xl font-bold m-4">Patient Media</h1>

        <button 
          onClick={() => handleClick(patient?.id)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 m-4 rounded text-lg ">
            Add Media
        </button>
      </div>


<div>
      <div className="flex flex-wrap items-center mb-4 font-mono md:font-mono text-lg/5 md:text-lg/5 justify-center">
        <select
          className="rounded border-b-2 mr-2 font-mono md:font-mono text-lg/5 md:text-lg/5 mb-2 md:mb-0"
          value={filterAttribute}
          onChange={handleFilterAttributeChange}
        >
          <option value="">Search by</option>
          <option value="identifier">Identifier</option>
          <option value="status">Status</option>
          <option value="type">Type of Media</option>
          <option value="dateTime">Date Time</option>
          <option value="bodySite">Body Site</option>
          {/* Add options for other attributes */}
        </select>
        <select
          className="rounded border-b-2 mr-2 font-mono md:font-mono text-lg/5 md:text-lg/5 mb-2 md:mb-0"
          value={sortAttribute}
          onChange={handleSortAttributeChange}
        >
          <option value="">Sort by</option>
          <option value="identifier">Identifier</option>
          <option value="status">Status</option>
          <option value="type">Type of Media</option>
          <option value="dateTime">Date Time</option>
          <option value="bodySite">Body Site</option>
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

        <div className="flex flex-wrap items-center mb-4 font-mono md:font-mono text-lg/5 md:text-lg/5 justify-center">
            <div className="ml-4">
          <label htmlFor="numberSelect">Media per Page:</label>
            <select id="numberSelect" onChange={(e) => handleMediaPerPageChange(e.target.value)} defaultValue={"20"}>
              <option value="">Select a number</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              
              {/* Add more options if needed */}
            </select>
          </div>


          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
            onClick={() => handleOffsetMediaPerPageChange(offsetMediaPerPage - mediaPerPage)}
          >
            Prev {mediaPerPage} Media
          </button>


          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
            onClick={() => handleOffsetMediaPerPageChange(offsetMediaPerPage + mediaPerPage)}
          >
            Next {mediaPerPage} Media
          </button>

   

        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                Identifier
              </th>
              <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                Status
              </th>
              <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                Type
              </th>
              <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                Date Time
              </th>
              <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                Body Site
              </th>
              <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                Note
              </th>
              <th className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                Content
              </th>
            </tr>
          </thead>
          <tbody>
            {filterAndSortMedia().map((image) => (
              <tr
                key={image.id}
                className="cursor-pointer hover:bg-gray-100"
              >
                <td className="p-4 font-mono md:font-mono text-lg/2 md:text-lg/2 whitespace-nowrap">
                  {image.identifier?.[0]?.value === undefined ? (
                    <div className="flex items-center justify-center h-full">
                      Nun
                    </div>
                  ) : (
                    image.identifier?.[0]?.value
                  )}
                </td>
                <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                  {image.status}
                </td>
                <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                  {image.type?.coding?.[0]?.code}
                </td>
                <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                  {image.createdDateTime}
                </td>
                <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5">
                  {image.bodySite?.coding?.[0]?.code}
                </td>
                <td className="p-4 font-mono md:font-mono text-lg/5 md:text-lg/5 whitespace-nowrap">
                  {image.note?.[0]?.text}
                </td>
               { <td className="p-4 flex justify-center font-mono md:font-mono text-lg/5 md:text-lg/5 h-auto max-w-sm hover:shadow-lg dark:shadow-black/30">
                      <div
                        key={image.id}
                        className="w-20 h-20 bg-gray-400 rounded-lg overflow-hidden mx-1 my-1 cursor-pointer"
                        >
                      <img
                        src={`data:${image.content.contentType};base64,${image.content.data}`}
                        alt="Patient Attachment"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


  
    </div>
  );
};

export default PatientDetails;
